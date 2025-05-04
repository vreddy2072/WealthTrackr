/**
 * Mock data for the WealthTrackr application
 * Used when the backend is not available
 */

import { Account, BankConnection, Institution, Transaction } from './api';

/**
 * Mock institutions
 */
export const mockInstitutions: Institution[] = [
  { id: 'ins_1', name: 'Chase' },
  { id: 'ins_2', name: 'Bank of America' },
  { id: 'ins_3', name: 'Wells Fargo' },
  { id: 'ins_4', name: 'Citibank' },
  { id: 'ins_5', name: 'Capital One' },
  { id: 'ins_6', name: 'American Express' },
  { id: 'ins_7', name: 'Discover' },
  { id: 'ins_8', name: 'US Bank' },
  { id: 'ins_9', name: 'PNC Bank' },
  { id: 'ins_10', name: 'TD Bank' },
];

/**
 * Mock accounts
 */
export const mockAccounts: Account[] = [
  {
    id: 'acc_1',
    name: 'Chase Checking',
    type: 'checking',
    institution: 'Chase',
    balance: 2500.75,
    currency: 'USD',
    is_active: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  {
    id: 'acc_2',
    name: 'Chase Savings',
    type: 'savings',
    institution: 'Chase',
    balance: 10000.50,
    currency: 'USD',
    is_active: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  {
    id: 'acc_3',
    name: 'Capital One 360 Checking',
    type: 'checking',
    institution: 'Capital One',
    balance: 3200.50,
    currency: 'USD',
    is_active: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  {
    id: 'acc_4',
    name: 'Capital One 360 Savings',
    type: 'savings',
    institution: 'Capital One',
    balance: 7500.25,
    currency: 'USD',
    is_active: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  {
    id: 'acc_5',
    name: 'Amex Platinum',
    type: 'credit',
    institution: 'American Express',
    balance: -2500.00,
    currency: 'USD',
    is_active: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
];

/**
 * Mock bank connections
 */
export const mockBankConnections: BankConnection[] = [
  {
    id: 'conn_1',
    institution_id: 'ins_1',
    status: 'active',
    last_sync_at: '2023-05-01T12:00:00Z',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-05-01T12:00:00Z',
    institution: { id: 'ins_1', name: 'Chase' },
    connected_accounts: ['acc_1', 'acc_2'],
  },
  {
    id: 'conn_2',
    institution_id: 'ins_5',
    status: 'active',
    last_sync_at: '2023-05-01T12:00:00Z',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-05-01T12:00:00Z',
    institution: { id: 'ins_5', name: 'Capital One' },
    connected_accounts: ['acc_3', 'acc_4'],
  },
  {
    id: 'conn_3',
    institution_id: 'ins_6',
    status: 'active',
    last_sync_at: '2023-05-01T12:00:00Z',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-05-01T12:00:00Z',
    institution: { id: 'ins_6', name: 'American Express' },
    connected_accounts: ['acc_5'],
  },
];

/**
 * Mock transactions
 */
export const mockTransactions: Transaction[] = [
  {
    id: 'txn_1',
    account_id: 'acc_1',
    date: '2023-05-01T00:00:00Z',
    amount: -50.25,
    payee: 'Grocery Store',
    category: 'Food',
    description: 'Weekly grocery shopping',
    is_reconciled: true,
    created_at: '2023-05-01T12:00:00Z',
    updated_at: '2023-05-01T12:00:00Z',
  },
  {
    id: 'txn_2',
    account_id: 'acc_1',
    date: '2023-05-02T00:00:00Z',
    amount: -25.00,
    payee: 'Gas Station',
    category: 'Transportation',
    description: 'Fuel',
    is_reconciled: true,
    created_at: '2023-05-02T12:00:00Z',
    updated_at: '2023-05-02T12:00:00Z',
  },
  {
    id: 'txn_3',
    account_id: 'acc_3',
    date: '2023-05-03T00:00:00Z',
    amount: -75.50,
    payee: 'Restaurant',
    category: 'Food',
    description: 'Dinner with friends',
    is_reconciled: false,
    created_at: '2023-05-03T12:00:00Z',
    updated_at: '2023-05-03T12:00:00Z',
  },
  {
    id: 'txn_4',
    account_id: 'acc_5',
    date: '2023-05-04T00:00:00Z',
    amount: -120.00,
    payee: 'Online Retailer',
    category: 'Shopping',
    description: 'New headphones',
    is_reconciled: false,
    created_at: '2023-05-04T12:00:00Z',
    updated_at: '2023-05-04T12:00:00Z',
  },
  {
    id: 'txn_5',
    account_id: 'acc_1',
    date: '2023-05-05T00:00:00Z',
    amount: 1500.00,
    payee: 'Employer',
    category: 'Income',
    description: 'Salary deposit',
    is_reconciled: true,
    created_at: '2023-05-05T12:00:00Z',
    updated_at: '2023-05-05T12:00:00Z',
  },
];

/**
 * Helper function to generate a unique ID
 */
export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Helper function to get the current date in ISO format
 */
export function getCurrentDate(): string {
  return new Date().toISOString();
}
