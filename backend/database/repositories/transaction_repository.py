"""
Transaction Repository Module

This module provides database operations for transaction management.
"""
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from uuid import uuid4
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from backend.database.models.transaction import Transaction
from backend.database.models.account import Account
from backend.service.balance_service import BalanceService

class TransactionRepository:
    """Repository for transaction database operations."""

    def __init__(self, db: Session):
        """
        Initialize the transaction repository.

        Args:
            db (Session): The database session.
        """
        self.db = db

    def get_all_transactions(self) -> List[Transaction]:
        """
        Get all transactions.

        Returns:
            List[Transaction]: A list of all transactions.
        """
        return self.db.query(Transaction).options(
            joinedload(Transaction.account)
        ).order_by(Transaction.date.desc()).all()

    def get_transaction_by_id(self, transaction_id: str) -> Optional[Transaction]:
        """
        Get a transaction by its ID.

        Args:
            transaction_id (str): The ID of the transaction to retrieve.

        Returns:
            Optional[Transaction]: The transaction if found, None otherwise.
        """
        return self.db.query(Transaction).options(
            joinedload(Transaction.account)
        ).filter(Transaction.id == transaction_id).first()

    def get_transactions_by_account(self, account_id: str) -> List[Transaction]:
        """
        Get all transactions for a specific account.

        Args:
            account_id (str): The ID of the account to get transactions for.

        Returns:
            List[Transaction]: A list of transactions for the specified account.
        """
        return self.db.query(Transaction).options(
            joinedload(Transaction.account)
        ).filter(Transaction.account_id == account_id).order_by(Transaction.date.desc()).all()

    def filter_transactions(self, filters: Dict[str, Any]) -> List[Transaction]:
        """
        Filter transactions based on various criteria.

        Args:
            filters (Dict[str, Any]): The filter criteria.

        Returns:
            List[Transaction]: A list of transactions matching the filter criteria.
        """
        query = self.db.query(Transaction).options(joinedload(Transaction.account))

        # Apply filters
        if "account_id" in filters:
            query = query.filter(Transaction.account_id == filters["account_id"])

        if "category" in filters:
            query = query.filter(Transaction.category == filters["category"])

        if "start_date" in filters:
            start_date = datetime.fromisoformat(filters["start_date"])
            query = query.filter(Transaction.date >= start_date)

        if "end_date" in filters:
            end_date = datetime.fromisoformat(filters["end_date"])
            query = query.filter(Transaction.date <= end_date)

        if "min_amount" in filters:
            query = query.filter(Transaction.amount >= filters["min_amount"])

        if "max_amount" in filters:
            query = query.filter(Transaction.amount <= filters["max_amount"])

        if "is_reconciled" in filters and hasattr(Transaction, "is_reconciled"):
            query = query.filter(Transaction.is_reconciled == filters["is_reconciled"])

        return query.order_by(Transaction.date.desc()).all()

    def create_transaction(self, transaction_data: Dict[str, Any]) -> Transaction:
        """
        Create a new transaction.

        Args:
            transaction_data (Dict[str, Any]): The data for the new transaction.

        Returns:
            Transaction: The newly created transaction.
        """
        # Generate a new transaction ID
        transaction_id = str(uuid4())

        # Create the new transaction
        new_transaction = Transaction(
            id=transaction_id,
            account_id=transaction_data.get("account_id"),
            date=transaction_data.get("date"),
            amount=transaction_data.get("amount"),
            description=transaction_data.get("description", ""),
            category=transaction_data.get("category", ""),
            is_income=transaction_data.get("amount", 0) > 0,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )

        # Add payee and is_reconciled if they exist in the model
        if "payee" in transaction_data:
            setattr(new_transaction, "payee", transaction_data.get("payee"))
        if "is_reconciled" in transaction_data:
            setattr(new_transaction, "is_reconciled", transaction_data.get("is_reconciled", False))

        self.db.add(new_transaction)
        self.db.commit()
        self.db.refresh(new_transaction)

        # Update the account balance
        balance_service = BalanceService(self.db)
        balance_service.update_account_balance(new_transaction.account_id)

        return new_transaction

    def update_transaction(self, transaction_id: str, transaction_data: Dict[str, Any]) -> Optional[Transaction]:
        """
        Update an existing transaction.

        Args:
            transaction_id (str): The ID of the transaction to update.
            transaction_data (Dict[str, Any]): The new data for the transaction.

        Returns:
            Optional[Transaction]: The updated transaction if found, None otherwise.
        """
        transaction = self.get_transaction_by_id(transaction_id)
        if not transaction:
            return None

        # Update transaction fields
        if "account_id" in transaction_data:
            transaction.account_id = transaction_data["account_id"]
        if "date" in transaction_data:
            transaction.date = transaction_data["date"]
        if "amount" in transaction_data:
            transaction.amount = transaction_data["amount"]
            transaction.is_income = transaction_data["amount"] > 0
        if "description" in transaction_data:
            transaction.description = transaction_data["description"]
        if "category" in transaction_data:
            transaction.category = transaction_data["category"]

        # Update payee and is_reconciled if they exist in the model
        if "payee" in transaction_data and hasattr(transaction, "payee"):
            transaction.payee = transaction_data["payee"]
        if "is_reconciled" in transaction_data and hasattr(transaction, "is_reconciled"):
            transaction.is_reconciled = transaction_data["is_reconciled"]

        transaction.updated_at = datetime.now(timezone.utc)

        self.db.commit()
        self.db.refresh(transaction)

        # Update the account balance
        balance_service = BalanceService(self.db)
        balance_service.update_account_balance(transaction.account_id)

        # If the account was changed, update the old account's balance too
        if "account_id" in transaction_data and transaction_data["account_id"] != transaction.account_id:
            balance_service.update_account_balance(transaction_data["account_id"])

        return transaction

    def delete_transaction(self, transaction_id: str) -> bool:
        """
        Delete a transaction.

        Args:
            transaction_id (str): The ID of the transaction to delete.

        Returns:
            bool: True if the transaction was deleted, False otherwise.
        """
        transaction = self.get_transaction_by_id(transaction_id)
        if not transaction:
            return False

        # Store the account ID before deleting the transaction
        account_id = transaction.account_id

        self.db.delete(transaction)
        self.db.commit()

        # Update the account balance
        balance_service = BalanceService(self.db)
        balance_service.update_account_balance(account_id)

        return True

    def import_transactions(self, transactions: List[Dict[str, Any]]) -> List[Transaction]:
        """
        Import multiple transactions.

        Args:
            transactions (List[Dict[str, Any]]): The list of transactions to import.

        Returns:
            List[Transaction]: The list of imported transactions.
        """
        imported_transactions = []
        affected_accounts = set()

        for transaction_data in transactions:
            transaction = self.create_transaction(transaction_data)
            imported_transactions.append(transaction)
            affected_accounts.add(transaction.account_id)

        # Update all affected account balances
        balance_service = BalanceService(self.db)
        for account_id in affected_accounts:
            balance_service.update_account_balance(account_id)

        return imported_transactions

    def search_transactions(self, query: str) -> List[Transaction]:
        """
        Search for transactions by payee, category, or description.

        Args:
            query (str): The search query.

        Returns:
            List[Transaction]: A list of transactions matching the query.
        """
        search_query = f"%{query}%"

        # Build the search conditions
        conditions = [
            Transaction.description.ilike(search_query),
            Transaction.category.ilike(search_query)
        ]

        # Add payee if it exists in the model
        if hasattr(Transaction, "payee"):
            conditions.append(Transaction.payee.ilike(search_query))

        return self.db.query(Transaction).options(
            joinedload(Transaction.account)
        ).filter(or_(*conditions)).order_by(Transaction.date.desc()).all()
