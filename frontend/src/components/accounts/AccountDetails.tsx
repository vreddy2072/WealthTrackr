import React, { useState, useEffect } from 'react';
import { Account, accountsApi } from '../../lib/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ArrowLeft, Edit, Trash2, AlertCircle, Link } from 'lucide-react';
import BankConnectionModal from './BankConnectionModal';
import { formatCurrency, formatDate } from '../../lib/utils';
import { useAccounts } from '../../lib/contexts/AccountContext';

interface AccountDetailsProps {
  accountId: string;
  onBack: () => void;
  onEdit: (accountId: string) => void;
}

const AccountDetails: React.FC<AccountDetailsProps> = ({ accountId, onBack, onEdit }) => {
  const { deleteAccount } = useAccounts();
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBankConnectionModalOpen, setIsBankConnectionModalOpen] = useState(false);

  const fetchAccount = async () => {
    try {
      setLoading(true);
      const data = await accountsApi.getById(accountId);
      setAccount(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load account details. Please try again.');
      console.error('Error fetching account:', err);
      setLoading(false);
    }
  };

  const handleBankConnectionSuccess = () => {
    // Refresh the account data to show the updated connection status
    fetchAccount();
  };

  useEffect(() => {
    fetchAccount();
  }, [accountId]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      try {
        await deleteAccount(accountId);
        onBack();
      } catch (error) {
        setError('Failed to delete account. Please try again.');
        console.error('Error deleting account:', error);
      }
    }
  };

  const getAccountTypeColor = (type: string): string => {
    switch (type) {
      case 'checking':
        return 'bg-blue-100 text-blue-800';
      case 'savings':
        return 'bg-green-100 text-green-800';
      case 'credit':
        return 'bg-red-100 text-red-800';
      case 'investment':
        return 'bg-purple-100 text-purple-800';
      case 'cash':
        return 'bg-yellow-100 text-yellow-800';
      case 'loan':
        return 'bg-orange-100 text-orange-800';
      case 'mortgage':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Button variant="ghost" size="sm" className="w-fit" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Accounts
          </Button>
          <div className="h-6 bg-gray-200 rounded animate-pulse mt-2"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3 mt-2"></div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <Button variant="ghost" size="sm" className="w-fit" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Accounts
          </Button>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 p-4 rounded-md text-red-800 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </CardFooter>
      </Card>
    );
  }

  if (!account) {
    return (
      <Card>
        <CardHeader>
          <Button variant="ghost" size="sm" className="w-fit" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Accounts
          </Button>
          <CardTitle>Account Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>The requested account could not be found.</p>
        </CardContent>
        <CardFooter>
          <Button onClick={onBack}>Return to Accounts</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <Button variant="ghost" size="sm" className="w-fit" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Accounts
          </Button>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(accountId)}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>
            <Button variant="outline" size="sm" className="text-red-500" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">{account.name}</CardTitle>
            <Badge className={getAccountTypeColor(account.type)}>
              {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
            </Badge>
          </div>
          <CardDescription className="text-lg">{account.institution}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Current Balance</h3>
          <p className="text-3xl font-bold">
            {formatCurrency(account.balance, account.currency)}
          </p>
        </div>

        {account.notes && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Notes</h3>
            <p className="text-sm">{account.notes}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Created</h3>
            <p className="text-sm">{formatDate(account.created_at)}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Last Updated</h3>
            <p className="text-sm">{formatDate(account.updated_at)}</p>
          </div>
        </div>

        <div className="pt-4 border-t">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Online Banking</h3>
          <Button variant="outline" size="sm" onClick={() => {
            console.log('Connect to Online Banking button clicked');
            setIsBankConnectionModalOpen(true);
            console.log('isBankConnectionModalOpen set to true');
          }}>
            <Link className="mr-2 h-4 w-4" /> Connect to Online Banking
          </Button>
        </div>
      </CardContent>

      {/* Bank Connection Modal */}
      <BankConnectionModal
        isOpen={isBankConnectionModalOpen}
        onClose={() => setIsBankConnectionModalOpen(false)}
        accountId={accountId}
        onSuccess={handleBankConnectionSuccess}
      />
    </Card>
  );
};

export default AccountDetails;
