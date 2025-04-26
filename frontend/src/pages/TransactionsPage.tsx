import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import TransactionList from '../components/transactions/TransactionList';
import TransactionFilters from '../components/transactions/TransactionFilters';
import AddTransactionDialog from '../components/transactions/AddTransactionDialog';
import ImportTransactionsDialog from '../components/transactions/ImportTransactionsDialog';
import ExportTransactionsDialog from '../components/transactions/ExportTransactionsDialog';
import { PlusCircle, Download, Upload, Search } from 'lucide-react';
import { transactionsApi, accountsApi } from '../lib/api';

// Mock data for transactions
const mockTransactions = [
  {
    id: 'trans-001',
    accountId: 'acc-001',
    accountName: 'Primary Checking',
    date: '2025-04-15T10:30:00Z',
    amount: -45.67,
    payee: 'Grocery Store',
    category: 'Groceries',
    description: 'Weekly grocery shopping',
    isReconciled: true,
    createdAt: '2025-04-15T10:30:00Z',
    updatedAt: '2025-04-15T10:30:00Z'
  },
  {
    id: 'trans-002',
    accountId: 'acc-001',
    accountName: 'Primary Checking',
    date: '2025-04-14T15:45:00Z',
    amount: -25.00,
    payee: 'Gas Station',
    category: 'Transportation',
    description: 'Fuel for car',
    isReconciled: true,
    createdAt: '2025-04-14T15:45:00Z',
    updatedAt: '2025-04-14T15:45:00Z'
  },
  {
    id: 'trans-003',
    accountId: 'acc-001',
    accountName: 'Primary Checking',
    date: '2025-04-13T09:15:00Z',
    amount: -12.50,
    payee: 'Coffee Shop',
    category: 'Dining',
    description: 'Morning coffee',
    isReconciled: false,
    createdAt: '2025-04-13T09:15:00Z',
    updatedAt: '2025-04-13T09:15:00Z'
  },
  {
    id: 'trans-004',
    accountId: 'acc-002',
    accountName: 'Emergency Savings',
    date: '2025-04-10T12:00:00Z',
    amount: 500.00,
    payee: 'Transfer from Checking',
    category: 'Transfer',
    description: 'Monthly savings transfer',
    isReconciled: true,
    createdAt: '2025-04-10T12:00:00Z',
    updatedAt: '2025-04-10T12:00:00Z'
  },
  {
    id: 'trans-005',
    accountId: 'acc-003',
    accountName: 'Rewards Credit Card',
    date: '2025-04-08T18:30:00Z',
    amount: -89.99,
    payee: 'Online Store',
    category: 'Shopping',
    description: 'New headphones',
    isReconciled: false,
    createdAt: '2025-04-08T18:30:00Z',
    updatedAt: '2025-04-08T18:30:00Z'
  }
];

// Mock data for accounts
const mockAccounts = [
  { id: 'acc-001', name: 'Primary Checking' },
  { id: 'acc-002', name: 'Emergency Savings' },
  { id: 'acc-003', name: 'Rewards Credit Card' },
  { id: 'acc-004', name: 'Vacation Fund' },
  { id: 'acc-005', name: 'Investment Portfolio' }
];

