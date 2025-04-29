"""
Transaction Router Unit Tests

This module contains unit tests for the transaction router.
"""
import pytest
from datetime import datetime
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

from main import app
from service.transaction_service import TransactionService

client = TestClient(app)

class TestTransactionRouter:
    """Test cases for the transaction router."""
    
    @pytest.fixture
    def mock_transaction_service(self):
        """Create a mock transaction service."""
        with patch("api.transaction_router.TransactionService") as mock:
            service_instance = MagicMock(spec=TransactionService)
            mock.return_value = service_instance
            yield service_instance
    
    def test_get_transactions(self, mock_transaction_service):
        """Test getting all transactions."""
        # Mock data
        mock_transactions = [
            {
                "id": "trans-001",
                "account_id": "acc-001",
                "account_name": "Checking Account",
                "date": datetime.now().isoformat(),
                "amount": -45.67,
                "payee": "Grocery Store",
                "category": "Groceries",
                "description": "Weekly grocery shopping",
                "is_reconciled": True,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            }
        ]
        mock_transaction_service.get_all_transactions.return_value = mock_transactions
        
        # Make request
        response = client.get("/api/transactions/")
        
        # Assertions
        assert response.status_code == 200
        assert len(response.json()) == 1
        assert response.json()[0]["id"] == "trans-001"
        mock_transaction_service.get_all_transactions.assert_called_once()
    
    def test_get_transactions_with_filters(self, mock_transaction_service):
        """Test getting transactions with filters."""
        # Mock data
        mock_transactions = [
            {
                "id": "trans-001",
                "account_id": "acc-001",
                "account_name": "Checking Account",
                "date": datetime.now().isoformat(),
                "amount": -45.67,
                "payee": "Grocery Store",
                "category": "Groceries",
                "description": "Weekly grocery shopping",
                "is_reconciled": True,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            }
        ]
        mock_transaction_service.filter_transactions.return_value = mock_transactions
        
        # Make request
        response = client.get("/api/transactions/?account_id=acc-001&category=Groceries")
        
        # Assertions
        assert response.status_code == 200
        assert len(response.json()) == 1
        assert response.json()[0]["id"] == "trans-001"
        mock_transaction_service.filter_transactions.assert_called_once()
    
    def test_get_transaction(self, mock_transaction_service):
        """Test getting a transaction by ID."""
        # Mock data
        mock_transaction = {
            "id": "trans-001",
            "account_id": "acc-001",
            "account_name": "Checking Account",
            "date": datetime.now().isoformat(),
            "amount": -45.67,
            "payee": "Grocery Store",
            "category": "Groceries",
            "description": "Weekly grocery shopping",
            "is_reconciled": True,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        mock_transaction_service.get_transaction_by_id.return_value = mock_transaction
        
        # Make request
        response = client.get("/api/transactions/trans-001")
        
        # Assertions
        assert response.status_code == 200
        assert response.json()["id"] == "trans-001"
        mock_transaction_service.get_transaction_by_id.assert_called_once_with("trans-001")
    
    def test_get_transaction_not_found(self, mock_transaction_service):
        """Test getting a transaction that doesn't exist."""
        mock_transaction_service.get_transaction_by_id.return_value = None
        
        # Make request
        response = client.get("/api/transactions/non-existent-id")
        
        # Assertions
        assert response.status_code == 404
        assert "detail" in response.json()
        mock_transaction_service.get_transaction_by_id.assert_called_once_with("non-existent-id")
    
    def test_get_transactions_by_account(self, mock_transaction_service):
        """Test getting transactions by account."""
        # Mock data
        mock_transactions = [
            {
                "id": "trans-001",
                "account_id": "acc-001",
                "account_name": "Checking Account",
                "date": datetime.now().isoformat(),
                "amount": -45.67,
                "payee": "Grocery Store",
                "category": "Groceries",
                "description": "Weekly grocery shopping",
                "is_reconciled": True,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            }
        ]
        mock_transaction_service.get_transactions_by_account.return_value = mock_transactions
        
        # Make request
        response = client.get("/api/transactions/account/acc-001")
        
        # Assertions
        assert response.status_code == 200
        assert len(response.json()) == 1
        assert response.json()[0]["account_id"] == "acc-001"
        mock_transaction_service.get_transactions_by_account.assert_called_once_with("acc-001")
    
    def test_create_transaction(self, mock_transaction_service):
        """Test creating a new transaction."""
        # Mock data
        transaction_data = {
            "account_id": "acc-001",
            "date": datetime.now().isoformat(),
            "amount": -50.00,
            "payee": "Test Payee",
            "category": "Test Category",
            "description": "Test Description",
            "is_reconciled": False
        }
        mock_transaction = {
            "id": "trans-new",
            **transaction_data,
            "account_name": "Checking Account",
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        mock_transaction_service.add_transaction.return_value = mock_transaction
        
        # Make request
        response = client.post("/api/transactions/", json=transaction_data)
        
        # Assertions
        assert response.status_code == 201
        assert response.json()["id"] == "trans-new"
        assert response.json()["account_id"] == transaction_data["account_id"]
        assert response.json()["amount"] == transaction_data["amount"]
        mock_transaction_service.add_transaction.assert_called_once()
    
    def test_update_transaction(self, mock_transaction_service):
        """Test updating a transaction."""
        # Mock data
        update_data = {
            "amount": -75.00,
            "payee": "Updated Payee",
            "category": "Updated Category"
        }
        mock_transaction = {
            "id": "trans-001",
            "account_id": "acc-001",
            "account_name": "Checking Account",
            "date": datetime.now().isoformat(),
            "amount": -75.00,
            "payee": "Updated Payee",
            "category": "Updated Category",
            "description": "Weekly grocery shopping",
            "is_reconciled": True,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        mock_transaction_service.update_transaction.return_value = mock_transaction
        
        # Make request
        response = client.put("/api/transactions/trans-001", json=update_data)
        
        # Assertions
        assert response.status_code == 200
        assert response.json()["id"] == "trans-001"
        assert response.json()["amount"] == update_data["amount"]
        assert response.json()["payee"] == update_data["payee"]
        assert response.json()["category"] == update_data["category"]
        mock_transaction_service.update_transaction.assert_called_once()
    
    def test_update_transaction_not_found(self, mock_transaction_service):
        """Test updating a transaction that doesn't exist."""
        update_data = {"amount": -75.00}
        mock_transaction_service.update_transaction.return_value = None
        
        # Make request
        response = client.put("/api/transactions/non-existent-id", json=update_data)
        
        # Assertions
        assert response.status_code == 404
        assert "detail" in response.json()
        mock_transaction_service.update_transaction.assert_called_once()
    
    def test_delete_transaction(self, mock_transaction_service):
        """Test deleting a transaction."""
        mock_transaction_service.delete_transaction.return_value = True
        
        # Make request
        response = client.delete("/api/transactions/trans-001")
        
        # Assertions
        assert response.status_code == 204
        mock_transaction_service.delete_transaction.assert_called_once_with("trans-001")
    
    def test_delete_transaction_not_found(self, mock_transaction_service):
        """Test deleting a transaction that doesn't exist."""
        mock_transaction_service.delete_transaction.return_value = False
        
        # Make request
        response = client.delete("/api/transactions/non-existent-id")
        
        # Assertions
        assert response.status_code == 404
        assert "detail" in response.json()
        mock_transaction_service.delete_transaction.assert_called_once_with("non-existent-id")
    
    def test_search_transactions(self, mock_transaction_service):
        """Test searching for transactions."""
        # Mock data
        mock_transactions = [
            {
                "id": "trans-001",
                "account_id": "acc-001",
                "account_name": "Checking Account",
                "date": datetime.now().isoformat(),
                "amount": -45.67,
                "payee": "Grocery Store",
                "category": "Groceries",
                "description": "Weekly grocery shopping",
                "is_reconciled": True,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            }
        ]
        mock_transaction_service.search_transactions.return_value = mock_transactions
        
        # Make request
        response = client.post("/api/transactions/search", json={"query": "Grocery"})
        
        # Assertions
        assert response.status_code == 200
        assert len(response.json()) == 1
        assert response.json()[0]["id"] == "trans-001"
        mock_transaction_service.search_transactions.assert_called_once_with("Grocery")
    
    def test_import_transactions(self, mock_transaction_service):
        """Test importing transactions."""
        # Mock data
        import_data = {
            "account_id": "acc-001",
            "transactions": [
                {
                    "date": datetime.now().isoformat(),
                    "amount": -50.00,
                    "payee": "Test Payee 1",
                    "category": "Test Category",
                    "description": "Test Description 1",
                    "is_reconciled": False
                },
                {
                    "date": datetime.now().isoformat(),
                    "amount": -30.00,
                    "payee": "Test Payee 2",
                    "category": "Test Category",
                    "description": "Test Description 2",
                    "is_reconciled": False
                }
            ]
        }
        mock_imported = [
            {
                "id": f"trans-{i}",
                "account_id": "acc-001",
                "account_name": "Checking Account",
                "date": t["date"],
                "amount": t["amount"],
                "payee": t["payee"],
                "category": t["category"],
                "description": t["description"],
                "is_reconciled": t["is_reconciled"],
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            }
            for i, t in enumerate(import_data["transactions"])
        ]
        mock_transaction_service.import_transactions.return_value = mock_imported
        
        # Make request
        response = client.post("/api/transactions/import", json=import_data)
        
        # Assertions
        assert response.status_code == 201
        assert len(response.json()) == 2
        mock_transaction_service.import_transactions.assert_called_once()
