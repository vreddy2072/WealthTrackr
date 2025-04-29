"""
Transaction Service Module (Database Version)

This module provides services for managing transactions in the WealthTrackr application,
using the database repository for persistence.
"""
from typing import List, Dict, Optional, Any
from datetime import datetime
from sqlalchemy.orm import Session

from backend.database.repositories.transaction_repository import TransactionRepository
from backend.database.models.transaction import Transaction
from backend.database.models.account import Account

class TransactionServiceDB:
    """Service for managing transactions using database persistence."""

    def __init__(self, db: Session):
        """
        Initialize the transaction service with a database session.

        Args:
            db (Session): The database session.
        """
        self.repository = TransactionRepository(db)

    def get_all_transactions(self) -> List[Dict[str, Any]]:
        """
        Get all transactions.

        Returns:
            List[Dict[str, Any]]: A list of all transactions.
        """
        transactions = self.repository.get_all_transactions()
        return [self._transaction_to_dict(transaction) for transaction in transactions]

    def get_transaction_by_id(self, transaction_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a transaction by its ID.

        Args:
            transaction_id (str): The ID of the transaction to retrieve.

        Returns:
            Optional[Dict[str, Any]]: The transaction if found, None otherwise.
        """
        transaction = self.repository.get_transaction_by_id(transaction_id)
        if transaction:
            return self._transaction_to_dict(transaction)
        return None

    def get_transactions_by_account(self, account_id: str) -> List[Dict[str, Any]]:
        """
        Get all transactions for a specific account.

        Args:
            account_id (str): The ID of the account to get transactions for.

        Returns:
            List[Dict[str, Any]]: A list of transactions for the specified account.
        """
        transactions = self.repository.get_transactions_by_account(account_id)
        return [self._transaction_to_dict(transaction) for transaction in transactions]

    def get_filtered_transactions(self, filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Get transactions filtered by various criteria.

        Args:
            filters (Dict[str, Any]): The filter criteria.

        Returns:
            List[Dict[str, Any]]: A list of transactions matching the filter criteria.
        """
        transactions = self.repository.filter_transactions(filters)
        return [self._transaction_to_dict(transaction) for transaction in transactions]

    def add_transaction(self, transaction_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Add a new transaction.

        Args:
            transaction_data (Dict[str, Any]): The data for the new transaction.

        Returns:
            Dict[str, Any]: The newly created transaction.
        """
        transaction = self.repository.create_transaction(transaction_data)
        return self._transaction_to_dict(transaction)

    def update_transaction(self, transaction_id: str, transaction_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Update an existing transaction.

        Args:
            transaction_id (str): The ID of the transaction to update.
            transaction_data (Dict[str, Any]): The new data for the transaction.

        Returns:
            Optional[Dict[str, Any]]: The updated transaction if found, None otherwise.
        """
        transaction = self.repository.update_transaction(transaction_id, transaction_data)
        if transaction:
            return self._transaction_to_dict(transaction)
        return None

    def delete_transaction(self, transaction_id: str) -> bool:
        """
        Delete a transaction.

        Args:
            transaction_id (str): The ID of the transaction to delete.

        Returns:
            bool: True if the transaction was deleted, False otherwise.
        """
        return self.repository.delete_transaction(transaction_id)

    def import_transactions(self, account_id: str, transactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Import multiple transactions for an account.

        Args:
            account_id (str): The ID of the account to import transactions for.
            transactions (List[Dict[str, Any]]): The list of transactions to import.

        Returns:
            List[Dict[str, Any]]: The list of imported transactions.
        """
        # Set the account_id for all transactions
        for transaction in transactions:
            transaction["account_id"] = account_id

        # Import the transactions
        imported_transactions = self.repository.import_transactions(transactions)
        return [self._transaction_to_dict(transaction) for transaction in imported_transactions]

    def search_transactions(self, query: str) -> List[Dict[str, Any]]:
        """
        Search for transactions by payee, category, or description.

        Args:
            query (str): The search query.

        Returns:
            List[Dict[str, Any]]: A list of transactions matching the query.
        """
        transactions = self.repository.search_transactions(query)
        return [self._transaction_to_dict(transaction) for transaction in transactions]

    def get_categories(self) -> List[str]:
        """
        Get all unique transaction categories.

        Returns:
            List[str]: A list of unique categories.
        """
        # Get all transactions
        transactions = self.repository.get_all_transactions()

        # Extract unique categories
        categories = set()
        for transaction in transactions:
            if transaction.category:
                categories.add(transaction.category)

        return sorted(list(categories))

    def _transaction_to_dict(self, transaction: Transaction) -> Dict[str, Any]:
        """
        Convert a Transaction model to a dictionary.

        Args:
            transaction (Transaction): The transaction model to convert.

        Returns:
            Dict[str, Any]: The transaction as a dictionary.
        """
        account_name = transaction.account.name if transaction.account else None

        return {
            "id": transaction.id,
            "account_id": transaction.account_id,
            "account_name": account_name,
            "date": transaction.date.isoformat() if transaction.date else None,
            "amount": transaction.amount,
            "payee": transaction.payee if hasattr(transaction, "payee") else transaction.description,
            "category": transaction.category,
            "description": transaction.description,
            "is_reconciled": transaction.is_reconciled if hasattr(transaction, "is_reconciled") else False,
            "created_at": transaction.created_at.isoformat() if transaction.created_at else None,
            "updated_at": transaction.updated_at.isoformat() if transaction.updated_at else None
        }
