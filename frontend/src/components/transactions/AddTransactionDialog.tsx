import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { format } from 'date-fns';
// Helper function to format dates without relying on date-fns
const formatDateForInput = (date: Date): string => {
  try {
    // Format as YYYY-MM-DD for input[type="date"]
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

interface Account {
  id: string;
  name: string;
}

interface AddTransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (transaction: any) => void;
  accounts: Account[];
  categories: string[];
}

const AddTransactionDialog = ({
  isOpen,
  onClose,
  onAdd,
  accounts,
  categories
}: AddTransactionDialogProps) => {
  const [formData, setFormData] = useState({
    accountId: '',
    date: formatDateForInput(new Date()),
    amount: '',
    payee: '',
    category: '',
    description: '',
    isReconciled: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.accountId) {
      newErrors.accountId = 'Account is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    }

    if (!formData.payee) {
      newErrors.payee = 'Payee is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Convert amount to number and format date
      const parsedAmount = parseFloat(formData.amount);
      const formattedDate = new Date(formData.date).toISOString();

      onAdd({
        ...formData,
        amount: parsedAmount,
        date: formattedDate
      });

      // Reset form
      setFormData({
        accountId: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        amount: '',
        payee: '',
        category: '',
        description: '',
        isReconciled: false
      });
      setErrors({});
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Transaction</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="account" className="text-right">
              Account
            </Label>
            <div className="col-span-3">
              <Select
                value={formData.accountId}
                onValueChange={(value) => handleChange('accountId', value)}
              >
                <SelectTrigger id="account" className={errors.accountId ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.accountId && (
                <p className="text-red-500 text-xs mt-1">{errors.accountId}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Date
            </Label>
            <div className="col-span-3">
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className={errors.date ? 'border-red-500' : ''}
              />
              {errors.date && (
                <p className="text-red-500 text-xs mt-1">{errors.date}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <div className="col-span-3">
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="Use negative for expenses"
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                className={errors.amount ? 'border-red-500' : ''}
              />
              {errors.amount && (
                <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="payee" className="text-right">
              Payee
            </Label>
            <div className="col-span-3">
              <Input
                id="payee"
                placeholder="Who was paid"
                value={formData.payee}
                onChange={(e) => handleChange('payee', e.target.value)}
                className={errors.payee ? 'border-red-500' : ''}
              />
              {errors.payee && (
                <p className="text-red-500 text-xs mt-1">{errors.payee}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <div className="col-span-3">
              <Select
                value={formData.category}
                onValueChange={(value) => handleChange('category', value)}
              >
                <SelectTrigger id="category" className={errors.category ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-red-500 text-xs mt-1">{errors.category}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input
              id="description"
              placeholder="Optional details"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reconciled" className="text-right">
              Reconciled
            </Label>
            <div className="flex items-center space-x-2 col-span-3">
              <Checkbox
                id="reconciled"
                checked={formData.isReconciled}
                onCheckedChange={(checked) =>
                  handleChange('isReconciled', checked === true)
                }
              />
              <label
                htmlFor="reconciled"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Mark as reconciled
              </label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add Transaction</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddTransactionDialog;
