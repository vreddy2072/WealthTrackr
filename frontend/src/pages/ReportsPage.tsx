import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import NetWorthChart from '@/components/reports/NetWorthChart';
import SpendingByCategory from '@/components/reports/SpendingByCategory';
import MonthlySummary from '@/components/reports/MonthlySummary';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

const ReportsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
    to: new Date(),
  });

  const handleDownloadReport = () => {
    // This will be implemented in the "Download Reports" user story
    console.log('Download report');
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Reports & Dashboards</h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
          <DateRangePicker
            dateRange={dateRange}
            setDateRange={setDateRange}
          />
          <Button onClick={handleDownloadReport} className="flex items-center gap-2">
            <Download size={16} />
            Download Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="net-worth" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="net-worth">Net Worth</TabsTrigger>
          <TabsTrigger value="spending">Spending by Category</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="net-worth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Net Worth Over Time</CardTitle>
              <CardDescription>
                Track your net worth (assets minus liabilities) over time
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <NetWorthChart
                startDate={dateRange.from?.toISOString() || ''}
                endDate={dateRange.to?.toISOString() || ''}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="spending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
              <CardDescription>
                Breakdown of your spending by category
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <SpendingByCategory
                startDate={dateRange.from?.toISOString() || ''}
                endDate={dateRange.to?.toISOString() || ''}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Summary</CardTitle>
              <CardDescription>
                Summary of income and expenses for the selected month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MonthlySummary
                year={dateRange.to?.getFullYear() || new Date().getFullYear()}
                month={(dateRange.to?.getMonth() || new Date().getMonth()) + 1}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;
