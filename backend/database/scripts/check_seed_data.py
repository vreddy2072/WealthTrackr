"""
Script to check seed data in the database.

This script connects to the SQLite database and displays all transactions,
which is useful for verifying that seed data was properly loaded.
"""
import sqlite3
import os
import sys

# Add the project root to the Python path to allow imports from other modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')))

def main():
    """
    Main function to display all transactions in the database.
    """
    # Get the database path relative to this script
    db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../data/wealthtrackr.db'))
    
    # Connect to the database
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Get all transactions
    cursor.execute("SELECT * FROM transactions")
    transactions = [dict(row) for row in cursor.fetchall()]
    
    print('All Transactions in Database:')
    print('============================')
    
    for t in transactions:
        print(f"ID: {t['id']}")
        print(f"  Account ID: {t['account_id']}")
        print(f"  Date: {t['date']}")
        print(f"  Amount: ${t['amount']:,.2f}")
        print(f"  Description: {t.get('description', '')}")
        print(f"  Category: {t.get('category', '')}")
        print(f"  Is Reconciled: {t.get('is_reconciled', False)}")
        print()
    
    # Close the database connection
    conn.close()

if __name__ == "__main__":
    main()
