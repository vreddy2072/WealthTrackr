"""
Script to check account balances against transaction sums directly from the database.

This script connects to the SQLite database and compares the balance stored in each account
with the sum of all transactions for that account, highlighting any discrepancies.
"""
import sqlite3
import os
import sys

# Add the project root to the Python path to allow imports from other modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')))

def main():
    """
    Main function to check account balances against transaction sums from the database.
    """
    # Get the database path relative to this script
    db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../data/wealthtrackr.db'))
    
    # Connect to the database
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Get all accounts
    cursor.execute("SELECT * FROM accounts")
    accounts = [dict(row) for row in cursor.fetchall()]
    
    # Get all transactions
    cursor.execute("SELECT * FROM transactions")
    transactions = [dict(row) for row in cursor.fetchall()]
    
    print('Account Balances vs Transaction Sums (Direct from DB):')
    print('====================================================')
    
    total_account_balance = 0
    total_transaction_sum = 0
    
    for account in accounts:
        account_id = account['id']
        account_name = account['name']
        account_balance = account['balance']
        
        # Find all transactions for this account
        account_transactions = [t for t in transactions if t['account_id'] == account_id]
        transaction_sum = sum(t['amount'] for t in account_transactions)
        
        # Add to totals
        total_account_balance += account_balance
        total_transaction_sum += transaction_sum
        
        # Print comparison
        print(f'Account: {account_name} (ID: {account_id})')
        print(f'  Balance in account: ${account_balance:,.2f}')
        print(f'  Sum of transactions: ${transaction_sum:,.2f}')
        print(f'  Difference: ${account_balance - transaction_sum:,.2f}')
        print(f'  Number of transactions: {len(account_transactions)}')
        print()
    
    # Print totals
    print('Summary:')
    print(f'Total account balances: ${total_account_balance:,.2f}')
    print(f'Total transaction sums: ${total_transaction_sum:,.2f}')
    print(f'Overall difference: ${total_account_balance - total_transaction_sum:,.2f}')
    print(f'Total number of transactions: {len(transactions)}')
    
    # Close the database connection
    conn.close()

if __name__ == "__main__":
    main()
