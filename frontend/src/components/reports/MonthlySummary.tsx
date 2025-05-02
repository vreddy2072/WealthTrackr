import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { accountsApi } from '@/lib/api';
import { format } from 'date-fns';

interface MonthlySummaryProps {
  year: number;
  month: number;
  accountId?: string;
}

interface MonthlySummaryData {
  year: number;
  month: number;
  income: number;
  expenses: number;
  net_change: number;
  top_income_categories: CategoryData[];
  top_expense_categories: CategoryData[];
}

interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
}

const MonthlySummary: React.FC<MonthlySummaryProps> = ({
  year,
  month,
  accountId
}) => {
  const [data, setData] = useState<MonthlySummaryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const accountsData = await accountsApi.getAll();
        setAccounts(accountsData);
      } catch (err) {
        console.error('Error fetching accounts:', err);
      }
    };

    fetchAccounts();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Construct the API URL with query parameters
        const params = new URLSearchParams();
        params.append('year', year.toString());
        params.append('month', month.toString());
        if (selectedAccount) params.append('account_id', selectedAccount);

        const response = await fetch(`http://localhost:8000/api/reports/monthly-summary?${params.toString()}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch monthly summary: ${response.statusText}`);
        }

        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        console.error('Error fetching monthly summary:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [year, month, selectedAccount]);

  const handleAccountChange = (value: string) => {
    setSelectedAccount(value === 'all' ? '' : value);
  };

  const chartData = [
    { name: 'Income', value: data?.income || 0 },
    { name: 'Expenses', value: data?.expenses || 0 },
    { name: 'Net Change', value: data?.net_change || 0 }
  ];

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col gap-4">
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load monthly summary: {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Data</AlertTitle>
        <AlertDescription>
          No monthly summary data available for the selected month.
        </AlertDescription>
      </Alert>
    );
  }

  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });

  return (
    <div className="w-full">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-medium">
          Summary for {monthName} {year}
        </h3>
        <Select value={selectedAccount} onValueChange={handleAccountChange}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="All Accounts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Accounts</SelectItem>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-green-600 dark:text-green-400">Income</h4>
          <p className="text-2xl font-bold">${data.income.toLocaleString()}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-red-600 dark:text-red-400">Expenses</h4>
          <p className="text-2xl font-bold">${data.expenses.toLocaleString()}</p>
        </div>
        <div className={`${data.net_change >= 0 ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-amber-50 dark:bg-amber-900/20'} p-4 rounded-lg`}>
          <h4 className={`text-sm font-medium ${data.net_change >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400'}`}>Net Change</h4>
          <p className="text-2xl font-bold">${data.net_change.toLocaleString()}</p>
        </div>
      </div>

      <div className="h-[300px] mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
            <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`]} />
            <Legend />
            <Bar dataKey="value" name="Amount" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-lg font-medium mb-2">Top Income Sources</h4>
          {data.top_income_categories.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Category</th>
                  <th className="text-right py-2">Amount</th>
                  <th className="text-right py-2">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {data.top_income_categories.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2">{item.category}</td>
                    <td className="text-right py-2">${item.amount.toLocaleString()}</td>
                    <td className="text-right py-2">{item.percentage.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-muted-foreground">No income data available</p>
          )}
        </div>

        <div>
          <h4 className="text-lg font-medium mb-2">Top Expense Categories</h4>
          {data.top_expense_categories.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Category</th>
                  <th className="text-right py-2">Amount</th>
                  <th className="text-right py-2">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {data.top_expense_categories.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2">{item.category}</td>
                    <td className="text-right py-2">${item.amount.toLocaleString()}</td>
                    <td className="text-right py-2">{item.percentage.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-muted-foreground">No expense data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MonthlySummary;
