/**
 * API client for the WealthTrackr backend
 */

const API_BASE_URL = 'http://localhost:8000/api';

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
