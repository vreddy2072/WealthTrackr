"""
Script to check if account balances match the sum of their transactions.

This script compares the balance stored in each account with the sum of all
transactions for that account, highlighting any discrepancies.
"""
import sys
import os
import requests

# Add the project root to the Python path to allow imports from other modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

def main():
    """
    Main function to check account balances against transaction sums.
    """
    # Get all accounts
    accounts = requests.get('http://localhost:8000/api/accounts/').json()
    
    # Get all transactions
    transactions = requests.get('http://localhost:8000/api/transactions/').json()
    
    print('Account Balances vs Transaction Sums:')
    print('====================================')
    
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
        print()
    
    # Print totals
    print('Summary:')
    print(f'Total account balances: ${total_account_balance:,.2f}')
    print(f'Total transaction sums: ${total_transaction_sum:,.2f}')
    print(f'Overall difference: ${total_account_balance - total_transaction_sum:,.2f}')

if __name__ == "__main__":
    main()
