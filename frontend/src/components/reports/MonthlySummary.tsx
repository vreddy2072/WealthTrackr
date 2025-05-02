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
import { AlertCircle, ChevronDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { accountsApi } from '@/lib/api';
import { format, addMonths, isBefore, isAfter, startOfMonth, endOfMonth, parseISO } from 'date-fns';

interface MonthlySummaryProps {
  year: number;
  month: number;
  accountId?: string;
  startDate?: string;
  endDate?: string;
  onMonthYearChange?: (year: number, month: number) => void;
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
  accountId,
  startDate,
  endDate,
  onMonthYearChange
}) => {
  const [data, setData] = useState<MonthlySummaryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(year);
  const [selectedMonth, setSelectedMonth] = useState<number>(month);
  const [availableMonths, setAvailableMonths] = useState<{year: number, month: number, label: string}[]>([]);

  // Generate a list of months within the date range
  useEffect(() => {
    if (startDate && endDate) {
      try {
        const start = startOfMonth(parseISO(startDate));
        const end = endOfMonth(parseISO(endDate));
        const months = [];

        let currentDate = start;
        while (isBefore(currentDate, end) || currentDate.getTime() === end.getTime()) {
          const currentYear = currentDate.getFullYear();
          const currentMonth = currentDate.getMonth() + 1; // 1-12
          const monthName = format(currentDate, 'MMMM yyyy');

          months.push({
            year: currentYear,
            month: currentMonth,
            label: monthName
          });

          currentDate = addMonths(currentDate, 1);
        }

        // Sort in reverse chronological order (newest first)
        months.sort((a, b) => {
          if (a.year !== b.year) return b.year - a.year;
          return b.month - a.month;
        });

        setAvailableMonths(months);

        // Only set default month if we haven't already selected one
        // or if the current selection is outside the available range
        if (months.length > 0 && (
          !selectedYear ||
          !selectedMonth ||
          !months.some(m => m.year === selectedYear && m.month === selectedMonth)
        )) {
          const latestMonth = months[0];
          setSelectedYear(latestMonth.year);
          setSelectedMonth(latestMonth.month);

          // Call the callback if provided
          if (onMonthYearChange) {
            onMonthYearChange(latestMonth.year, latestMonth.month);
          }
        }
      } catch (err) {
        console.error('Error processing date range:', err);
      }
    }
  }, [startDate, endDate, onMonthYearChange, selectedYear, selectedMonth]);

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
      if (!selectedYear || !selectedMonth) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Construct the API URL with query parameters
        const params = new URLSearchParams();
        params.append('year', selectedYear.toString());
        params.append('month', selectedMonth.toString());
        if (selectedAccount) params.append('account_id', selectedAccount);

        console.log(`Fetching monthly summary with params: ${params.toString()}`);
        const response = await fetch(`http://localhost:8000/api/reports/monthly-summary?${params.toString()}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch monthly summary: ${response.statusText}`);
        }

        const jsonData = await response.json();
        console.log('Received monthly summary data:', jsonData);
        setData(jsonData);
      } catch (err) {
        console.error('Error fetching monthly summary:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedYear, selectedMonth, selectedAccount]);

  const handleAccountChange = (value: string) => {
    setSelectedAccount(value === 'all' ? '' : value);
  };

  const handleMonthChange = (value: string) => {
    const [yearStr, monthStr] = value.split('-');
    const newYear = parseInt(yearStr);
    const newMonth = parseInt(monthStr);
    setSelectedYear(newYear);
    setSelectedMonth(newMonth);

    // Call the callback if provided
    if (onMonthYearChange) {
      onMonthYearChange(newYear, newMonth);
    }
  };

  const chartData = [
    { name: 'Income', value: data?.income || 0 },
    { name: 'Expenses', value: data?.expenses || 0 },
    { name: 'Net Change', value: data?.net_change || 0 }
  ];

  // Always render the account selector and month/year display
  const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long' });

  const headerSection = (
    <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <h3 className="text-lg font-medium">
        Summary for {monthName} {selectedYear}
      </h3>
      <div className="flex flex-col sm:flex-row gap-2">
        <Select
          value={`${selectedYear}-${selectedMonth}`}
          onValueChange={handleMonthChange}
          disabled={availableMonths.length === 0}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Month" />
          </SelectTrigger>
          <SelectContent>
            {availableMonths.map((item) => (
              <SelectItem key={`${item.year}-${item.month}`} value={`${item.year}-${item.month}`}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedAccount} onValueChange={handleAccountChange}>
          <SelectTrigger className="w-[180px]">
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
    </div>
  );

  if (loading) {
    return (
      <div className="w-full h-full">
        {headerSection}
        <div className="flex flex-col gap-4">
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full">
        {headerSection}
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load monthly summary: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full h-full">
        {headerSection}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Data</AlertTitle>
          <AlertDescription>
            No monthly summary data available for the selected month.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="w-full">
      {headerSection}

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
