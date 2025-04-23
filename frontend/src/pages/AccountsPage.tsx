import React, { useState } from 'react';
import { AccountProvider } from '../lib/contexts/AccountContext';
import AccountList from '../components/accounts/AccountList';
import AccountForm from '../components/accounts/AccountForm';
import AccountDetails from '../components/accounts/AccountDetails';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Plus } from 'lucide-react';

enum AccountView {
  LIST,
  ADD,
  EDIT,
  DETAILS,
}

const AccountsPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<AccountView>(AccountView.LIST);
  const [selectedAccountId, setSelectedAccountId] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('all');

  const handleAddAccount = () => {
    setCurrentView(AccountView.ADD);
  };

  const handleEditAccount = (accountId: string) => {
    setSelectedAccountId(accountId);
    setCurrentView(AccountView.EDIT);
  };

  const handleViewAccountDetails = (accountId: string) => {
    setSelectedAccountId(accountId);
    setCurrentView(AccountView.DETAILS);
  };

  const handleFormSuccess = () => {
    setCurrentView(AccountView.LIST);
    setSelectedAccountId(undefined);
  };

  const handleFormCancel = () => {
    setCurrentView(AccountView.LIST);
    setSelectedAccountId(undefined);
  };

  const handleBackToList = () => {
    setCurrentView(AccountView.LIST);
    setSelectedAccountId(undefined);
  };

  return (
    <AccountProvider>
      <div className="space-y-6">
        {currentView === AccountView.LIST && (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <Tabs
                defaultValue="all"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full sm:w-auto"
              >
                <TabsList>
                  <TabsTrigger value="all">All Accounts</TabsTrigger>
                  <TabsTrigger value="checking">Checking</TabsTrigger>
                  <TabsTrigger value="savings">Savings</TabsTrigger>
                  <TabsTrigger value="credit">Credit Cards</TabsTrigger>
                  <TabsTrigger value="investment">Investments</TabsTrigger>
                </TabsList>
              </Tabs>

              <Button onClick={handleAddAccount} className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Account
              </Button>
            </div>

            <div className="bg-card rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden">
              <AccountList
                onAddAccount={handleAddAccount}
                onEditAccount={handleEditAccount}
                onViewAccountDetails={handleViewAccountDetails}
                filter={activeTab !== 'all' ? activeTab : undefined}
              />
            </div>
          </>
        )}

        {currentView === AccountView.ADD && (
          <div className="bg-card rounded-lg border border-neutral-200 dark:border-neutral-800 p-6">
            <h2 className="text-xl font-semibold mb-6">Add New Account</h2>
            <AccountForm onSuccess={handleFormSuccess} onCancel={handleFormCancel} />
          </div>
        )}

        {currentView === AccountView.EDIT && selectedAccountId && (
          <div className="bg-card rounded-lg border border-neutral-200 dark:border-neutral-800 p-6">
            <h2 className="text-xl font-semibold mb-6">Edit Account</h2>
            <AccountForm
              accountId={selectedAccountId}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </div>
        )}

        {currentView === AccountView.DETAILS && selectedAccountId && (
          <div className="bg-card rounded-lg border border-neutral-200 dark:border-neutral-800 p-6">
            <AccountDetails
              accountId={selectedAccountId}
              onBack={handleBackToList}
              onEdit={handleEditAccount}
            />
          </div>
        )}
      </div>
    </AccountProvider>
  );
};

export default AccountsPage;
