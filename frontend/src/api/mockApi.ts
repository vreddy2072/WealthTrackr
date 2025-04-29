// Mock data for transactions
const mockTransactions = [
  {
    id: 'trans-001',
    accountId: 'acc-001',
    accountName: 'Primary Checking',
    date: '2025-04-15T10:30:00Z',
    amount: -45.67,
    payee: 'Grocery Store',
    category: 'Groceries',
    description: 'Weekly grocery shopping',
    isReconciled: true,
    createdAt: '2025-04-15T10:30:00Z',
    updatedAt: '2025-04-15T10:30:00Z'
  },
  {
    id: 'trans-002',
    accountId: 'acc-001',
    accountName: 'Primary Checking',
    date: '2025-04-14T15:45:00Z',
    amount: -25.00,
    payee: 'Gas Station',
    category: 'Transportation',
    description: 'Fuel for car',
    isReconciled: true,
    createdAt: '2025-04-14T15:45:00Z',
    updatedAt: '2025-04-14T15:45:00Z'
  },
  {
    id: 'trans-003',
    accountId: 'acc-001',
    accountName: 'Primary Checking',
    date: '2025-04-13T09:15:00Z',
    amount: -12.50,
    payee: 'Coffee Shop',
    category: 'Dining',
    description: 'Morning coffee',
    isReconciled: false,
    createdAt: '2025-04-13T09:15:00Z',
    updatedAt: '2025-04-13T09:15:00Z'
  },
  {
    id: 'trans-004',
    accountId: 'acc-002',
    accountName: 'Emergency Savings',
    date: '2025-04-10T12:00:00Z',
    amount: 500.00,
    payee: 'Transfer from Checking',
    category: 'Transfer',
    description: 'Monthly savings transfer',
    isReconciled: true,
    createdAt: '2025-04-10T12:00:00Z',
    updatedAt: '2025-04-10T12:00:00Z'
  },
  {
    id: 'trans-005',
    accountId: 'acc-003',
    accountName: 'Rewards Credit Card',
    date: '2025-04-08T18:30:00Z',
    amount: -89.99,
    payee: 'Online Store',
    category: 'Shopping',
    description: 'New headphones',
    isReconciled: false,
    createdAt: '2025-04-08T18:30:00Z',
    updatedAt: '2025-04-08T18:30:00Z'
  }
];

// Mock data for accounts
const mockAccounts = [
  { id: 'acc-001', name: 'Primary Checking' },
  { id: 'acc-002', name: 'Emergency Savings' },
  { id: 'acc-003', name: 'Rewards Credit Card' },
  { id: 'acc-004', name: 'Vacation Fund' },
  { id: 'acc-005', name: 'Investment Portfolio' }
];

// Mock data for categories
const mockCategories = [
  'Groceries',
  'Transportation',
  'Dining',
  'Shopping',
  'Entertainment',
  'Utilities',
  'Housing',
  'Healthcare',
  'Income',
  'Transfer',
  'Other'
];

// Mock API functions
export const fetchTransactions = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return [...mockTransactions];
};

export const fetchAccounts = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return [...mockAccounts];
};

export const fetchCategories = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return [...mockCategories];
};

export const addTransaction = async (transaction: any) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newTransaction = {
    id: `trans-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isReconciled: false,
    ...transaction,
    accountName: mockAccounts.find(a => a.id === transaction.accountId)?.name || 'Unknown Account'
  };
  
  mockTransactions.unshift(newTransaction);
  
  return newTransaction;
};

export const updateTransaction = async (id: string, data: any) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = mockTransactions.findIndex(t => t.id === id);
  
  if (index === -1) {
    throw new Error('Transaction not found');
  }
  
  const updatedTransaction = {
    ...mockTransactions[index],
    ...data,
    updatedAt: new Date().toISOString(),
    accountName: data.accountId 
      ? mockAccounts.find(a => a.id === data.accountId)?.name || mockTransactions[index].accountName
      : mockTransactions[index].accountName
  };
  
  mockTransactions[index] = updatedTransaction;
  
  return updatedTransaction;
};

export const deleteTransaction = async (id: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = mockTransactions.findIndex(t => t.id === id);
  
  if (index === -1) {
    throw new Error('Transaction not found');
  }
  
  mockTransactions.splice(index, 1);
  
  return { success: true };
};
