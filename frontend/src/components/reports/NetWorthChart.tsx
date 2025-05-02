import React, { useEffect, useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface NetWorthChartProps {
  startDate: string;
  endDate: string;
  interval?: string;
}

interface NetWorthDataPoint {
  date: string;
  net_worth: number;
}

const NetWorthChart: React.FC<NetWorthChartProps> = ({ 
  startDate, 
  endDate, 
  interval = 'month' 
}) => {
  const [data, setData] = useState<NetWorthDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Construct the API URL with query parameters
        const params = new URLSearchParams();
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        if (interval) params.append('interval', interval);
        
        const response = await fetch(`http://localhost:8000/api/reports/net-worth-history?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch net worth history: ${response.statusText}`);
        }
        
        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        console.error('Error fetching net worth history:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [startDate, endDate, interval]);

  // Format the data for the chart
  const formattedData = data.map(item => ({
    ...item,
    date: format(parseISO(item.date), 'MMM yyyy'),
    netWorth: item.net_worth
  }));

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
          Failed to load net worth data: {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (data.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Data</AlertTitle>
        <AlertDescription>
          No net worth data available for the selected date range.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={formattedData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis 
          tickFormatter={(value) => `$${value.toLocaleString()}`}
        />
        <Tooltip 
          formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Net Worth']}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="netWorth"
          name="Net Worth"
          stroke="#8884d8"
          activeDot={{ r: 8 }}
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default NetWorthChart;
