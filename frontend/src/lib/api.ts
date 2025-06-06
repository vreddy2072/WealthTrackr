/**
 * API client for the WealthTrackr backend
 */

// Use the proxy configured in vite.config.ts
export const API_BASE_URL = '/api';

// Default fetch options to include CORS headers
const defaultFetchOptions = {
  mode: 'cors',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};

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
    const response = await fetch(`${API_BASE_URL}/transactions/`, defaultFetchOptions);
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
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, defaultFetchOptions);
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
      ...defaultFetchOptions,
      method: 'POST',
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
      ...defaultFetchOptions,
      method: 'PUT',
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
      ...defaultFetchOptions,
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
    const response = await fetch(`${API_BASE_URL}/transactions/categories`, defaultFetchOptions);
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
      ...defaultFetchOptions,
      method: 'POST',
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
    const response = await fetch(`${API_BASE_URL}/accounts/`, defaultFetchOptions);
    if (!response.ok) {
      throw new Error(`Failed to fetch accounts: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Get accounts by type
   */
  getByType: async (type: string): Promise<Account[]> => {
    const response = await fetch(`${API_BASE_URL}/accounts/?type=${encodeURIComponent(type)}`, defaultFetchOptions);
    if (!response.ok) {
      throw new Error(`Failed to fetch accounts by type: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Get accounts by institution
   */
  getByInstitution: async (institution: string): Promise<Account[]> => {
    const response = await fetch(`${API_BASE_URL}/accounts/?institution=${encodeURIComponent(institution)}`, defaultFetchOptions);
    if (!response.ok) {
      throw new Error(`Failed to fetch accounts by institution: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Get a specific account by ID
   */
  getById: async (id: string): Promise<Account> => {
    const response = await fetch(`${API_BASE_URL}/accounts/${id}`, defaultFetchOptions);
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
      ...defaultFetchOptions,
      method: 'POST',
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
      ...defaultFetchOptions,
      method: 'PUT',
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
      ...defaultFetchOptions,
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
    const response = await fetch(`${API_BASE_URL}/accounts/types/all`, defaultFetchOptions);
    if (!response.ok) {
      throw new Error(`Failed to fetch account types: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Get all financial institutions
   */
  getInstitutions: async (): Promise<Institution[]> => {
    const response = await fetch(`${API_BASE_URL}/accounts/institutions/all`, defaultFetchOptions);
    if (!response.ok) {
      throw new Error(`Failed to fetch institutions: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Get total balance across all accounts
   */
  getTotalBalance: async (): Promise<number> => {
    const response = await fetch(`${API_BASE_URL}/accounts/stats/total-balance`, defaultFetchOptions);
    if (!response.ok) {
      throw new Error(`Failed to fetch total balance: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Get net worth (assets minus liabilities)
   */
  getNetWorth: async (): Promise<number> => {
    const response = await fetch(`${API_BASE_URL}/accounts/stats/net-worth`, defaultFetchOptions);
    if (!response.ok) {
      throw new Error(`Failed to fetch net worth: ${response.statusText}`);
    }
    return response.json();
  },
};

/**
 * API client for reports
 */
export const reportsApi = {
  // Add reports API methods here
};

/**
 * Bank connection type definition
 */
export interface BankConnection {
  id: string;
  institution_id: string;
  status: string;
  last_sync_at?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
  institution: Institution;
  connected_accounts: string[];
}

/**
 * Bank connection account link type definition
 */
export interface BankConnectionAccount {
  id: string;
  bank_connection_id: string;
  account_id: string;
  external_account_id: string;
  last_sync_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * API client for bank connections
 */
export const bankConnectionsApi = {
  /**
   * Get all bank connections
   */
  getAll: async (institutionId?: string): Promise<BankConnection[]> => {
    const url = institutionId
      ? `${API_BASE_URL}/bank-connections?institution_id=${institutionId}`
      : `${API_BASE_URL}/bank-connections`;

    const response = await fetch(url, defaultFetchOptions);
    if (!response.ok) {
      throw new Error(`Failed to fetch bank connections: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Get a bank connection by ID
   */
  getById: async (connectionId: string): Promise<BankConnection> => {
    const response = await fetch(`${API_BASE_URL}/bank-connections/${connectionId}`, defaultFetchOptions);
    if (!response.ok) {
      throw new Error(`Failed to fetch bank connection: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Create a new bank connection
   */
  create: async (institutionId: string, publicToken: string): Promise<BankConnection> => {
    const response = await fetch(`${API_BASE_URL}/bank-connections`, {
      ...defaultFetchOptions,
      method: 'POST',
      body: JSON.stringify({
        institution_id: institutionId,
        public_token: publicToken
      }),
    });
    if (!response.ok) {
      // Try to get more detailed error information from the response
      try {
        const errorData = await response.json();
        throw new Error(`Failed to create bank connection: ${errorData.detail || response.statusText}`);
      } catch (e) {
        // If we can't parse the error response, use the status text
        throw new Error(`Failed to create bank connection: ${response.statusText}`);
      }
    }
    return response.json();
  },

  /**
   * Update a bank connection
   */
  update: async (connectionId: string, data: { status?: string; error_message?: string }): Promise<BankConnection> => {
    const response = await fetch(`${API_BASE_URL}/bank-connections/${connectionId}`, {
      ...defaultFetchOptions,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to update bank connection: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Delete a bank connection
   */
  delete: async (connectionId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/bank-connections/${connectionId}`, {
      ...defaultFetchOptions,
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete bank connection: ${response.statusText}`);
    }
  },

  /**
   * Link an account to a bank connection
   */
  linkAccount: async (connectionId: string, accountId: string, externalAccountId: string): Promise<BankConnectionAccount> => {
    const response = await fetch(`${API_BASE_URL}/bank-connections/${connectionId}/accounts`, {
      ...defaultFetchOptions,
      method: 'POST',
      body: JSON.stringify({
        bank_connection_id: connectionId,
        account_id: accountId,
        external_account_id: externalAccountId
      }),
    });
    if (!response.ok) {
      throw new Error(`Failed to link account to bank connection: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Unlink an account from a bank connection
   */
  unlinkAccount: async (connectionId: string, accountId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/bank-connections/${connectionId}/accounts/${accountId}`, {
      ...defaultFetchOptions,
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to unlink account from bank connection: ${response.statusText}`);
    }
  },

  /**
   * Sync transactions for an account
   */
  syncAccountTransactions: async (connectionId: string, accountId: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/bank-connections/${connectionId}/accounts/${accountId}/sync`, {
      ...defaultFetchOptions,
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error(`Failed to sync account transactions: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Get a Plaid link token
   */
  getPlaidLinkToken: async (): Promise<{ link_token: string; expiration: string }> => {
    const response = await fetch(`${API_BASE_URL}/bank-connections/plaid/link-token`, defaultFetchOptions);
    if (!response.ok) {
      throw new Error(`Failed to get Plaid link token: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Get supported financial institutions
   */
  getSupportedInstitutions: async (): Promise<Institution[]> => {
    const response = await fetch(`${API_BASE_URL}/bank-connections/institutions`, defaultFetchOptions);
    if (!response.ok) {
      throw new Error(`Failed to get supported institutions: ${response.statusText}`);
    }
    return response.json();
  }
};

/**
 * Budget API types
 */
export interface BudgetItem {
  id: number;
  amount: number;
  type: string;
  section: string; // e.g., 'income', 'bills', etc.
  month: string;
}

export interface BudgetItemCreate {
  amount: number;
  type: string;
  section: string;
  month: string;
}

export interface BudgetResponse {
  month: string;
  items: BudgetItem[];
}

export const budgetApi = {
  getBudget: async (month?: string): Promise<BudgetResponse> => {
    const url = month ? `${API_BASE_URL}/budget/?month=${encodeURIComponent(month)}` : `${API_BASE_URL}/budget/`;
    const response = await fetch(url, defaultFetchOptions);
    if (!response.ok) {
      throw new Error(`Failed to fetch budget: ${response.statusText}`);
    }
    return response.json();
  },
  createBudget: async (item: BudgetItemCreate): Promise<BudgetItem> => {
    const response = await fetch(`${API_BASE_URL}/budget/`, {
      ...defaultFetchOptions,
      method: 'POST',
      body: JSON.stringify(item),
    });
    if (!response.ok) {
      throw new Error(`Failed to create budget item: ${response.statusText}`);
    }
    return response.json();
  },
  updateBudget: async (id: number, item: BudgetItem): Promise<BudgetItem> => {
    const response = await fetch(`${API_BASE_URL}/budget/${id}`, {
      ...defaultFetchOptions,
      method: 'PUT',
      body: JSON.stringify(item),
    });
    if (!response.ok) {
      throw new Error(`Failed to update budget item: ${response.statusText}`);
    }
    return response.json();
  },
  deleteBudget: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/budget/${id}`, {
      ...defaultFetchOptions,
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete budget item: ${response.statusText}`);
    }
  },
};
