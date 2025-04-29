import React from 'react';
import { useAccounts } from '../../lib/contexts/AccountContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { PlusCircle, Edit, Trash2, CreditCard, Wallet, PiggyBank, BarChart4, DollarSign, Home } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

interface AccountListProps {
  onAddAccount: () => void;
  onEditAccount: (accountId: string) => void;
  onViewAccountDetails: (accountId: string) => void;
  filter?: string;
}

const AccountList: React.FC<AccountListProps> = ({
  onAddAccount,
  onEditAccount,
  onViewAccountDetails,
  filter,
}) => {
  const { state, deleteAccount } = useAccounts();
  const { accounts, loading, error } = state;
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [accountToDelete, setAccountToDelete] = React.useState<string | null>(null);

  const handleDeleteAccount = async () => {
    if (accountToDelete) {
      try {
        await deleteAccount(accountToDelete);
        setAccountToDelete(null);
      } catch (error) {
        console.error('Failed to delete account:', error);
      }
    }
  };

  const openDeleteDialog = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAccountToDelete(id);
    setDeleteDialogOpen(true);
  };

  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case 'checking':
        return <CreditCard className="h-5 w-5" />;
      case 'savings':
        return <PiggyBank className="h-5 w-5" />;
      case 'credit':
        return <CreditCard className="h-5 w-5" />;
      case 'investment':
        return <BarChart4 className="h-5 w-5" />;
      case 'cash':
        return <Wallet className="h-5 w-5" />;
      case 'loan':
        return <DollarSign className="h-5 w-5" />;
      case 'mortgage':
        return <Home className="h-5 w-5" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  const getAccountTypeColor = (type: string): string => {
    switch (type) {
      case 'checking':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'savings':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'credit':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'investment':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'cash':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'loan':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'mortgage':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  // Filter accounts based on the selected filter
  const filteredAccounts = filter
    ? accounts.filter(account => account.type === filter)
    : accounts;

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-1/4 mb-4" />
              <Skeleton className="h-8 w-1/2 mb-2" />
              <Skeleton className="h-4 w-3/4 mb-4" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-1/4" />
                <div className="flex space-x-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-destructive/10 text-destructive rounded-md">
        <h2 className="text-lg font-semibold mb-2">Error loading accounts</h2>
        <p className="mb-4">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      {filteredAccounts.length === 0 ? (
        <div className="p-12 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-muted p-3">
              <CreditCard className="h-6 w-6 text-muted-foreground" />
            </div>
          </div>
          <h3 className="text-lg font-medium mb-2">No accounts found</h3>
          <p className="text-muted-foreground mb-6">
            {filter ? `You don't have any ${filter} accounts yet.` : "You haven't added any accounts yet."}
          </p>
          <Button onClick={onAddAccount}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add {filter ? `${filter} ` : ""}Account
          </Button>
        </div>
      ) : (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAccounts.map((account) => (
              <div
                key={account.id}
                className="group account-card cursor-pointer"
                onClick={() => onViewAccountDetails(account.id)}
              >
                <div className="account-card-header">
                  <div className="flex items-center">
                    <div className="account-type-icon">
                      {getAccountTypeIcon(account.type)}
                    </div>
                    <div>
                      <h3 className="font-medium">{account.name}</h3>
                      <p className="text-sm text-muted-foreground">{account.institution}</p>
                    </div>
                  </div>
                  <Badge className={getAccountTypeColor(account.type)}>
                    {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
                  </Badge>
                </div>

                <div className="account-card-body">
                  <div className="account-balance">
                    {formatCurrency(account.balance, account.currency)}
                  </div>
                  {account.notes && (
                    <p className="text-sm text-muted-foreground mt-1 truncate">{account.notes}</p>
                  )}
                </div>

                <div className="account-card-footer">
                  <span className="text-xs text-muted-foreground">
                    Updated: {new Date(account.updated_at).toLocaleDateString()}
                  </span>
                  <div className="account-actions">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
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
                      className="h-8 w-8 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => openDeleteDialog(account.id, e)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the account
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AccountList;
