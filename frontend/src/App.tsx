import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Button } from './components/ui/button';
import AccountsPage from './pages/AccountsPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto py-4 px-4 flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold">WealthTrackr</Link>
            <nav className="flex space-x-4">
              <Link to="/accounts">
                <Button variant="ghost">Accounts</Button>
              </Link>
              <Link to="/transactions">
                <Button variant="ghost">Transactions</Button>
              </Link>
              <Link to="/reports">
                <Button variant="ghost">Reports</Button>
              </Link>
            </nav>
          </div>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/accounts" element={<AccountsPage />} />
            <Route path="/transactions" element={<ComingSoon title="Transactions" />} />
            <Route path="/reports" element={<ComingSoon title="Reports" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

const HomePage = () => {
  return (
    <div className="container mx-auto py-12 px-4 text-center">
      <h1 className="text-4xl font-bold mb-6">Welcome to WealthTrackr</h1>
      <p className="text-xl mb-8">Your personal finance tracking solution</p>
      <div className="flex justify-center space-x-4">
        <Link to="/accounts">
          <Button size="lg">Manage Accounts</Button>
        </Link>
        <Link to="/transactions">
          <Button size="lg" variant="outline">Track Transactions</Button>
        </Link>
      </div>
    </div>
  );
};

const ComingSoon = ({ title }: { title: string }) => {
  return (
    <div className="container mx-auto py-12 px-4 text-center">
      <h1 className="text-3xl font-bold mb-4">{title}</h1>
      <p className="text-xl mb-6">This feature is coming soon!</p>
      <Link to="/">
        <Button>Return to Home</Button>
      </Link>
    </div>
  );
};

export default App;
