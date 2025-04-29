import React, { useState, useEffect } from 'react';
import { useAccounts } from '../../lib/contexts/AccountContext';
import { AccountType, Institution, Account, accountsApi } from '../../lib/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { AlertCircle } from 'lucide-react';

interface AccountFormProps {
  accountId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const AccountForm: React.FC<AccountFormProps> = ({ accountId, onSuccess, onCancel }) => {
  const { addAccount, updateAccount } = useAccounts();
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    institution: '',
    balance: 0,
    currency: 'USD',
    notes: '',
  });

  const isEditMode = !!accountId;

  // Fetch account types and institutions
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [typesData, institutionsData] = await Promise.all([
          accountsApi.getAccountTypes(),
          accountsApi.getInstitutions(),
        ]);
        setAccountTypes(typesData);
        setInstitutions(institutionsData);
      } catch (err) {
        setError('Failed to load form data. Please try again.');
        console.error('Error fetching form data:', err);
      }
    };

    fetchData();
  }, []);

  // If in edit mode, fetch the account data
  useEffect(() => {
    if (isEditMode && accountId) {
      const fetchAccount = async () => {
        try {
          setLoading(true);
          const account = await accountsApi.getById(accountId);
          setFormData({
            name: account.name,
            type: account.type,
            institution: account.institution,
            balance: account.balance,
            currency: account.currency,
            notes: account.notes || '',
          });
          setLoading(false);
        } catch (err) {
          setError('Failed to load account data. Please try again.');
          console.error('Error fetching account:', err);
          setLoading(false);
        }
      };

      fetchAccount();
    }
  }, [accountId, isEditMode]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'balance' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditMode && accountId) {
        await updateAccount(accountId, formData);
      } else {
        await addAccount(formData);
      }
      setLoading(false);
      onSuccess();
    } catch (err) {
      setError(
        `Failed to ${isEditMode ? 'update' : 'create'} account. Please check your inputs and try again.`
      );
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} account:`, err);
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Loading Account Data...</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">
          {isEditMode ? 'Edit Account' : 'Add New Account'}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 p-3 rounded-md text-red-800 flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Account Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Primary Checking"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Account Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleSelectChange('type', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                {accountTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="institution">Financial Institution</Label>
            <Select
              value={formData.institution}
              onValueChange={(value) => handleSelectChange('institution', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select institution" />
              </SelectTrigger>
              <SelectContent>
                {institutions.map((institution) => (
                  <SelectItem key={institution.id} value={institution.name}>
                    {institution.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="balance">Current Balance</Label>
            <div className="flex">
              <Select
                value={formData.currency}
                onValueChange={(value) => handleSelectChange('currency', value)}
                required
              >
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="CAD">CAD</SelectItem>
                  <SelectItem value="AUD">AUD</SelectItem>
                  <SelectItem value="JPY">JPY</SelectItem>
                </SelectContent>
              </Select>
              <Input
                id="balance"
                name="balance"
                type="number"
                step="0.01"
                value={formData.balance}
                onChange={handleChange}
                className="flex-1 ml-2"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Use negative values for credit cards and loans
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any additional information about this account"
              rows={3}
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : isEditMode ? 'Update Account' : 'Add Account'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AccountForm;
