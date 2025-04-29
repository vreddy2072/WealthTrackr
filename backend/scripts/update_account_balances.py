"""
Script to update account balances based on transaction sums.

This script calculates the sum of all transactions for each account and
updates the account balance to match this sum, ensuring consistency between
account balances and transactions.
"""
import sqlite3
from datetime import datetime
import os
import sys

# Add the project root to the Python path to allow imports from other modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

def update_account_balances():
    """
    Update account balances based on transaction sums.
    
    This function:
    1. Connects to the database
    2. Gets all accounts
    3. For each account, calculates the sum of all its transactions
    4. Updates the account balance to match the transaction sum
    5. Verifies the updates
    """
    # Get the database path relative to this script
    db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../database/data/wealthtrackr.db'))
    
    # Connect to the database
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    print("Updating account balances based on transaction sums...")
    print("====================================================")
    
    # Get all accounts
    cursor.execute("SELECT * FROM accounts")
    accounts = [dict(row) for row in cursor.fetchall()]
    
    for account in accounts:
        account_id = account['id']
        account_name = account['name']
        current_balance = account['balance']
        
        # Calculate sum of transactions for this account
        cursor.execute("SELECT SUM(amount) as total FROM transactions WHERE account_id = ?", (account_id,))
        result = cursor.fetchone()
        transaction_sum = result['total'] if result['total'] is not None else 0.0
        
        print(f"Account: {account_name} (ID: {account_id})")
        print(f"  Current balance: ${current_balance:,.2f}")
        print(f"  Transaction sum: ${transaction_sum:,.2f}")
        
        # Update the account balance
        cursor.execute(
            "UPDATE accounts SET balance = ?, updated_at = ? WHERE id = ?",
            (transaction_sum, datetime.now().isoformat(), account_id)
        )
        
        print(f"  Updated balance to: ${transaction_sum:,.2f}")
        print()
    
    # Commit the changes
    conn.commit()
    
    # Verify the updates
    print("Verification after updates:")
    print("==========================")
    
    # Get updated account balances
    cursor.execute("SELECT id, name, balance FROM accounts")
    updated_accounts = [dict(row) for row in cursor.fetchall()]
    
    # Calculate total balance
    total_balance = sum(account['balance'] for account in updated_accounts)
    
    for account in updated_accounts:
        print(f"Account: {account['name']} (ID: {account['id']})")
        print(f"  New balance: ${account['balance']:,.2f}")
    
    print(f"\nNew total balance: ${total_balance:,.2f}")
    
    # Close the connection
    conn.close()

if __name__ == "__main__":
    update_account_balances()
