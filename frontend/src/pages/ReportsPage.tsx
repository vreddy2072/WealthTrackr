import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import NetWorthChart from '@/components/reports/NetWorthChart';
import SpendingByCategory from '@/components/reports/SpendingByCategory';
import MonthlySummary from '@/components/reports/MonthlySummary';
import { SeparateDateRangePicker } from '@/components/reports/SeparateDateRangePicker';
import ExportReportDialog from '@/components/reports/ExportReportDialog';
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
  const [activeTab, setActiveTab] = useState<string>('net-worth');
  const [isExportDialogOpen, setIsExportDialogOpen] = useState<boolean>(false);
  const [selectedMonthYear, setSelectedMonthYear] = useState<{year: number, month: number}>({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  });

  const handleDownloadReport = () => {
    setIsExportDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
        <h1 className="text-3xl font-bold">Reports & Dashboards</h1>
        <div className="flex flex-col sm:flex-row items-start gap-4 w-full md:w-auto">
          <div className="flex-grow">
            <SeparateDateRangePicker
              dateRange={dateRange}
              setDateRange={setDateRange}
            />
          </div>
          <Button onClick={handleDownloadReport} className="flex items-center gap-2 mt-auto">
            <Download size={16} />
            Download Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="net-worth" className="w-full" onValueChange={setActiveTab}>
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
                startDate={dateRange.from?.toISOString() || ''}
                endDate={dateRange.to?.toISOString() || ''}
                onMonthYearChange={(year, month) => setSelectedMonthYear({year, month})}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Export Report Dialog */}
      <ExportReportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        startDate={dateRange.from}
        endDate={dateRange.to}
        activeTab={activeTab}
        selectedYear={selectedMonthYear.year}
        selectedMonth={selectedMonthYear.month}
      />
    </div>
  );
};

export default ReportsPage;
