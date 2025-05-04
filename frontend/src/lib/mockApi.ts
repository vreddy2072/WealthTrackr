/**
 * Mock API client for the WealthTrackr application
 * Used when the backend is not available
 */

import {
  Account,
  AccountCreateData,
  AccountType,
  AccountUpdateData,
  BankConnection,
  BankConnectionAccount,
  Institution,
  Transaction,
  TransactionFilters
} from './api';

import {
  mockAccounts,
  mockBankConnections,
  mockInstitutions,
  mockTransactions,
  generateId,
  getCurrentDate
} from './mockData';

/**
 * Mock API client for bank connections
 */
export const mockBankConnectionsApi = {
  /**
   * Get all bank connections
   */
  getAll: async (institutionId?: string): Promise<BankConnection[]> => {
    console.log('Mock API: Getting all bank connections');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (institutionId) {
      return mockBankConnections.filter(conn => conn.institution_id === institutionId);
    }
    
    return [...mockBankConnections];
  },

  /**
   * Get a bank connection by ID
   */
  getById: async (connectionId: string): Promise<BankConnection> => {
    console.log(`Mock API: Getting bank connection with ID ${connectionId}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const connection = mockBankConnections.find(conn => conn.id === connectionId);
    
    if (!connection) {
      throw new Error(`Bank connection with ID ${connectionId} not found`);
    }
    
    return { ...connection };
  },

  /**
   * Create a new bank connection
   */
  create: async (institutionId: string, publicToken: string): Promise<BankConnection> => {
    console.log(`Mock API: Creating bank connection for institution ${institutionId}`);
    console.log(`Mock API: Public token: ${publicToken}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find the institution
    const institution = mockInstitutions.find(inst => inst.id === institutionId);
    
    if (!institution) {
      throw new Error(`Institution with ID ${institutionId} not found`);
    }
    
    // Create a new connection
    const newConnection: BankConnection = {
      id: generateId('conn'),
      institution_id: institutionId,
      status: 'active',
      created_at: getCurrentDate(),
      updated_at: getCurrentDate(),
      institution: { ...institution },
      connected_accounts: []
    };
    
    // Add to mock data
    mockBankConnections.push(newConnection);
    
    return { ...newConnection };
  },

  /**
   * Update a bank connection
   */
  update: async (connectionId: string, data: { status?: string; error_message?: string }): Promise<BankConnection> => {
    console.log(`Mock API: Updating bank connection with ID ${connectionId}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const connectionIndex = mockBankConnections.findIndex(conn => conn.id === connectionId);
    
    if (connectionIndex === -1) {
      throw new Error(`Bank connection with ID ${connectionId} not found`);
    }
    
    // Update the connection
    const updatedConnection = {
      ...mockBankConnections[connectionIndex],
      ...data,
      updated_at: getCurrentDate()
    };
    
    mockBankConnections[connectionIndex] = updatedConnection;
    
    return { ...updatedConnection };
  },

  /**
   * Delete a bank connection
   */
  delete: async (connectionId: string): Promise<void> => {
    console.log(`Mock API: Deleting bank connection with ID ${connectionId}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const connectionIndex = mockBankConnections.findIndex(conn => conn.id === connectionId);
    
    if (connectionIndex === -1) {
      throw new Error(`Bank connection with ID ${connectionId} not found`);
    }
    
    // Remove the connection
    mockBankConnections.splice(connectionIndex, 1);
  },

  /**
   * Link an account to a bank connection
   */
  linkAccount: async (connectionId: string, accountId: string, externalAccountId: string): Promise<BankConnectionAccount> => {
    console.log(`Mock API: Linking account ${accountId} to bank connection ${connectionId}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const connectionIndex = mockBankConnections.findIndex(conn => conn.id === connectionId);
    
    if (connectionIndex === -1) {
      throw new Error(`Bank connection with ID ${connectionId} not found`);
    }
    
    const account = mockAccounts.find(acc => acc.id === accountId);
    
    if (!account) {
      throw new Error(`Account with ID ${accountId} not found`);
    }
    
    // Add the account to the connection
    if (!mockBankConnections[connectionIndex].connected_accounts.includes(accountId)) {
      mockBankConnections[connectionIndex].connected_accounts.push(accountId);
    }
    
    // Create a link object
    const link: BankConnectionAccount = {
      id: generateId('link'),
      bank_connection_id: connectionId,
      account_id: accountId,
      external_account_id: externalAccountId,
      created_at: getCurrentDate(),
      updated_at: getCurrentDate()
    };
    
    return link;
  },

  /**
   * Unlink an account from a bank connection
   */
  unlinkAccount: async (connectionId: string, accountId: string): Promise<void> => {
    console.log(`Mock API: Unlinking account ${accountId} from bank connection ${connectionId}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const connectionIndex = mockBankConnections.findIndex(conn => conn.id === connectionId);
    
    if (connectionIndex === -1) {
      throw new Error(`Bank connection with ID ${connectionId} not found`);
    }
    
    // Remove the account from the connection
    const accountIndex = mockBankConnections[connectionIndex].connected_accounts.indexOf(accountId);
    
    if (accountIndex !== -1) {
      mockBankConnections[connectionIndex].connected_accounts.splice(accountIndex, 1);
    }
  },

  /**
   * Sync transactions for an account
   */
  syncAccountTransactions: async (connectionId: string, accountId: string): Promise<any> => {
    console.log(`Mock API: Syncing transactions for account ${accountId} from bank connection ${connectionId}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const connectionIndex = mockBankConnections.findIndex(conn => conn.id === connectionId);
    
    if (connectionIndex === -1) {
      throw new Error(`Bank connection with ID ${connectionId} not found`);
    }
    
    const account = mockAccounts.find(acc => acc.id === accountId);
    
    if (!account) {
      throw new Error(`Account with ID ${accountId} not found`);
    }
    
    // Generate some random transactions
    const numTransactions = Math.floor(Math.random() * 5) + 1; // 1-5 transactions
    const newTransactions = [];
    
    for (let i = 0; i < numTransactions; i++) {
      const isIncome = Math.random() < 0.2; // 20% chance of being income
      const amount = isIncome ? Math.random() * 1000 + 100 : -(Math.random() * 100 + 10);
      const categories = ['Food', 'Transportation', 'Shopping', 'Entertainment', 'Bills'];
      const category = isIncome ? 'Income' : categories[Math.floor(Math.random() * categories.length)];
      const payees = ['Store', 'Restaurant', 'Gas Station', 'Online Shop', 'Utility Company'];
      const payee = payees[Math.floor(Math.random() * payees.length)];
      
      const transaction: Transaction = {
        id: generateId('txn'),
        account_id: accountId,
        date: getCurrentDate(),
        amount: parseFloat(amount.toFixed(2)),
        payee,
        category,
        description: `Transaction at ${payee}`,
        is_reconciled: false,
        created_at: getCurrentDate(),
        updated_at: getCurrentDate()
      };
      
      mockTransactions.push(transaction);
      newTransactions.push(transaction);
    }
    
    // Update the connection's last sync time
    mockBankConnections[connectionIndex].last_sync_at = getCurrentDate();
    
    // Update the account balance
    const accountIndex = mockAccounts.findIndex(acc => acc.id === accountId);
    if (accountIndex !== -1) {
      const newTransactionsTotal = newTransactions.reduce((total, txn) => total + txn.amount, 0);
      mockAccounts[accountIndex].balance += newTransactionsTotal;
      mockAccounts[accountIndex].updated_at = getCurrentDate();
    }
    
    return {
      success: true,
      message: `Synced ${newTransactions.length} transactions successfully`,
      transactions_created: newTransactions.length,
      new_balance: mockAccounts[accountIndex].balance,
      last_sync_at: getCurrentDate()
    };
  },

  /**
   * Get a Plaid link token
   */
  getPlaidLinkToken: async (): Promise<{ link_token: string; expiration: string }> => {
    console.log('Mock API: Getting Plaid link token');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      link_token: `link-sandbox-${Math.random().toString(36).substring(2, 15)}`,
      expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes from now
    };
  },

  /**
   * Get supported financial institutions
   */
  getSupportedInstitutions: async (): Promise<Institution[]> => {
    console.log('Mock API: Getting supported institutions');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [...mockInstitutions];
  }
};

/**
 * Mock API client for accounts
 */
export const mockAccountsApi = {
  /**
   * Get all accounts
   */
  getAll: async (): Promise<Account[]> => {
    console.log('Mock API: Getting all accounts');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [...mockAccounts];
  },

  /**
   * Create a new account
   */
  create: async (accountData: AccountCreateData): Promise<Account> => {
    console.log('Mock API: Creating new account', accountData);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newAccount: Account = {
      id: generateId('acc'),
      name: accountData.name,
      type: accountData.type,
      institution: accountData.institution,
      balance: accountData.balance,
      currency: accountData.currency,
      notes: accountData.notes,
      is_active: true,
      created_at: getCurrentDate(),
      updated_at: getCurrentDate()
    };
    
    mockAccounts.push(newAccount);
    
    return { ...newAccount };
  },

  /**
   * Get all financial institutions
   */
  getInstitutions: async (): Promise<Institution[]> => {
    console.log('Mock API: Getting all institutions');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [...mockInstitutions];
  },
};
