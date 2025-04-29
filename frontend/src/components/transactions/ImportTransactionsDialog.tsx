import { useState } from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertCircle, FileText, Upload } from 'lucide-react';

interface Account {
  id: string;
  name: string;
}

interface ImportTransactionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (accountId: string, transactions: any[]) => void;
  accounts: Account[];
}

const ImportTransactionsDialog = ({
  isOpen,
  onClose,
  onImport,
  accounts
}: ImportTransactionsDialogProps) => {
  const [selectedAccount, setSelectedAccount] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'csv' | 'json'>('csv');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      setFile(null);
      setPreview([]);
      return;
    }

    setFile(selectedFile);
    setError(null);

    // Determine file type from extension
    const extension = selectedFile.name.split('.').pop()?.toLowerCase();
    if (extension === 'json') {
      setFileType('json');
      parseJsonFile(selectedFile);
    } else if (extension === 'csv') {
      setFileType('csv');
      parseCsvFile(selectedFile);
    } else {
      setError('Unsupported file type. Please upload a CSV or JSON file.');
      setFile(null);
      setPreview([]);
    }
  };

  const parseJsonFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        const transactions = Array.isArray(json) ? json : [];
        
        // Validate transactions
        if (transactions.length === 0) {
          setError('No transactions found in the JSON file.');
          setPreview([]);
          return;
        }

        // Show preview of first 3 transactions
        setPreview(transactions.slice(0, 3));
      } catch (error) {
        console.error('Error parsing JSON:', error);
        setError('Invalid JSON format. Please check your file and try again.');
        setPreview([]);
      }
    };
    reader.readAsText(file);
  };

  const parseCsvFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split(/\r?\n/);
        
        if (lines.length <= 1) {
          setError('No transactions found in the CSV file.');
          setPreview([]);
          return;
        }

        const headers = lines[0].split(',').map(header => header.trim());
        const transactions = [];

        // Parse CSV rows into transactions
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          const values = lines[i].split(',').map(value => value.trim());
          const transaction: any = {};
          
          headers.forEach((header, index) => {
            if (values[index] !== undefined) {
              // Map CSV headers to transaction properties
              const key = mapHeaderToProperty(header);
              if (key) {
                transaction[key] = values[index];
              }
            }
          });

          // Convert amount to number
          if (transaction.amount) {
            transaction.amount = parseFloat(transaction.amount);
          }

          // Convert date to ISO string
          if (transaction.date) {
            try {
              transaction.date = new Date(transaction.date).toISOString();
            } catch (error) {
              console.warn('Could not parse date:', transaction.date);
            }
          }

          transactions.push(transaction);
        }

        // Show preview of first 3 transactions
        setPreview(transactions.slice(0, 3));
      } catch (error) {
        console.error('Error parsing CSV:', error);
        setError('Invalid CSV format. Please check your file and try again.');
        setPreview([]);
      }
    };
    reader.readAsText(file);
  };

  const mapHeaderToProperty = (header: string): string | null => {
    // Map common CSV headers to transaction properties
    const headerMap: Record<string, string> = {
      'date': 'date',
      'amount': 'amount',
      'description': 'description',
      'payee': 'payee',
      'category': 'category',
      'memo': 'description',
      'transaction date': 'date',
      'transaction amount': 'amount',
      'transaction description': 'description',
      'merchant': 'payee',
      'vendor': 'payee',
      'type': 'category'
    };

    const normalizedHeader = header.toLowerCase();
    return headerMap[normalizedHeader] || null;
  };

  const handleImport = async () => {
    if (!selectedAccount) {
      setError('Please select an account.');
      return;
    }

    if (!file) {
      setError('Please upload a file.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Read the file and parse transactions
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          let transactions: any[] = [];

          if (fileType === 'json') {
            transactions = JSON.parse(e.target?.result as string);
            if (!Array.isArray(transactions)) {
              throw new Error('JSON file must contain an array of transactions.');
            }
          } else {
            // CSV parsing
            const csv = e.target?.result as string;
            const lines = csv.split(/\r?\n/);
            
            if (lines.length <= 1) {
              throw new Error('No transactions found in the CSV file.');
            }

            const headers = lines[0].split(',').map(header => header.trim());
            
            for (let i = 1; i < lines.length; i++) {
              if (!lines[i].trim()) continue;
              
              const values = lines[i].split(',').map(value => value.trim());
              const transaction: any = {};
              
              headers.forEach((header, index) => {
                if (values[index] !== undefined) {
                  const key = mapHeaderToProperty(header);
                  if (key) {
                    transaction[key] = values[index];
                  }
                }
              });

              // Convert amount to number
              if (transaction.amount) {
                transaction.amount = parseFloat(transaction.amount);
              }

              // Convert date to ISO string
              if (transaction.date) {
                try {
                  transaction.date = new Date(transaction.date).toISOString();
                } catch (error) {
                  console.warn('Could not parse date:', transaction.date);
                  transaction.date = new Date().toISOString();
                }
              } else {
                transaction.date = new Date().toISOString();
              }

              // Set required fields if missing
              if (!transaction.description) {
                transaction.description = 'Imported transaction';
              }

              if (!transaction.payee) {
                transaction.payee = 'Unknown';
              }

              if (!transaction.category) {
                transaction.category = 'Uncategorized';
              }

              transactions.push(transaction);
            }
          }

          // Call the onImport callback with the parsed transactions
          onImport(selectedAccount, transactions);
          onClose();
        } catch (error) {
          console.error('Error processing file:', error);
          setError(`Error processing file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
          setIsLoading(false);
        }
      };

      reader.onerror = () => {
        setError('Error reading file. Please try again.');
        setIsLoading(false);
      };

      reader.readAsText(file);
    } catch (error) {
      console.error('Error importing transactions:', error);
      setError(`Error importing transactions: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import Transactions</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="account" className="text-right">
              Account
            </Label>
            <div className="col-span-3">
              <Select
                value={selectedAccount}
                onValueChange={setSelectedAccount}
              >
                <SelectTrigger id="account">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="file" className="text-right">
              File
            </Label>
            <div className="col-span-3">
              <Input
                id="file"
                type="file"
                accept=".csv,.json"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Upload a CSV or JSON file containing transactions.
              </p>
            </div>
          </div>

          {error && (
            <div className="col-span-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}

          {preview.length > 0 && (
            <div className="col-span-4 mt-4">
              <h3 className="font-medium mb-2">Preview:</h3>
              <div className="border rounded-md p-4 bg-muted/30">
                {preview.map((transaction, index) => (
                  <div key={index} className="mb-2 pb-2 border-b last:border-0 last:mb-0 last:pb-0">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">{transaction.payee || 'Unknown Payee'}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.date ? formatDate(transaction.date) : 'No date'} • {transaction.category || 'Uncategorized'}
                        </p>
                      </div>
                      <p className={`font-medium ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.amount !== undefined ? formatAmount(transaction.amount) : 'No amount'}
                      </p>
                    </div>
                  </div>
                ))}
                <p className="text-sm text-muted-foreground mt-2">
                  {file ? `${file.name} - Showing ${preview.length} of ${preview.length} transactions` : ''}
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={!selectedAccount || !file || isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>Processing...</>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Import Transactions
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportTransactionsDialog;
