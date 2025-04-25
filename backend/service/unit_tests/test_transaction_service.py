"""
Transaction Service Unit Tests

This module contains unit tests for the transaction service.
"""
import pytest
from datetime import datetime, timedelta
from unittest.mock import MagicMock

from service.transaction_service import TransactionService

class TestTransactionService:
    """Test cases for the TransactionService class."""
    
    @pytest.fixture
    def transaction_service(self):
        """Create a transaction service instance for testing."""
        return TransactionService()
    
    def test_get_all_transactions(self, transaction_service):
        """Test getting all transactions."""
        transactions = transaction_service.get_all_transactions()
        assert isinstance(transactions, list)
        assert len(transactions) > 0
        assert "id" in transactions[0]
        assert "account_id" in transactions[0]
        assert "date" in transactions[0]
        assert "amount" in transactions[0]
    
    def test_get_transaction_by_id(self, transaction_service):
        """Test getting a transaction by ID."""
        # Get all transactions to get a valid ID
        transactions = transaction_service.get_all_transactions()
        transaction_id = transactions[0]["id"]
        
        # Get the transaction by ID
        transaction = transaction_service.get_transaction_by_id(transaction_id)
        assert transaction is not None
        assert transaction["id"] == transaction_id
    
    def test_get_transaction_by_id_not_found(self, transaction_service):
        """Test getting a transaction by ID that doesn't exist."""
        transaction = transaction_service.get_transaction_by_id("non-existent-id")
        assert transaction is None
    
    def test_get_transactions_by_account(self, transaction_service):
        """Test getting transactions by account."""
        # Get all transactions to get a valid account ID
        transactions = transaction_service.get_all_transactions()
        account_id = transactions[0]["account_id"]
        
        # Get transactions for the account
        account_transactions = transaction_service.get_transactions_by_account(account_id)
        assert isinstance(account_transactions, list)
        assert all(t["account_id"] == account_id for t in account_transactions)
    
    def test_add_transaction(self, transaction_service):
        """Test adding a new transaction."""
        # Create a new transaction
        new_transaction = {
            "account_id": "acc-001",
            "date": datetime.now().isoformat(),
            "amount": -50.00,
            "payee": "Test Payee",
            "category": "Test Category",
            "description": "Test Description",
            "is_reconciled": False
        }
        
        # Add the transaction
        added_transaction = transaction_service.add_transaction(new_transaction)
        assert added_transaction is not None
        assert "id" in added_transaction
        assert added_transaction["account_id"] == new_transaction["account_id"]
        assert added_transaction["amount"] == new_transaction["amount"]
        assert added_transaction["payee"] == new_transaction["payee"]
        assert added_transaction["category"] == new_transaction["category"]
        assert added_transaction["description"] == new_transaction["description"]
        assert added_transaction["is_reconciled"] == new_transaction["is_reconciled"]
    
    def test_update_transaction(self, transaction_service):
        """Test updating a transaction."""
        # Get all transactions to get a valid ID
        transactions = transaction_service.get_all_transactions()
        transaction_id = transactions[0]["id"]
        
        # Update data
        update_data = {
            "amount": -75.00,
            "payee": "Updated Payee",
            "category": "Updated Category",
            "description": "Updated Description",
            "is_reconciled": True
        }
        
        # Update the transaction
        updated_transaction = transaction_service.update_transaction(transaction_id, update_data)
        assert updated_transaction is not None
        assert updated_transaction["id"] == transaction_id
        assert updated_transaction["amount"] == update_data["amount"]
        assert updated_transaction["payee"] == update_data["payee"]
        assert updated_transaction["category"] == update_data["category"]
        assert updated_transaction["description"] == update_data["description"]
        assert updated_transaction["is_reconciled"] == update_data["is_reconciled"]
    
    def test_update_transaction_not_found(self, transaction_service):
        """Test updating a transaction that doesn't exist."""
        update_data = {"amount": -75.00}
        updated_transaction = transaction_service.update_transaction("non-existent-id", update_data)
        assert updated_transaction is None
    
    def test_delete_transaction(self, transaction_service):
        """Test deleting a transaction."""
        # Create a new transaction to delete
        new_transaction = {
            "account_id": "acc-001",
            "date": datetime.now().isoformat(),
            "amount": -50.00,
            "payee": "Test Payee",
            "category": "Test Category",
            "description": "Test Description",
            "is_reconciled": False
        }
        added_transaction = transaction_service.add_transaction(new_transaction)
        transaction_id = added_transaction["id"]
        
        # Delete the transaction
        result = transaction_service.delete_transaction(transaction_id)
        assert result is True
        
        # Verify it's deleted
        transaction = transaction_service.get_transaction_by_id(transaction_id)
        assert transaction is None
    
    def test_delete_transaction_not_found(self, transaction_service):
        """Test deleting a transaction that doesn't exist."""
        result = transaction_service.delete_transaction("non-existent-id")
        assert result is False
    
    def test_search_transactions(self, transaction_service):
        """Test searching for transactions."""
        # Create a transaction with a unique search term
        unique_term = f"Unique{datetime.now().timestamp()}"
        new_transaction = {
            "account_id": "acc-001",
            "date": datetime.now().isoformat(),
            "amount": -50.00,
            "payee": f"Test Payee {unique_term}",
            "category": "Test Category",
            "description": "Test Description",
            "is_reconciled": False
        }
        transaction_service.add_transaction(new_transaction)
        
        # Search for the transaction
        search_results = transaction_service.search_transactions(unique_term)
        assert isinstance(search_results, list)
        assert len(search_results) > 0
        assert any(unique_term in t["payee"] for t in search_results)
    
    def test_filter_transactions(self, transaction_service):
        """Test filtering transactions."""
        # Create a transaction with specific attributes
        date = datetime.now()
        new_transaction = {
            "account_id": "acc-001",
            "date": date.isoformat(),
            "amount": -50.00,
            "payee": "Test Payee",
            "category": "FilterTest",
            "description": "Test Description",
            "is_reconciled": False
        }
        transaction_service.add_transaction(new_transaction)
        
        # Filter by category
        filters = {"category": "FilterTest"}
        filter_results = transaction_service.filter_transactions(filters)
        assert isinstance(filter_results, list)
        assert len(filter_results) > 0
        assert all(t["category"] == "FilterTest" for t in filter_results)
        
        # Filter by date range
        start_date = (date - timedelta(days=1)).isoformat()
        end_date = (date + timedelta(days=1)).isoformat()
        filters = {"start_date": start_date, "end_date": end_date}
        filter_results = transaction_service.filter_transactions(filters)
        assert isinstance(filter_results, list)
        assert len(filter_results) > 0
