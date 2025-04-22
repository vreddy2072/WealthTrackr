import React, { useState } from 'react';
import { AccountProvider } from '../lib/contexts/AccountContext';
import AccountList from '../components/accounts/AccountList';
import AccountForm from '../components/accounts/AccountForm';
import AccountDetails from '../components/accounts/AccountDetails';

enum AccountView {
  LIST,
  ADD,
  EDIT,
  DETAILS,
}

const AccountsPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<AccountView>(AccountView.LIST);
  const [selectedAccountId, setSelectedAccountId] = useState<string | undefined>(undefined);

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
      <div className="container mx-auto py-6 px-4">
        {currentView === AccountView.LIST && (
          <AccountList
            onAddAccount={handleAddAccount}
            onEditAccount={handleEditAccount}
            onViewAccountDetails={handleViewAccountDetails}
          />
        )}

        {currentView === AccountView.ADD && (
          <AccountForm onSuccess={handleFormSuccess} onCancel={handleFormCancel} />
        )}

        {currentView === AccountView.EDIT && selectedAccountId && (
          <AccountForm
            accountId={selectedAccountId}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        )}

        {currentView === AccountView.DETAILS && selectedAccountId && (
          <AccountDetails
            accountId={selectedAccountId}
            onBack={handleBackToList}
            onEdit={handleEditAccount}
          />
        )}
      </div>
    </AccountProvider>
  );
};

export default AccountsPage;
