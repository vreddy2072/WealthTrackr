import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Button } from './components/ui/button';
import Layout from './components/layout/Layout';
import AccountsPage from './pages/AccountsPage';
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
            <ComingSoon title="Transactions" />
          </Layout>
        } />
        <Route path="/reports" element={
          <Layout>
            <ComingSoon title="Reports" />
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
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-card rounded-lg shadow-sm p-6 border border-neutral-200 dark:border-neutral-800">
          <h2 className="text-xl font-semibold mb-4">Account Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Balance</span>
              <span className="font-medium">$24,562.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Accounts</span>
              <span className="font-medium">5</span>
            </div>
          </div>
          <div className="mt-4">
            <Link to="/accounts">
              <Button variant="outline" size="sm" className="w-full">View Accounts</Button>
            </Link>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-sm p-6 border border-neutral-200 dark:border-neutral-800">
          <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
          <p className="text-muted-foreground">No recent transactions</p>
          <div className="mt-4">
            <Link to="/transactions">
              <Button variant="outline" size="sm" className="w-full">View Transactions</Button>
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
