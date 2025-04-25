import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { FilterX } from 'lucide-react';

// Ensure we have a non-empty value for the SelectItem
const ALL_OPTION_VALUE = 'all';

interface Account {
  id: string;
  name: string;
}

interface FilterState {
  account: string;
  category: string;
  startDate: string;
  endDate: string;
  minAmount: string;
  maxAmount: string;
  isReconciled: boolean | null;
}

interface TransactionFiltersProps {
  accounts: Account[];
  categories: string[];
  onFilterChange: (filters: FilterState) => void;
  activeFilters: FilterState;
}

const TransactionFilters = ({
  accounts,
  categories,
  onFilterChange,
  activeFilters
}: TransactionFiltersProps) => {
  const [filters, setFilters] = useState<FilterState>(activeFilters);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  useEffect(() => {
    // Check if any filters are active
    const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
      if (key === 'isReconciled') return value !== null;
      return value !== '';
    }).length;

    setHasActiveFilters(activeFilterCount > 0);

    // Notify parent component of filter changes
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      account: '',
      category: '',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
      isReconciled: null
    });
  };

  return (
    <div className="space-y-4">
      {hasActiveFilters && (
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium">Active Filters</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetFilters}
            className="h-8 px-2 text-muted-foreground"
          >
            <FilterX className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>
      )}

      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="account-filter">Account</Label>
          <Select
            value={filters.account || ALL_OPTION_VALUE}
            onValueChange={(value) => handleFilterChange('account', value === ALL_OPTION_VALUE ? '' : value)}
          >
            <SelectTrigger id="account-filter">
              <SelectValue placeholder="All accounts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_OPTION_VALUE}>All accounts</SelectItem>
              {accounts && accounts.length > 0 && accounts.filter(account => account && account.id).map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name || 'Unknown Account'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category-filter">Category</Label>
          <Select
            value={filters.category || ALL_OPTION_VALUE}
            onValueChange={(value) => handleFilterChange('category', value === ALL_OPTION_VALUE ? '' : value)}
          >
            <SelectTrigger id="category-filter">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_OPTION_VALUE}>All categories</SelectItem>
              {categories && categories.length > 0 && categories.filter(category => category).map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator className="my-4" />

        <div className="space-y-2">
          <Label htmlFor="date-range">Date Range</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="start-date" className="sr-only">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                placeholder="From"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="end-date" className="sr-only">End Date</Label>
              <Input
                id="end-date"
                type="date"
                placeholder="To"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="space-y-2">
          <Label htmlFor="amount-range">Amount Range</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="min-amount" className="sr-only">Min Amount</Label>
              <Input
                id="min-amount"
                type="number"
                placeholder="Min"
                value={filters.minAmount}
                onChange={(e) => handleFilterChange('minAmount', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="max-amount" className="sr-only">Max Amount</Label>
              <Input
                id="max-amount"
                type="number"
                placeholder="Max"
                value={filters.maxAmount}
                onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
              />
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex items-center justify-between">
          <Label htmlFor="reconciled-filter">Reconciled Only</Label>
          <Switch
            id="reconciled-filter"
            checked={filters.isReconciled === true}
            onCheckedChange={(checked) =>
              handleFilterChange('isReconciled', checked ? true : null)
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="unreconciled-filter">Unreconciled Only</Label>
          <Switch
            id="unreconciled-filter"
            checked={filters.isReconciled === false}
            onCheckedChange={(checked) =>
              handleFilterChange('isReconciled', checked ? false : null)
            }
          />
        </div>
      </div>
    </div>
  );
};

export default TransactionFilters;
