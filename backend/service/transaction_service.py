"""
Transaction Service Module

This module provides services for managing transactions in the WealthTrackr application.
"""
from datetime import datetime
from typing import List, Dict, Optional, Any
from uuid import uuid4

class TransactionService:
    """Service for managing transactions."""
    
    def __init__(self):
        """Initialize the transaction service with dummy data."""
        self.transactions = [
            {
                "id": str(uuid4()),
                "account_id": "acc-001",
                "account_name": "Checking Account",
                "date": datetime(2025, 4, 15).isoformat(),
                "amount": -45.67,
                "payee": "Grocery Store",
                "category": "Groceries",
                "description": "Weekly grocery shopping",
                "is_reconciled": True,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            },
            {
                "id": str(uuid4()),
                "account_id": "acc-001",
                "account_name": "Checking Account",
                "date": datetime(2025, 4, 14).isoformat(),
                "amount": -120.00,
                "payee": "Electric Company",
                "category": "Utilities",
                "description": "Monthly electric bill",
                "is_reconciled": True,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            },
            {
                "id": str(uuid4()),
                "account_id": "acc-002",
                "account_name": "Savings Account",
                "date": datetime(2025, 4, 13).isoformat(),
                "amount": 1000.00,
                "payee": "Employer",
                "category": "Income",
                "description": "Salary deposit",
                "is_reconciled": True,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            },
            {
                "id": str(uuid4()),
                "account_id": "acc-003",
                "account_name": "Credit Card",
                "date": datetime(2025, 4, 12).isoformat(),
                "amount": -65.99,
                "payee": "Restaurant",
                "category": "Dining",
                "description": "Dinner with friends",
                "is_reconciled": False,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            },
            {
                "id": str(uuid4()),
                "account_id": "acc-003",
                "account_name": "Credit Card",
                "date": datetime(2025, 4, 11).isoformat(),
                "amount": -29.99,
                "payee": "Streaming Service",
                "category": "Entertainment",
                "description": "Monthly subscription",
                "is_reconciled": False,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            }
        ]
    
    def get_all_transactions(self) -> List[Dict[str, Any]]:
        """
        Get all transactions.
        
        Returns:
            List[Dict[str, Any]]: A list of all transactions.
        """
        return self.transactions
    
    def get_transaction_by_id(self, transaction_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a transaction by its ID.
        
        Args:
            transaction_id (str): The ID of the transaction to retrieve.
            
        Returns:
            Optional[Dict[str, Any]]: The transaction if found, None otherwise.
        """
        for transaction in self.transactions:
            if transaction["id"] == transaction_id:
                return transaction
        return None
    
    def get_transactions_by_account(self, account_id: str) -> List[Dict[str, Any]]:
        """
        Get all transactions for a specific account.
        
        Args:
            account_id (str): The ID of the account to get transactions for.
            
        Returns:
            List[Dict[str, Any]]: A list of transactions for the specified account.
        """
        return [t for t in self.transactions if t["account_id"] == account_id]
    
    def add_transaction(self, transaction_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Add a new transaction.
        
        Args:
            transaction_data (Dict[str, Any]): The data for the new transaction.
            
        Returns:
            Dict[str, Any]: The newly created transaction.
        """
        # In a real implementation, we would validate the data here
        new_transaction = {
            "id": str(uuid4()),
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "is_reconciled": False,
            **transaction_data
        }
        self.transactions.append(new_transaction)
        return new_transaction
    
    def update_transaction(self, transaction_id: str, transaction_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Update an existing transaction.
        
        Args:
            transaction_id (str): The ID of the transaction to update.
            transaction_data (Dict[str, Any]): The new data for the transaction.
            
        Returns:
            Optional[Dict[str, Any]]: The updated transaction if found, None otherwise.
        """
        for i, transaction in enumerate(self.transactions):
            if transaction["id"] == transaction_id:
                self.transactions[i] = {
                    **transaction,
                    **transaction_data,
                    "updated_at": datetime.now().isoformat()
                }
                return self.transactions[i]
        return None
    
    def delete_transaction(self, transaction_id: str) -> bool:
        """
        Delete a transaction.
        
        Args:
            transaction_id (str): The ID of the transaction to delete.
            
        Returns:
            bool: True if the transaction was deleted, False otherwise.
        """
        for i, transaction in enumerate(self.transactions):
            if transaction["id"] == transaction_id:
                del self.transactions[i]
                return True
        return False
    
    def search_transactions(self, query: str) -> List[Dict[str, Any]]:
        """
        Search for transactions by payee, category, or description.
        
        Args:
            query (str): The search query.
            
        Returns:
            List[Dict[str, Any]]: A list of transactions matching the query.
        """
        query = query.lower()
        return [
            t for t in self.transactions 
            if query in t["payee"].lower() 
            or query in t["category"].lower() 
            or query in t["description"].lower()
        ]
    
    def filter_transactions(self, filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Filter transactions based on various criteria.
        
        Args:
            filters (Dict[str, Any]): The filter criteria.
            
        Returns:
            List[Dict[str, Any]]: A list of transactions matching the filter criteria.
        """
        result = self.transactions
        
        if "account_id" in filters:
            result = [t for t in result if t["account_id"] == filters["account_id"]]
        
        if "category" in filters:
            result = [t for t in result if t["category"] == filters["category"]]
        
        if "start_date" in filters:
            start_date = datetime.fromisoformat(filters["start_date"])
            result = [t for t in result if datetime.fromisoformat(t["date"]) >= start_date]
        
        if "end_date" in filters:
            end_date = datetime.fromisoformat(filters["end_date"])
            result = [t for t in result if datetime.fromisoformat(t["date"]) <= end_date]
        
        if "min_amount" in filters:
            result = [t for t in result if t["amount"] >= filters["min_amount"]]
        
        if "max_amount" in filters:
            result = [t for t in result if t["amount"] <= filters["max_amount"]]
        
        if "is_reconciled" in filters:
            result = [t for t in result if t["is_reconciled"] == filters["is_reconciled"]]
        
        return result
