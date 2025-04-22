import React from 'react';
import { useAccounts } from '../../lib/contexts/AccountContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

interface AccountListProps {
  onAddAccount: () => void;
  onEditAccount: (accountId: string) => void;
  onViewAccountDetails: (accountId: string) => void;
}

const AccountList: React.FC<AccountListProps> = ({
  onAddAccount,
  onEditAccount,
  onViewAccountDetails,
}) => {
  const { state, deleteAccount } = useAccounts();
  const { accounts, loading, error } = state;

  const handleDeleteAccount = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      try {
        await deleteAccount(id);
      } catch (error) {
        console.error('Failed to delete account:', error);
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
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Accounts</h2>
          <Button disabled>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Account
          </Button>
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="cursor-pointer">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </CardHeader>
            <CardContent className="pb-2">
              <Skeleton className="h-8 w-1/2 mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <Skeleton className="h-4 w-1/4" />
              <div className="space-x-2">
                <Skeleton className="h-8 w-8 inline-block" />
                <Skeleton className="h-8 w-8 inline-block" />
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-md">
        <h2 className="text-lg font-semibold">Error loading accounts</h2>
        <p>{error}</p>
        <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Accounts</h2>
        <Button onClick={onAddAccount}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Account
        </Button>
      </div>

      {accounts.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">No accounts found</p>
            <Button onClick={onAddAccount}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Your First Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <Card
              key={account.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onViewAccountDetails(account.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{account.name}</CardTitle>
                  <Badge className={getAccountTypeColor(account.type)}>
                    {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
                  </Badge>
                </div>
                <CardDescription>{account.institution}</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="text-2xl font-bold mb-1">
                  {formatCurrency(account.balance, account.currency)}
                </div>
                {account.notes && (
                  <p className="text-sm text-muted-foreground truncate">{account.notes}</p>
                )}
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <span className="text-xs text-muted-foreground">
                  Updated: {new Date(account.updated_at).toLocaleDateString()}
                </span>
                <div className="space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditAccount(account.id);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteAccount(account.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AccountList;
