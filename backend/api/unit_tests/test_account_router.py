"""
Unit tests for the Account API Router.
"""
import pytest
from fastapi.testclient import TestClient
from fastapi import FastAPI
from unittest.mock import patch, MagicMock

from backend.api.account_router import router

# Create a test FastAPI app
app = FastAPI()
app.include_router(router)
client = TestClient(app)

# Mock account data
mock_account = {
    "id": "acc-001",
    "name": "Test Checking",
    "type": "checking",
    "institution": "Test Bank",
    "balance": 1000.00,
    "currency": "USD",
    "is_active": True,
    "notes": "Test account",
    "created_at": "2025-01-01T00:00:00",
    "updated_at": "2025-01-01T00:00:00"
}

mock_accounts = [mock_account]

mock_account_types = [
    {"id": "checking", "name": "Checking Account"},
    {"id": "savings", "name": "Savings Account"}
]

mock_institutions = [
    {"id": "test_bank", "name": "Test Bank"},
    {"id": "other_bank", "name": "Other Bank"}
]

class TestAccountRouter:
    """Test cases for the Account API Router."""
    
    @patch("backend.api.account_router.account_service")
    def test_get_accounts(self, mock_service):
        """Test retrieving all accounts."""
        # Set up the mock
        mock_service.get_all_accounts.return_value = mock_accounts
        
        # Make the request
        response = client.get("/api/accounts/")
        
        # Verify the response
        assert response.status_code == 200
        assert response.json() == mock_accounts
        mock_service.get_all_accounts.assert_called_once()
    
    @patch("backend.api.account_router.account_service")
    def test_get_accounts_by_type(self, mock_service):
        """Test retrieving accounts filtered by type."""
        # Set up the mock
        mock_service.get_accounts_by_type.return_value = mock_accounts
        
        # Make the request
        response = client.get("/api/accounts/?type=checking")
        
        # Verify the response
        assert response.status_code == 200
        assert response.json() == mock_accounts
        mock_service.get_accounts_by_type.assert_called_once_with("checking")
    
    @patch("backend.api.account_router.account_service")
    def test_get_accounts_by_institution(self, mock_service):
        """Test retrieving accounts filtered by institution."""
        # Set up the mock
        mock_service.get_accounts_by_institution.return_value = mock_accounts
        
        # Make the request
        response = client.get("/api/accounts/?institution=Test%20Bank")
        
        # Verify the response
        assert response.status_code == 200
        assert response.json() == mock_accounts
        mock_service.get_accounts_by_institution.assert_called_once_with("Test Bank")
    
    @patch("backend.api.account_router.account_service")
    def test_get_account(self, mock_service):
        """Test retrieving a specific account by ID."""
        # Set up the mock
        mock_service.get_account_by_id.return_value = mock_account
        
        # Make the request
        response = client.get("/api/accounts/acc-001")
        
        # Verify the response
        assert response.status_code == 200
        assert response.json() == mock_account
        mock_service.get_account_by_id.assert_called_once_with("acc-001")
    
    @patch("backend.api.account_router.account_service")
    def test_get_account_not_found(self, mock_service):
        """Test retrieving a non-existent account."""
        # Set up the mock
        mock_service.get_account_by_id.return_value = None
        
        # Make the request
        response = client.get("/api/accounts/non-existent")
        
        # Verify the response
        assert response.status_code == 404
        assert "not found" in response.json()["detail"]
        mock_service.get_account_by_id.assert_called_once_with("non-existent")
    
    @patch("backend.api.account_router.account_service")
    def test_create_account(self, mock_service):
        """Test creating a new account."""
        # Set up the mock
        mock_service.add_account.return_value = mock_account
        
        # Prepare the request data
        account_data = {
            "name": "Test Checking",
            "type": "checking",
            "institution": "Test Bank",
            "balance": 1000.00,
            "currency": "USD",
            "notes": "Test account"
        }
        
        # Make the request
        response = client.post("/api/accounts/", json=account_data)
        
        # Verify the response
        assert response.status_code == 201
        assert response.json() == mock_account
        mock_service.add_account.assert_called_once()
        # Check that the correct data was passed to the service
        call_args = mock_service.add_account.call_args[0][0]
        assert call_args["name"] == account_data["name"]
        assert call_args["type"] == account_data["type"]
        assert call_args["balance"] == account_data["balance"]
    
    @patch("backend.api.account_router.account_service")
    def test_update_account(self, mock_service):
        """Test updating an existing account."""
        # Set up the mock
        mock_service.update_account.return_value = mock_account
        
        # Prepare the request data
        update_data = {
            "name": "Updated Checking",
            "balance": 1500.00
        }
        
        # Make the request
        response = client.put("/api/accounts/acc-001", json=update_data)
        
        # Verify the response
        assert response.status_code == 200
        assert response.json() == mock_account
        mock_service.update_account.assert_called_once_with("acc-001", update_data)
    
    @patch("backend.api.account_router.account_service")
    def test_update_account_not_found(self, mock_service):
        """Test updating a non-existent account."""
        # Set up the mock
        mock_service.update_account.return_value = None
        
        # Prepare the request data
        update_data = {
            "name": "Updated Checking",
            "balance": 1500.00
        }
        
        # Make the request
        response = client.put("/api/accounts/non-existent", json=update_data)
        
        # Verify the response
        assert response.status_code == 404
        assert "not found" in response.json()["detail"]
        mock_service.update_account.assert_called_once_with("non-existent", update_data)
    
    @patch("backend.api.account_router.account_service")
    def test_delete_account(self, mock_service):
        """Test deleting an account."""
        # Set up the mock
        mock_service.delete_account.return_value = True
        
        # Make the request
        response = client.delete("/api/accounts/acc-001")
        
        # Verify the response
        assert response.status_code == 204
        assert response.content == b""  # No content for 204 response
        mock_service.delete_account.assert_called_once_with("acc-001")
    
    @patch("backend.api.account_router.account_service")
    def test_delete_account_not_found(self, mock_service):
        """Test deleting a non-existent account."""
        # Set up the mock
        mock_service.delete_account.return_value = False
        
        # Make the request
        response = client.delete("/api/accounts/non-existent")
        
        # Verify the response
        assert response.status_code == 404
        assert "not found" in response.json()["detail"]
        mock_service.delete_account.assert_called_once_with("non-existent")
    
    @patch("backend.api.account_router.account_service")
    def test_get_account_types(self, mock_service):
        """Test retrieving all account types."""
        # Set up the mock
        mock_service.get_account_types.return_value = mock_account_types
        
        # Make the request
        response = client.get("/api/accounts/types/all")
        
        # Verify the response
        assert response.status_code == 200
        assert response.json() == mock_account_types
        mock_service.get_account_types.assert_called_once()
    
    @patch("backend.api.account_router.account_service")
    def test_get_institutions(self, mock_service):
        """Test retrieving all financial institutions."""
        # Set up the mock
        mock_service.get_institutions.return_value = mock_institutions
        
        # Make the request
        response = client.get("/api/accounts/institutions/all")
        
        # Verify the response
        assert response.status_code == 200
        assert response.json() == mock_institutions
        mock_service.get_institutions.assert_called_once()
    
    @patch("backend.api.account_router.account_service")
    def test_get_total_balance(self, mock_service):
        """Test retrieving the total balance."""
        # Set up the mock
        mock_service.get_total_balance.return_value = 5000.00
        
        # Make the request
        response = client.get("/api/accounts/summary/total-balance")
        
        # Verify the response
        assert response.status_code == 200
        assert response.json() == 5000.00
        mock_service.get_total_balance.assert_called_once()
    
    @patch("backend.api.account_router.account_service")
    def test_get_net_worth(self, mock_service):
        """Test retrieving the net worth."""
        # Set up the mock
        mock_service.get_net_worth.return_value = 4500.00
        
        # Make the request
        response = client.get("/api/accounts/summary/net-worth")
        
        # Verify the response
        assert response.status_code == 200
        assert response.json() == 4500.00
        mock_service.get_net_worth.assert_called_once()
