import React, { useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { accountsApi } from '@/lib/api';

interface SpendingByCategoryProps {
  startDate: string;
  endDate: string;
  accountId?: string;
}

interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#8DD1E1', '#A4DE6C', '#D0ED57'];

const SpendingByCategory: React.FC<SpendingByCategoryProps> = ({
  startDate,
  endDate,
  accountId
}) => {
  const [data, setData] = useState<CategoryData[]>([]);
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
      if (!startDate || !endDate) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Construct the API URL with query parameters
        const params = new URLSearchParams();
        params.append('start_date', startDate);
        params.append('end_date', endDate);
        if (selectedAccount) params.append('account_id', selectedAccount);

        console.log(`Fetching spending data with params: ${params.toString()}`);
        const response = await fetch(`http://localhost:8000/api/reports/spending-by-category?${params.toString()}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch spending data: ${response.statusText}`);
        }

        const jsonData = await response.json();
        console.log('Received spending data:', jsonData);
        setData(jsonData);
      } catch (err) {
        console.error('Error fetching spending data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate, selectedAccount]);

  const handleAccountChange = (value: string) => {
    setSelectedAccount(value === 'all' ? '' : value);
  };

  // Always render the account selector at the top
  const accountSelector = (
    <div className="mb-4">
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
  );

  if (loading) {
    return (
      <div className="w-full h-full">
        {accountSelector}
        <div className="flex flex-col gap-4">
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full">
        {accountSelector}
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load spending data: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full h-full">
        {accountSelector}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Data</AlertTitle>
          <AlertDescription>
            No spending data available for the selected date range.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {accountSelector}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="amount"
              nameKey="category"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Amount']}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>

        <div className="overflow-auto h-full">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Category</th>
                <th className="text-right py-2">Amount</th>
                <th className="text-right py-2">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2">{item.category}</td>
                  <td className="text-right py-2">${item.amount.toLocaleString()}</td>
                  <td className="text-right py-2">{item.percentage.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SpendingByCategory;
