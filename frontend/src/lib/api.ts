/**
 * API client for the WealthTrackr backend
 */

const API_BASE_URL = 'http://localhost:8000/api';

/**
 * Transaction interface
 */
export interface Transaction {
  id: string;
  account_id: string;
  date: string;
  amount: number;
  payee: string;
  category: string;
  description: string;
  is_reconciled: boolean;
  created_at: string;
  updated_at: string;
  // Frontend-specific fields
  accountName?: string;
  accountId?: string;
  isReconciled?: boolean;
}

/**
 * Transaction filters interface
 */
export interface TransactionFilters {
  accountId?: string;
  category?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  isReconciled?: boolean;
}

/**
 * Account type definition
 */
export interface Account {
  id: string;
  name: string;
  type: string;
  institution: string;
  balance: number;
  currency: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Account type definition
 */
export interface AccountType {
  id: string;
  name: string;
}

/**
 * Financial institution definition
 */
export interface Institution {
  id: string;
  name: string;
}

/**
 * Account creation data
 */
export interface AccountCreateData {
  name: string;
  type: string;
  institution: string;
  balance: number;
  currency: string;
  notes?: string;
}

/**
 * Account update data
 */
export interface AccountUpdateData {
  name?: string;
  type?: string;
  institution?: string;
  balance?: number;
  currency?: string;
  notes?: string;
  is_active?: boolean;
}

/**
 * API client for transactions
 */
export const transactionsApi = {
  /**
   * Get all transactions
   */
  getAll: async (): Promise<Transaction[]> => {
    const response = await fetch(`${API_BASE_URL}/transactions/`);
    if (!response.ok) {
      throw new Error(`Failed to fetch transactions: ${response.statusText}`);
    }
    const data = await response.json();

    // Map backend field names to frontend field names if needed
    return data.map((transaction: any) => ({
      ...transaction,
      accountId: transaction.account_id,
      isReconciled: transaction.is_reconciled
    }));
  },

  /**
   * Get a specific transaction by ID
   */
  getById: async (id: string): Promise<Transaction> => {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch transaction: ${response.statusText}`);
    }
    const data = await response.json();
    return {
      ...data,
      accountId: data.account_id,
      isReconciled: data.is_reconciled
    };
  },

  /**
   * Create a new transaction
   */
  create: async (transactionData: any): Promise<Transaction> => {
    // Convert frontend field names to backend field names
    const apiData = {
      ...transactionData,
      account_id: transactionData.accountId,
      is_reconciled: transactionData.isReconciled
    };

    const response = await fetch(`${API_BASE_URL}/transactions/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiData),
    });
    if (!response.ok) {
      throw new Error(`Failed to create transaction: ${response.statusText}`);
    }
    const data = await response.json();
    return {
      ...data,
      accountId: data.account_id,
      isReconciled: data.is_reconciled
    };
  },

  /**
   * Update an existing transaction
   */
  update: async (id: string, transactionData: any): Promise<Transaction> => {
    // Convert frontend field names to backend field names
    const apiData = {
      ...transactionData
    };
    if (transactionData.accountId) apiData.account_id = transactionData.accountId;
    if (transactionData.isReconciled !== undefined) apiData.is_reconciled = transactionData.isReconciled;

    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiData),
    });
    if (!response.ok) {
      throw new Error(`Failed to update transaction: ${response.statusText}`);
    }
    const data = await response.json();
    return {
      ...data,
      accountId: data.account_id,
      isReconciled: data.is_reconciled
    };
  },

  /**
   * Delete a transaction
   */
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete transaction: ${response.statusText}`);
    }
  },

  /**
   * Get all categories
   */
  getCategories: async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/transactions/categories`);
    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Import transactions from CSV or JSON
   */
  importTransactions: async (accountId: string, transactions: any[]): Promise<Transaction[]> => {
    const apiData = {
      account_id: accountId,
      transactions: transactions.map(t => ({
        ...t,
        account_id: t.accountId || accountId,
        is_reconciled: t.isReconciled !== undefined ? t.isReconciled : false
      }))
    };

    const response = await fetch(`${API_BASE_URL}/transactions/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiData),
    });

    if (!response.ok) {
      throw new Error(`Failed to import transactions: ${response.statusText}`);
    }

    const data = await response.json();
    return data.map((transaction: any) => ({
      ...transaction,
      accountId: transaction.account_id,
      isReconciled: transaction.is_reconciled
    }));
  },

  /**
   * Export transactions to CSV or JSON
   * @param format The export format (csv or json)
   * @param filters Optional filters to apply
   * @returns A URL to download the exported file
   */
  exportTransactions: async (format: 'csv' | 'json', filters?: TransactionFilters): Promise<string> => {
    // Build query parameters
    const params = new URLSearchParams();
    params.append('format', format);

    if (filters) {
      if (filters.accountId) params.append('account_id', filters.accountId);
      if (filters.category) params.append('category', filters.category);
      if (filters.startDate) params.append('start_date', filters.startDate.toISOString());
      if (filters.endDate) params.append('end_date', filters.endDate.toISOString());
      if (filters.minAmount !== undefined) params.append('min_amount', filters.minAmount.toString());
      if (filters.maxAmount !== undefined) params.append('max_amount', filters.maxAmount.toString());
      if (filters.isReconciled !== undefined) params.append('is_reconciled', filters.isReconciled.toString());
    }

    // Return the URL for the download
    return `${API_BASE_URL}/export/transactions?${params.toString()}`;
  },
};

/**
 * API client for accounts
 */
export const accountsApi = {
  /**
   * Get all accounts
   */
  getAll: async (): Promise<Account[]> => {
    const response = await fetch(`${API_BASE_URL}/accounts/`);
    if (!response.ok) {
      throw new Error(`Failed to fetch accounts: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Get accounts by type
   */
  getByType: async (type: string): Promise<Account[]> => {
    const response = await fetch(`${API_BASE_URL}/accounts/?type=${encodeURIComponent(type)}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch accounts by type: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Get accounts by institution
   */
  getByInstitution: async (institution: string): Promise<Account[]> => {
    const response = await fetch(`${API_BASE_URL}/accounts/?institution=${encodeURIComponent(institution)}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch accounts by institution: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Get a specific account by ID
   */
  getById: async (id: string): Promise<Account> => {
    const response = await fetch(`${API_BASE_URL}/accounts/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch account: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Create a new account
   */
  create: async (accountData: AccountCreateData): Promise<Account> => {
    const response = await fetch(`${API_BASE_URL}/accounts/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(accountData),
    });
    if (!response.ok) {
      throw new Error(`Failed to create account: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Update an existing account
   */
  update: async (id: string, accountData: AccountUpdateData): Promise<Account> => {
    const response = await fetch(`${API_BASE_URL}/accounts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(accountData),
    });
    if (!response.ok) {
      throw new Error(`Failed to update account: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Delete an account
   */
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/accounts/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete account: ${response.statusText}`);
    }
  },

  /**
   * Get all account types
   */
  getAccountTypes: async (): Promise<AccountType[]> => {
    const response = await fetch(`${API_BASE_URL}/accounts/types/all`);
    if (!response.ok) {
      throw new Error(`Failed to fetch account types: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Get all financial institutions
   */
  getInstitutions: async (): Promise<Institution[]> => {
    const response = await fetch(`${API_BASE_URL}/accounts/institutions/all`);
    if (!response.ok) {
      throw new Error(`Failed to fetch institutions: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Get total balance across all accounts
   */
  getTotalBalance: async (): Promise<number> => {
    const response = await fetch(`${API_BASE_URL}/accounts/stats/total-balance`);
    if (!response.ok) {
      throw new Error(`Failed to fetch total balance: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Get net worth (assets minus liabilities)
   */
  getNetWorth: async (): Promise<number> => {
    const response = await fetch(`${API_BASE_URL}/accounts/stats/net-worth`);
    if (!response.ok) {
      throw new Error(`Failed to fetch net worth: ${response.statusText}`);
    }
    return response.json();
  },
};
