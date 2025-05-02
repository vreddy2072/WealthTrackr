import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertCircle, Download } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

interface ExportReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  startDate: Date | undefined;
  endDate: Date | undefined;
  activeTab: string;
  selectedYear?: number;
  selectedMonth?: number;
}

const ExportReportDialog = ({
  isOpen,
  onClose,
  startDate,
  endDate,
  activeTab,
  selectedYear,
  selectedMonth
}: ExportReportDialogProps) => {
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams();
      params.append('format', format);

      // Add date range parameters
      if (startDate) params.append('start_date', startDate.toISOString());
      if (endDate) params.append('end_date', endDate.toISOString());

      // Add report type parameter based on active tab
      params.append('report_type', activeTab);

      // Add year and month parameters for monthly summary
      if (activeTab === 'monthly') {
        // Make sure we have valid year and month values
        const year = selectedYear || new Date().getFullYear();
        const month = selectedMonth || new Date().getMonth() + 1;

        console.log(`Exporting monthly report for ${year}-${month}`);
        params.append('year', year.toString());
        params.append('month', month.toString());
      }

      // Construct the export URL
      const exportUrl = `${API_BASE_URL}/export/report?${params.toString()}`;

      // Open the URL in a new tab to trigger download
      window.open(exportUrl, '_blank');

      // Close the dialog
      onClose();
    } catch (err) {
      console.error('Error exporting report:', err);
      setError('Failed to export report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export Report</DialogTitle>
          <DialogDescription>
            Download your financial report in your preferred format.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="report-type" className="text-right">
              Report Type
            </Label>
            <div className="col-span-3">
              <Select disabled value={activeTab}>
                <SelectTrigger id="report-type">
                  <SelectValue>
                    {activeTab === 'net-worth' && 'Net Worth Over Time'}
                    {activeTab === 'spending' && 'Spending by Category'}
                    {activeTab === 'monthly' && 'Monthly Summary'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="net-worth">Net Worth Over Time</SelectItem>
                  <SelectItem value="spending">Spending by Category</SelectItem>
                  <SelectItem value="monthly">Monthly Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="format" className="text-right">
              Format
            </Label>
            <div className="col-span-3">
              <Select
                value={format}
                onValueChange={(value: 'csv' | 'json') => setFormat(value)}
              >
                <SelectTrigger id="format">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Date Range</Label>
            <div className="col-span-3">
              <p className="text-sm text-muted-foreground">
                {startDate ? startDate.toLocaleDateString() : 'Start date'} - {endDate ? endDate.toLocaleDateString() : 'End date'}
              </p>
            </div>
          </div>

          {error && (
            <div className="col-span-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>Processing...</>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportReportDialog;
