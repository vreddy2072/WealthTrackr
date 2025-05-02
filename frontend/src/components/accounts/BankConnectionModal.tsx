import React, { useState } from 'react';
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
import { PlusCircle, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// This is a placeholder for the Plaid Link component
// In a real implementation, we would use the Plaid Link SDK
const PlaidLink = ({ onSuccess, onExit, children }: { 
  onSuccess: (publicToken: string, metadata: any) => void;
  onExit: () => void;
  children: React.ReactNode;
}) => {
  // This is a mock implementation for demonstration purposes
  const handleClick = () => {
    // Simulate a successful connection
    setTimeout(() => {
      onSuccess('mock-public-token', { 
        institution: { name: 'Capital One', institution_id: 'ins_123' },
        accounts: [
          { id: 'acc_123', name: 'Checking', type: 'depository', subtype: 'checking' },
          { id: 'acc_456', name: 'Savings', type: 'depository', subtype: 'savings' }
        ]
      });
    }, 2000);
  };

  return (
    <Button onClick={handleClick} className="w-full">
      {children}
    </Button>
  );
};

interface BankConnectionModalProps {
  onConnectionSuccess?: (publicToken: string, metadata: any) => void;
}

const BankConnectionModal: React.FC<BankConnectionModalProps> = ({ 
  onConnectionSuccess 
}) => {
  const [open, setOpen] = useState(false);
  const [connectionMethod, setConnectionMethod] = useState<'automatic' | 'manual'>('automatic');
  const [manualAccountData, setManualAccountData] = useState({
    name: '',
    type: 'checking',
    balance: '',
    institution: ''
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const handlePlaidSuccess = (publicToken: string, metadata: any) => {
    setIsConnecting(false);
    setOpen(false);
    
    if (onConnectionSuccess) {
      onConnectionSuccess(publicToken, metadata);
    }

    toast({
      title: "Account connected successfully",
      description: `Connected to ${metadata.institution.name}`,
    });
  };

  const handlePlaidExit = () => {
    setIsConnecting(false);
    toast({
      title: "Connection cancelled",
      description: "You've cancelled the bank connection process.",
      variant: "destructive",
    });
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
    
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
    
    if (onConnectionSuccess) {
      onConnectionSuccess('manual', mockMetadata);
    }

    toast({
      title: "Account added successfully",
      description: `Added ${manualAccountData.name} account`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PlusCircle size={16} />
          Connect Bank Account
        </Button>
      </DialogTrigger>
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

          {connectionMethod === 'automatic' ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <LinkIcon size={16} />
                <span>Connect securely via Plaid</span>
              </div>
              <p className="text-sm text-muted-foreground">
                We use Plaid to securely connect to your bank. Your credentials are never stored on our servers.
              </p>
              <PlaidLink 
                onSuccess={handlePlaidSuccess} 
                onExit={handlePlaidExit}
              >
                {isConnecting ? "Connecting..." : "Connect to Your Bank"}
              </PlaidLink>
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
