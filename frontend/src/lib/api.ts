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
    const response = await fetch(`${API_BASE_URL}/accounts/summary/total-balance`);
    if (!response.ok) {
      throw new Error(`Failed to fetch total balance: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Get net worth (assets minus liabilities)
   */
  getNetWorth: async (): Promise<number> => {
    const response = await fetch(`${API_BASE_URL}/accounts/summary/net-worth`);
    if (!response.ok) {
      throw new Error(`Failed to fetch net worth: ${response.statusText}`);
    }
    return response.json();
  },
};
