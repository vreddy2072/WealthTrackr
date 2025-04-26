import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../ui/table';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Edit, MoreVertical, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { format as formatDateFns } from 'date-fns';

// Define a safe format function
const formatDate = (date: Date | string, formatStr: string): string => {
  try {
    return formatDateFns(new Date(date), formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return String(date);
  }
};

interface Transaction {
  id: string;
  accountId: string;
  accountName: string;
  date: string;
  amount: number;
  payee: string;
  category: string;
  description: string;
  isReconciled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Account {
  id: string;
  name: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: Partial<Transaction>) => void;
  accounts: Account[];
  categories: string[];
}

const TransactionList = ({
  transactions,
  onDelete,
  onUpdate,
  accounts,
  categories
}: TransactionListProps) => {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Transaction>>({});

  const handleEditClick = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setEditFormData({
      accountId: transaction.accountId,
      date: transaction.date.split('T')[0], // Format date for input
      amount: transaction.amount,
      payee: transaction.payee,
      category: transaction.category,
      description: transaction.description,
      isReconciled: transaction.isReconciled
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setTransactionToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (transactionToDelete) {
      onDelete(transactionToDelete);
      setIsDeleteDialogOpen(false);
      setTransactionToDelete(null);
    }
  };

  const handleSaveEdit = () => {
    if (editingTransaction && editFormData) {
      onUpdate(editingTransaction.id, editFormData);
      setIsEditDialogOpen(false);
      setEditingTransaction(null);
      setEditFormData({});
    }
  };

  const handleToggleReconciled = (id: string, currentValue: boolean) => {
    onUpdate(id, { isReconciled: !currentValue });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      signDisplay: 'auto'
    }).format(amount);
  };

  const formatDateString = (dateString: string) => {
    try {
      // Format date as MMM D, YYYY (e.g., Apr 15, 2025)
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString.split('T')[0]; // Fallback to ISO date part
    }
  };

  // Log the transactions for debugging
  console.log('TransactionList received transactions:', transactions);

  return (
    <div>
      {!transactions || transactions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No transactions found matching your criteria.
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Payee</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <Checkbox
                      checked={transaction.isReconciled}
                      onCheckedChange={() => handleToggleReconciled(transaction.id, transaction.isReconciled)}
                    />
                  </TableCell>
                  <TableCell>{formatDateString(transaction.date)}</TableCell>
                  <TableCell>{transaction.accountName}</TableCell>
                  <TableCell>{transaction.payee}</TableCell>
                  <TableCell>{transaction.category}</TableCell>
                  <TableCell className={`text-right font-medium ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(transaction.amount)}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          console.log('Edit button clicked for transaction:', transaction.id);
                          handleEditClick(transaction);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-800 hover:bg-red-100"
                        onClick={() => {
                          console.log('Delete button clicked for transaction:', transaction.id);
                          handleDeleteClick(transaction.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={transaction.isReconciled ? "text-green-600" : "text-gray-400"}
                        onClick={() => {
                          console.log('Toggle reconciled clicked for transaction:', transaction.id);
                          handleToggleReconciled(transaction.id, transaction.isReconciled);
                        }}
                      >
                        {transaction.isReconciled ?
                          <CheckCircle className="h-4 w-4" /> :
                          <XCircle className="h-4 w-4" />}
                        <span className="sr-only">Toggle Reconciled</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Transaction Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="account" className="text-right">
                Account
              </Label>
              <div className="col-span-3">
                <Select
                  value={editFormData.accountId}
                  onValueChange={(value) => setEditFormData({...editFormData, accountId: value})}
                >
                  <SelectTrigger>
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
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={editFormData.date as string}
                onChange={(e) => setEditFormData({...editFormData, date: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={editFormData.amount}
                onChange={(e) => setEditFormData({...editFormData, amount: parseFloat(e.target.value)})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="payee" className="text-right">
                Payee
              </Label>
              <Input
                id="payee"
                value={editFormData.payee}
                onChange={(e) => setEditFormData({...editFormData, payee: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <div className="col-span-3">
                <Select
                  value={editFormData.category}
                  onValueChange={(value) => setEditFormData({...editFormData, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={editFormData.description}
                onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reconciled" className="text-right">
                Reconciled
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Checkbox
                  id="reconciled"
                  checked={editFormData.isReconciled}
                  onCheckedChange={(checked) =>
                    setEditFormData({...editFormData, isReconciled: checked as boolean})
                  }
                />
                <label
                  htmlFor="reconciled"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Mark as reconciled
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              transaction from your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TransactionList;
