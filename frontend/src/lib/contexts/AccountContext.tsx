import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Account, AccountCreateData, AccountUpdateData, accountsApi } from '../api';

// Define the state type
interface AccountState {
  accounts: Account[];
  loading: boolean;
  error: string | null;
}

// Define the action types
type AccountAction =
  | { type: 'FETCH_ACCOUNTS_REQUEST' }
  | { type: 'FETCH_ACCOUNTS_SUCCESS'; payload: Account[] }
  | { type: 'FETCH_ACCOUNTS_FAILURE'; payload: string }
  | { type: 'ADD_ACCOUNT_SUCCESS'; payload: Account }
  | { type: 'UPDATE_ACCOUNT_SUCCESS'; payload: Account }
  | { type: 'DELETE_ACCOUNT_SUCCESS'; payload: string };

// Initial state
const initialState: AccountState = {
  accounts: [],
  loading: false,
  error: null,
};

// Create the context
const AccountContext = createContext<{
  state: AccountState;
  fetchAccounts: () => Promise<void>;
  addAccount: (accountData: AccountCreateData) => Promise<Account>;
  updateAccount: (id: string, accountData: AccountUpdateData) => Promise<Account>;
  deleteAccount: (id: string) => Promise<void>;
} | undefined>(undefined);

// Reducer function
const accountReducer = (state: AccountState, action: AccountAction): AccountState => {
  switch (action.type) {
    case 'FETCH_ACCOUNTS_REQUEST':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'FETCH_ACCOUNTS_SUCCESS':
      return {
        ...state,
        loading: false,
        accounts: action.payload,
        error: null,
      };
    case 'FETCH_ACCOUNTS_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'ADD_ACCOUNT_SUCCESS':
      return {
        ...state,
        accounts: [...state.accounts, action.payload],
      };
    case 'UPDATE_ACCOUNT_SUCCESS':
      return {
        ...state,
        accounts: state.accounts.map((account) =>
          account.id === action.payload.id ? action.payload : account
        ),
      };
    case 'DELETE_ACCOUNT_SUCCESS':
      return {
        ...state,
        accounts: state.accounts.filter((account) => account.id !== action.payload),
      };
    default:
      return state;
  }
};

// Provider component
export const AccountProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(accountReducer, initialState);

  const fetchAccounts = async () => {
    dispatch({ type: 'FETCH_ACCOUNTS_REQUEST' });
    try {
      console.log('Fetching accounts from API...');
      const accounts = await accountsApi.getAll();
      console.log('Accounts fetched successfully:', accounts);
      dispatch({ type: 'FETCH_ACCOUNTS_SUCCESS', payload: accounts });
    } catch (error) {
      console.error('Error fetching accounts:', error);
      dispatch({
        type: 'FETCH_ACCOUNTS_FAILURE',
        payload: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  };

  const addAccount = async (accountData: AccountCreateData): Promise<Account> => {
    try {
      const newAccount = await accountsApi.create(accountData);
      dispatch({ type: 'ADD_ACCOUNT_SUCCESS', payload: newAccount });
      return newAccount;
    } catch (error) {
      dispatch({
        type: 'FETCH_ACCOUNTS_FAILURE',
        payload: error instanceof Error ? error.message : 'An unknown error occurred',
      });
      throw error;
    }
  };

  const updateAccount = async (id: string, accountData: AccountUpdateData): Promise<Account> => {
    try {
      const updatedAccount = await accountsApi.update(id, accountData);
      dispatch({ type: 'UPDATE_ACCOUNT_SUCCESS', payload: updatedAccount });
      return updatedAccount;
    } catch (error) {
      dispatch({
        type: 'FETCH_ACCOUNTS_FAILURE',
        payload: error instanceof Error ? error.message : 'An unknown error occurred',
      });
      throw error;
    }
  };

  const deleteAccount = async (id: string): Promise<void> => {
    try {
      await accountsApi.delete(id);
      dispatch({ type: 'DELETE_ACCOUNT_SUCCESS', payload: id });
    } catch (error) {
      dispatch({
        type: 'FETCH_ACCOUNTS_FAILURE',
        payload: error instanceof Error ? error.message : 'An unknown error occurred',
      });
      throw error;
    }
  };

  // Load accounts when the component mounts
  useEffect(() => {
    console.log('AccountContext: Loading accounts on mount');
    fetchAccounts();
  }, []);

  // Debug state changes
  useEffect(() => {
    console.log('AccountContext state updated:', state);
  }, [state]);

  return (
    <AccountContext.Provider
      value={{
        state,
        fetchAccounts,
        addAccount,
        updateAccount,
        deleteAccount,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

// Custom hook to use the account context
export const useAccounts = () => {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error('useAccounts must be used within an AccountProvider');
  }
  return context;
};
