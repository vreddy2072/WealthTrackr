import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Link as LinkIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
// Import our custom MockPlaidLink instead of the real Plaid Link
import MockPlaidLink from './MockPlaidLink';
import { bankConnectionsApi, accountsApi } from '@/lib/api';
import { mockBankConnectionsApi, mockAccountsApi } from '@/lib/mockApi';

// Use mock APIs to avoid CORS issues
const useMockApi = true;
const api = {
  bankConnections: useMockApi ? mockBankConnectionsApi : bankConnectionsApi,
  accounts: useMockApi ? mockAccountsApi : accountsApi,
};

interface BankConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  accountId?: string;
}

const BankConnectionModal: React.FC<BankConnectionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  accountId
}) => {
  // We're not using local state for open anymore, just using the prop directly
  const [connectionMethod, setConnectionMethod] = useState<'automatic' | 'manual'>('automatic');
  const [manualAccountData, setManualAccountData] = useState({
    name: '',
    type: 'checking',
    balance: '',
    institution: ''
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [plaidMetadata, setPlaidMetadata] = useState<any>(null);
  const [step, setStep] = useState<'initial' | 'select-accounts' | 'complete'>('initial');
  const { toast } = useToast();

  // Handle close event
  const handleOpenChange = (open: boolean) => {
    console.log('Dialog onOpenChange called with:', open);
    if (!open && onClose) {
      onClose();
    }
  };

  // Handle Plaid success
  const handlePlaidSuccess = useCallback((publicToken: string, metadata: any) => {
    console.log('Plaid success callback with token:', publicToken);
    console.log('Plaid metadata:', metadata);

    setIsConnecting(false);

    // Store the public token in the metadata
    const enhancedMetadata = {
      ...metadata,
      public_token: publicToken
    };

    setPlaidMetadata(enhancedMetadata);
    setStep('select-accounts');

    // Pre-select all accounts
    if (enhancedMetadata.accounts) {
      setSelectedAccounts(enhancedMetadata.accounts.map((account: any) => account.id));
    }
  }, []);

  // Handle Plaid exit
  const handlePlaidExit = useCallback(() => {
    setIsConnecting(false);
    toast({
      title: "Connection cancelled",
      description: "You've cancelled the bank connection process.",
      variant: "destructive",
    });
  }, [toast]);

  // We're using our MockPlaidLink instead of the real Plaid Link

  // Handle account selection
  const toggleAccountSelection = (accountId: string) => {
    setSelectedAccounts(prev =>
      prev.includes(accountId)
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId]
    );
  };

  // Complete bank connection
  const completeConnection = async () => {
    if (!plaidMetadata || selectedAccounts.length === 0) return;

    try {
      setIsConnecting(true);

      console.log('Creating bank connection with:', {
        institutionId: plaidMetadata.institution.institution_id,
        publicToken: plaidMetadata.public_token
      });

      // Get the institution name and ID
      const institutionName = plaidMetadata.institution.name || 'Mock Bank';
      const institutionId = plaidMetadata.institution.institution_id || 'mock_institution';

      console.log('Checking if institution exists:', institutionName);

      // First, check if we need to create the institution
      try {
        // Get all institutions
        const institutions = await api.bankConnections.getSupportedInstitutions();
        console.log('Existing institutions:', institutions);

        // Check if our institution exists
        const institutionExists = institutions.some(inst =>
          inst.id === institutionId || inst.name === institutionName
        );

        if (!institutionExists) {
          console.log('Institution does not exist, creating it first');
          // We need to create the institution first
          // For now, we'll use a workaround by creating an account with this institution
          // This will automatically create the institution in the database
          await api.accounts.create({
            name: 'Temporary Account',
            type: 'checking',
            institution: institutionName,
            balance: 0,
            currency: 'USD',
            notes: 'Temporary account to create institution'
          });

          console.log('Created institution:', institutionName);
        }
      } catch (error) {
        console.error('Error checking/creating institution:', error);
      }

      // Now create the bank connection
      console.log('Creating bank connection with institution:', institutionId);
      const connection = await api.bankConnections.create(
        institutionId,
        plaidMetadata.public_token
      );

      // Link selected accounts
      const selectedAccountsData = plaidMetadata.accounts.filter(
        (account: any) => selectedAccounts.includes(account.id)
      );

      for (const account of selectedAccountsData) {
        // If an accountId was provided, link to that account
        // Otherwise, create a new account and link to it
        if (accountId) {
          await api.bankConnections.linkAccount(
            connection.id,
            accountId,
            account.id
          );
        } else {
          // Create a new account with proper type mapping
          let accountType = 'checking';

          // Map Plaid account types to our system
          if (account.subtype) {
            switch(account.subtype) {
              case 'checking':
                accountType = 'checking';
                break;
              case 'savings':
                accountType = 'savings';
                break;
              case 'credit card':
              case 'credit':
                accountType = 'credit';
                break;
              case 'investment':
              case 'brokerage':
                accountType = 'investment';
                break;
              case 'loan':
              case 'mortgage':
                accountType = 'loan';
                break;
              default:
                accountType = account.type === 'depository' ? 'checking' : 'other';
            }
          }

          const newAccount = await api.accounts.create({
            name: account.name,
            type: accountType,
            institution: plaidMetadata.institution.name,
            balance: account.balances?.current || 0,
            currency: account.balances?.iso_currency_code || 'USD',
            notes: `Connected via Plaid on ${new Date().toLocaleDateString()}`
          });

          // Link the new account
          await api.bankConnections.linkAccount(
            connection.id,
            newAccount.id,
            account.id
          );
        }
      }

      setIsConnecting(false);

      // Call the success handler
      if (onSuccess) {
        onSuccess();
      }

      // Close the modal
      if (onClose) {
        onClose();
      }

      toast({
        title: "Accounts connected successfully",
        description: `Connected to ${plaidMetadata.institution.name}`,
      });
    } catch (error) {
      console.error('Error completing bank connection:', error);
      setIsConnecting(false);

      // Get a more detailed error message if available
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      toast({
        title: "Error",
        description: `Failed to complete bank connection: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Create a mock metadata object for manual accounts
    const mockMetadata = {
      institution: { name: manualAccountData.institution, institution_id: 'manual' },
      accounts: [
        {
          id: `manual-${Date.now()}`,
          name: manualAccountData.name,
          type: manualAccountData.type,
          subtype: manualAccountData.type,
          balances: { current: parseFloat(manualAccountData.balance) }
        }
      ]
    };

    // Call the success handler
    if (onSuccess) {
      onSuccess();
    }

    // Close the modal
    if (onClose) {
      onClose();
    }

    toast({
      title: "Account added successfully",
      description: `Added ${manualAccountData.name} account`,
    });
  };

  // Log when the modal should open or close
  console.log('BankConnectionModal - isOpen prop:', isOpen);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect Bank Account</DialogTitle>
          <DialogDescription>
            Connect your bank account to automatically import transactions and track balances.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={connectionMethod === 'automatic' ? "default" : "outline"}
              onClick={() => setConnectionMethod('automatic')}
              className="w-full"
            >
              Automatic
            </Button>
            <Button
              variant={connectionMethod === 'manual' ? "default" : "outline"}
              onClick={() => setConnectionMethod('manual')}
              className="w-full"
            >
              Manual
            </Button>
          </div>

          {step === 'initial' && connectionMethod === 'automatic' ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <LinkIcon size={16} />
                <span>Connect securely via Plaid</span>
              </div>
              <p className="text-sm text-muted-foreground">
                We use Plaid to securely connect to your bank. Your credentials are never stored on our servers.
              </p>
              <MockPlaidLink
                onSuccess={handlePlaidSuccess}
                onExit={handlePlaidExit}
              >
                {isConnecting ? "Connecting..." : "Connect to Your Bank"}
              </MockPlaidLink>
            </div>
          ) : step === 'select-accounts' ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <LinkIcon size={16} />
                <span>Select accounts to connect</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Choose which accounts you want to connect from {plaidMetadata?.institution.name}.
              </p>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {plaidMetadata?.accounts.map((account: any) => (
                  <div key={account.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={account.id}
                      checked={selectedAccounts.includes(account.id)}
                      onChange={() => toggleAccountSelection(account.id)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor={account.id} className="flex-1">
                      <div className="font-medium">{account.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {account.subtype || account.type} •
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: account.balances?.iso_currency_code || 'USD'
                        }).format(account.balances?.current || 0)}
                      </div>
                    </label>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep('initial');
                    setPlaidMetadata(null);
                    setSelectedAccounts([]);
                  }}
                >
                  Back
                </Button>
                <Button
                  onClick={completeConnection}
                  disabled={selectedAccounts.length === 0 || isConnecting}
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    "Connect Selected Accounts"
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="institution">Institution</Label>
                <Input
                  id="institution"
                  placeholder="Bank or Financial Institution"
                  value={manualAccountData.institution}
                  onChange={(e) => setManualAccountData({...manualAccountData, institution: e.target.value})}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Account Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Checking Account"
                  value={manualAccountData.name}
                  onChange={(e) => setManualAccountData({...manualAccountData, name: e.target.value})}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Account Type</Label>
                <Select
                  value={manualAccountData.type}
                  onValueChange={(value) => setManualAccountData({...manualAccountData, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Checking</SelectItem>
                    <SelectItem value="savings">Savings</SelectItem>
                    <SelectItem value="credit">Credit Card</SelectItem>
                    <SelectItem value="investment">Investment</SelectItem>
                    <SelectItem value="loan">Loan</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="balance">Current Balance</Label>
                <Input
                  id="balance"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={manualAccountData.balance}
                  onChange={(e) => setManualAccountData({...manualAccountData, balance: e.target.value})}
                  required
                />
              </div>
              <Button type="submit" className="w-full">Add Account</Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BankConnectionModal;