// Mock data for categories
const mockCategories = [
  'Groceries',
  'Transportation',
  'Dining',
  'Shopping',
  'Entertainment',
  'Utilities',
  'Housing',
  'Healthcare',
  'Income',
  'Transfer',
  'Other'
];

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [accountsList, setAccountsList] = useState<{id: string, name: string}[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState({
    account: '',
    category: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    isReconciled: null as boolean | null
  });

  // Fetch transactions and accounts from the database when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch accounts first
        console.log('Fetching accounts from API...');
        const accountData = await accountsApi.getAll();
        console.log('Accounts fetched successfully:', accountData);
        const accountsMap = new Map(accountData.map(account => [account.id, account.name]));
        setAccountsList(accountData.map(account => ({ id: account.id, name: account.name })));

        // Then fetch transactions
        console.log('Fetching transactions from API...');
        const transactionData = await transactionsApi.getAll();
        console.log('Transactions fetched successfully:', transactionData);

        // Add account names to transactions
        const transactionsWithAccountNames = transactionData.map(transaction => ({
          ...transaction,
          accountName: accountsMap.get(transaction.accountId) || 'Unknown Account'
        }));

        setTransactions(transactionsWithAccountNames);
        setFilteredTransactions(transactionsWithAccountNames);

        // Fetch categories from the API
        console.log('Fetching categories from API...');
        try {
          const categoryData = await transactionsApi.getCategories();
          console.log('Categories fetched successfully:', categoryData);
          setCategories(categoryData);
        } catch (error) {
          console.error('Error fetching categories:', error);
          // Fallback to default categories if API fails
          setCategories([
            'Groceries',
            'Transportation',
            'Dining',
            'Shopping',
            'Entertainment',
            'Utilities',
            'Housing',
            'Healthcare',
            'Income',
            'Transfer',
            'Other'
          ]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    loadData();
  }, []);

  // Log transactions for debugging
  useEffect(() => {
    console.log('Current transactions data:', transactions);
  }, [transactions]);

  // Effect to filter transactions when filters change
  useEffect(() => {
    let filtered = [...transactions];

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        t =>
          t.payee.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query)
      );
    }

    // Apply account filter
    if (activeFilters.account) {
      filtered = filtered.filter(t => t.accountId === activeFilters.account);
    }

    // Apply category filter
    if (activeFilters.category) {
      filtered = filtered.filter(t => t.category === activeFilters.category);
    }

    // Apply date range filters
    if (activeFilters.startDate) {
      const startDate = new Date(activeFilters.startDate);
      filtered = filtered.filter(t => new Date(t.date) >= startDate);
    }

    if (activeFilters.endDate) {
      const endDate = new Date(activeFilters.endDate);
      filtered = filtered.filter(t => new Date(t.date) <= endDate);
    }

    // Apply amount range filters
    if (activeFilters.minAmount) {
      const minAmount = parseFloat(activeFilters.minAmount);
      filtered = filtered.filter(t => t.amount >= minAmount);
    }

    if (activeFilters.maxAmount) {
      const maxAmount = parseFloat(activeFilters.maxAmount);
      filtered = filtered.filter(t => t.amount <= maxAmount);
    }

    // Apply reconciled filter
    if (activeFilters.isReconciled !== null) {
      filtered = filtered.filter(t => t.isReconciled === activeFilters.isReconciled);
    }

    setFilteredTransactions(filtered);
  }, [transactions, searchQuery, activeFilters]);

  // Function to notify the dashboard to refresh
  const notifyDashboardToRefresh = () => {
    // Set a flag in localStorage that the dashboard should refresh
    localStorage.setItem('dashboardShouldRefresh', 'true');
    // The dashboard will check this flag when it becomes visible
  };

  const handleAddTransaction = async (newTransaction: any) => {
    try {
      console.log('Adding new transaction:', newTransaction);
      const transaction = await transactionsApi.create(newTransaction);
      console.log('Transaction added successfully:', transaction);

      // Add account name to the transaction
      const accountName = accountsList.find(a => a.id === transaction.accountId)?.name || 'Unknown Account';
      const transactionWithAccountName = {
        ...transaction,
        accountName
      };

      setTransactions([transactionWithAccountName, ...transactions]);
      setFilteredTransactions([transactionWithAccountName, ...filteredTransactions]);
      setIsAddTransactionOpen(false);

      // Notify dashboard to refresh
      notifyDashboardToRefresh();
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Failed to add transaction. Please try again.');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      console.log('Deleting transaction:', id);
      await transactionsApi.delete(id);
      console.log('Transaction deleted successfully');
      const updatedTransactions = transactions.filter(t => t.id !== id);
      setTransactions(updatedTransactions);
      setFilteredTransactions(filteredTransactions.filter(t => t.id !== id));

      // Notify dashboard to refresh
      notifyDashboardToRefresh();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Failed to delete transaction. Please try again.');
    }
  };

  const handleUpdateTransaction = async (id: string, updatedData: any) => {
    try {
      console.log('Updating transaction:', id, updatedData);
      const updated = await transactionsApi.update(id, updatedData);
      console.log('Transaction updated successfully:', updated);

      // Add account name to the updated transaction
      const accountName = accountsList.find(a => a.id === updated.accountId)?.name || 'Unknown Account';
      const updatedWithAccountName = {
        ...updated,
        accountName
      };

      const updatedTransactions = transactions.map(t => t.id === id ? updatedWithAccountName : t);
      setTransactions(updatedTransactions);
      setFilteredTransactions(filteredTransactions.map(t => t.id === id ? updatedWithAccountName : t));

      // Notify dashboard to refresh
      notifyDashboardToRefresh();
    } catch (error) {
      console.error('Error updating transaction:', error);
      alert('Failed to update transaction. Please try again.');
    }
  };

  const handleFilterChange = (filters: any) => {
    setActiveFilters(filters);
  };

  const handleImportTransactions = async (accountId: string, transactionsToImport: any[]) => {
    try {
      console.log(`Importing ${transactionsToImport.length} transactions for account ${accountId}...`);

      // Call the API to import transactions
      const importedTransactions = await transactionsApi.importTransactions(accountId, transactionsToImport);
      console.log('Transactions imported successfully:', importedTransactions);

      // Add account name to the imported transactions
      const accountName = accountsList.find(a => a.id === accountId)?.name || 'Unknown Account';
      const transactionsWithAccountName = importedTransactions.map(transaction => ({
        ...transaction,
        accountName
      }));

      // Update the transactions state
      setTransactions([...transactionsWithAccountName, ...transactions]);

      // Notify dashboard to refresh
      notifyDashboardToRefresh();

      // Show success message
      alert(`Successfully imported ${importedTransactions.length} transactions.`);
    } catch (error) {
      console.error('Error importing transactions:', error);
      alert('Failed to import transactions. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Transactions</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setIsImportDialogOpen(true)}
          >
            <Upload size={16} />
            Import
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setIsExportDialogOpen(true)}
          >
            <Download size={16} />
            Export
          </Button>
          <Button
            className="flex items-center gap-2"
            onClick={() => setIsAddTransactionOpen(true)}
          >
            <PlusCircle size={16} />
            Add Transaction
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionFilters
                accounts={accountsList}
                categories={mockCategories}
                onFilterChange={handleFilterChange}
                activeFilters={activeFilters}
              />
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <CardTitle>Transaction List</CardTitle>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search transactions..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No transactions found. Add your first transaction to get started.</p>
                  <Button
                    onClick={() => setIsAddTransactionOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <PlusCircle size={16} />
                    Add Transaction
                  </Button>
                </div>
              ) : (
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="income">Income</TabsTrigger>
                    <TabsTrigger value="expense">Expenses</TabsTrigger>
                    <TabsTrigger value="unreconciled">Unreconciled</TabsTrigger>
                  </TabsList>
                  <TabsContent value="all">
                    <TransactionList
                      transactions={filteredTransactions}
                      onDelete={handleDeleteTransaction}
                      onUpdate={handleUpdateTransaction}
                      accounts={accountsList}
                      categories={categories}
                    />
                  </TabsContent>
                  <TabsContent value="income">
                    <TransactionList
                      transactions={filteredTransactions.filter(t => t.amount > 0)}
                      onDelete={handleDeleteTransaction}
                      onUpdate={handleUpdateTransaction}
                      accounts={accountsList}
                      categories={categories}
                    />
                  </TabsContent>
                  <TabsContent value="expense">
                    <TransactionList
                      transactions={filteredTransactions.filter(t => t.amount < 0)}
                      onDelete={handleDeleteTransaction}
                      onUpdate={handleUpdateTransaction}
                      accounts={accountsList}
                      categories={categories}
                    />
                  </TabsContent>
                  <TabsContent value="unreconciled">
                    <TransactionList
                      transactions={filteredTransactions.filter(t => !t.isReconciled)}
                      onDelete={handleDeleteTransaction}
                      onUpdate={handleUpdateTransaction}
                      accounts={accountsList}
                      categories={categories}
                    />
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AddTransactionDialog
        isOpen={isAddTransactionOpen}
        onClose={() => setIsAddTransactionOpen(false)}
        onAdd={handleAddTransaction}
        accounts={accountsList}
        categories={categories}
      />

      <ImportTransactionsDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onImport={handleImportTransactions}
        accounts={accountsList}
      />

      <ExportTransactionsDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        accounts={accountsList}
        categories={categories.map(category => ({ name: category }))}
      />
    </div>
  );
};

export default TransactionsPage;
