"""
Balance Service Module

This module provides services for managing account balances in relation to transactions.
"""
from sqlalchemy.orm import Session
from backend.database.models.account import Account
from backend.database.models.transaction import Transaction

class BalanceService:
    """Service for managing account balances."""
    
    def __init__(self, db: Session):
        """Initialize the balance service with a database session."""
        self.db = db
    
    def update_account_balance(self, account_id: str) -> float:
        """
        Update an account's balance based on its transactions.
        
        Args:
            account_id (str): The ID of the account to update.
            
        Returns:
            float: The new account balance.
        """
        # Get the account
        account = self.db.query(Account).filter(Account.id == account_id).first()
        if not account:
            raise ValueError(f"Account with ID {account_id} not found")
        
        # Calculate the sum of transactions
        transaction_sum = self.db.query(Transaction).with_entities(
            Transaction.amount
        ).filter(
            Transaction.account_id == account_id
        ).all()
        
        new_balance = sum(t.amount for t in transaction_sum) if transaction_sum else 0.0
        
        # Update the account balance
        account.balance = new_balance
        self.db.commit()
        
        return new_balance
    
    def update_all_account_balances(self) -> float:
        """
        Update all account balances based on their transactions.
        
        Returns:
            float: The new total balance across all accounts.
        """
        # Get all accounts
        accounts = self.db.query(Account).all()
        
        total_balance = 0.0
        
        for account in accounts:
            new_balance = self.update_account_balance(account.id)
            total_balance += new_balance
        
        return total_balance
