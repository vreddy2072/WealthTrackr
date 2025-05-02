import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from './components/ui/button';
import { Skeleton } from './components/ui/skeleton';
import Layout from './components/layout/Layout';
import AccountsPage from './pages/AccountsPage';
import TransactionsPage from './pages/TransactionsPage';
import ReportsPage from './pages/ReportsPage';
import { accountsApi, transactionsApi } from './lib/api';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <Layout>
            <HomePage />
          </Layout>
        } />
        <Route path="/accounts" element={
          <Layout>
            <AccountsPage />
          </Layout>
        } />
        <Route path="/transactions" element={
          <Layout>
            <TransactionsPage />
          </Layout>
        } />
        <Route path="/reports" element={
          <Layout>
            <ReportsPage />
          </Layout>
        } />
        <Route path="/budget" element={
          <Layout>
            <ComingSoon title="Budget" />
          </Layout>
        } />
        <Route path="/goals" element={
          <Layout>
            <ComingSoon title="Goals" />
          </Layout>
        } />
      </Routes>
    </Router>
  );
}



const HomePage = () => {
  // State for account summary
  const [totalBalance, setTotalBalance] = useState<number | null>(null);
  const [accountCount, setAccountCount] = useState<number | null>(null);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [accountError, setAccountError] = useState<string | null>(null);

  // State for recent transactions
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [transactionError, setTransactionError] = useState<string | null>(null);

  // Function to fetch account summary data
  const fetchAccountData = async () => {
    try {
      setIsLoadingAccounts(true);
      setAccountError(null);

      // Fetch total balance
      const balance = await accountsApi.getTotalBalance();
      setTotalBalance(balance);

      // Fetch all accounts to get the count
      const accounts = await accountsApi.getAll();
      setAccountCount(accounts.length);

      setIsLoadingAccounts(false);
    } catch (error) {
      console.error('Error fetching account data:', error);
      setAccountError('Failed to load account data');
      setIsLoadingAccounts(false);
    }
  };

  // Fetch account data on mount and when the component is focused
  useEffect(() => {
    fetchAccountData();

    // Add event listener for when the page becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Dashboard page is visible, checking if refresh is needed...');

        // Check if we need to refresh (set by transaction operations)
        const shouldRefresh = localStorage.getItem('dashboardShouldRefresh');
        if (shouldRefresh === 'true') {
          console.log('Dashboard refresh triggered by transaction changes');
          fetchAccountData();
          fetchTransactionData();
          localStorage.removeItem('dashboardShouldRefresh');
        } else {
          // Refresh anyway for good measure
          fetchAccountData();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Function to fetch recent transactions
  const fetchTransactionData = async () => {
    try {
      setIsLoadingTransactions(true);
      setTransactionError(null);

      // Fetch all transactions
      const transactions = await transactionsApi.getAll();

      // Sort by date (newest first) and take the first 3
      const sorted = [...transactions].sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      setRecentTransactions(sorted.slice(0, 3));
      setIsLoadingTransactions(false);
    } catch (error) {
      console.error('Error fetching transaction data:', error);
      setTransactionError('Failed to load transaction data');
      setIsLoadingTransactions(false);
    }
  };

  // Fetch recent transactions on mount and when the component is focused
  useEffect(() => {
    fetchTransactionData();

    // We'll use the same visibility change handler from the account data effect
    // No need to duplicate the event listener
  }, []);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-card rounded-lg shadow-sm p-6 border border-neutral-200 dark:border-neutral-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Account Summary</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                fetchAccountData();
                fetchTransactionData();
              }}
              title="Refresh data"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                <path d="M21 3v5h-5"/>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                <path d="M3 21v-5h5"/>
              </svg>
            </Button>
          </div>
          {accountError ? (
            <p className="text-red-500">{accountError}</p>
          ) : isLoadingAccounts ? (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Balance</span>
                <Skeleton className="h-6 w-24" />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Accounts</span>
                <Skeleton className="h-6 w-8" />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Balance</span>
                <span className="font-medium">{formatCurrency(totalBalance || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Accounts</span>
                <span className="font-medium">{accountCount}</span>
              </div>
            </div>
          )}
          <div className="mt-4">
            <Link to="/accounts">
              <Button variant="outline" size="sm" className="w-full">View Accounts</Button>
            </Link>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-sm p-6 border border-neutral-200 dark:border-neutral-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Transactions</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchTransactionData}
              title="Refresh transactions"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                <path d="M21 3v5h-5"/>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                <path d="M3 21v-5h5"/>
              </svg>
            </Button>
          </div>
          {transactionError ? (
            <p className="text-red-500">{transactionError}</p>
          ) : isLoadingTransactions ? (
            <div className="space-y-3 mb-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center">
                  <div>
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </div>
          ) : recentTransactions.length === 0 ? (
            <p className="text-muted-foreground">No recent transactions</p>
          ) : (
            <div className="space-y-3 mb-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{transaction.payee}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(transaction.date)}</p>
                  </div>
                  <span className={`font-medium ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {transaction.amount < 0 ? '-' : ''}{formatCurrency(Math.abs(transaction.amount))}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4">
            <Link to="/transactions">
              <Button variant="outline" size="sm" className="w-full">View All Transactions</Button>
            </Link>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-sm p-6 border border-neutral-200 dark:border-neutral-800">
          <h2 className="text-xl font-semibold mb-4">Savings Goals</h2>
          <p className="text-muted-foreground">No savings goals set</p>
          <div className="mt-4">
            <Link to="/goals">
              <Button variant="outline" size="sm" className="w-full">Set Goals</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-sm p-6 border border-neutral-200 dark:border-neutral-800">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/accounts">
            <Button>Manage Accounts</Button>
          </Link>
          <Link to="/transactions">
            <Button variant="outline">Track Transactions</Button>
          </Link>
          <Link to="/reports">
            <Button variant="outline">View Reports</Button>
          </Link>
          <Link to="/budget">
            <Button variant="outline">Set Budget</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

const ComingSoon = ({ title }: { title: string }) => {
  return (
    <div className="bg-card rounded-lg shadow-sm p-8 border border-neutral-200 dark:border-neutral-800 text-center max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      <p className="text-muted-foreground mb-6">This feature is coming soon!</p>
      <Link to="/">
        <Button>Return to Dashboard</Button>
      </Link>
    </div>
  );
};

export default App;
