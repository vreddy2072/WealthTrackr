"""
Unit tests for the Account Service module.
"""
import pytest
from datetime import datetime
from backend.service.account_service import AccountService

class TestAccountService:
    """Test cases for the AccountService class."""
    
    @pytest.fixture
    def account_service(self):
        """Create an instance of AccountService for testing."""
        return AccountService()
    
    def test_get_all_accounts(self, account_service):
        """Test retrieving all accounts."""
        accounts = account_service.get_all_accounts()
        assert isinstance(accounts, list)
        assert len(accounts) > 0
        assert "id" in accounts[0]
        assert "name" in accounts[0]
        assert "type" in accounts[0]
        assert "balance" in accounts[0]
    
    def test_get_account_by_id(self, account_service):
        """Test retrieving an account by ID."""
        # Get an existing account ID
        accounts = account_service.get_all_accounts()
        account_id = accounts[0]["id"]
        
        # Test retrieving the account
        account = account_service.get_account_by_id(account_id)
        assert account is not None
        assert account["id"] == account_id
        
        # Test retrieving a non-existent account
        non_existent_account = account_service.get_account_by_id("non-existent-id")
        assert non_existent_account is None
    
    def test_get_accounts_by_type(self, account_service):
        """Test retrieving accounts by type."""
        # Get accounts of type 'savings'
        savings_accounts = account_service.get_accounts_by_type("savings")
        assert isinstance(savings_accounts, list)
        assert all(account["type"] == "savings" for account in savings_accounts)
        
        # Get accounts of a non-existent type
        non_existent_type_accounts = account_service.get_accounts_by_type("non-existent-type")
        assert isinstance(non_existent_type_accounts, list)
        assert len(non_existent_type_accounts) == 0
    
    def test_get_accounts_by_institution(self, account_service):
        """Test retrieving accounts by institution."""
        # Get accounts from 'Chase Bank'
        chase_accounts = account_service.get_accounts_by_institution("Chase Bank")
        assert isinstance(chase_accounts, list)
        assert all(account["institution"] == "Chase Bank" for account in chase_accounts)
        
        # Get accounts from a non-existent institution
        non_existent_institution_accounts = account_service.get_accounts_by_institution("Non-Existent Bank")
        assert isinstance(non_existent_institution_accounts, list)
        assert len(non_existent_institution_accounts) == 0
    
    def test_add_account(self, account_service):
        """Test adding a new account."""
        # Get the initial number of accounts
        initial_count = len(account_service.get_all_accounts())
        
        # Add a new account
        new_account_data = {
            "name": "Test Account",
            "type": "checking",
            "institution": "Test Bank",
            "balance": 1000.00,
            "currency": "USD",
            "notes": "Test account"
        }
        new_account = account_service.add_account(new_account_data)
        
        # Verify the account was added
        assert new_account["name"] == "Test Account"
        assert new_account["type"] == "checking"
        assert new_account["institution"] == "Test Bank"
        assert new_account["balance"] == 1000.00
        assert new_account["is_active"] is True
        assert "id" in new_account
        assert "created_at" in new_account
        assert "updated_at" in new_account
        
        # Verify the total number of accounts increased
        updated_count = len(account_service.get_all_accounts())
        assert updated_count == initial_count + 1
    
    def test_update_account(self, account_service):
        """Test updating an existing account."""
        # Get an existing account
        accounts = account_service.get_all_accounts()
        account_id = accounts[0]["id"]
        
        # Update the account
        update_data = {
            "name": "Updated Account Name",
            "balance": 2000.00
        }
        updated_account = account_service.update_account(account_id, update_data)
        
        # Verify the account was updated
        assert updated_account is not None
        assert updated_account["id"] == account_id
        assert updated_account["name"] == "Updated Account Name"
        assert updated_account["balance"] == 2000.00
        
        # Verify other fields were preserved
        assert "type" in updated_account
        assert "institution" in updated_account
        
        # Test updating a non-existent account
        non_existent_update = account_service.update_account("non-existent-id", update_data)
        assert non_existent_update is None
    
    def test_delete_account(self, account_service):
        """Test deleting an account."""
        # Add a test account to delete
        new_account_data = {
            "name": "Account to Delete",
            "type": "checking",
            "institution": "Test Bank",
            "balance": 1000.00,
            "currency": "USD"
        }
        new_account = account_service.add_account(new_account_data)
        account_id = new_account["id"]
        
        # Get the initial number of accounts
        initial_count = len(account_service.get_all_accounts())
        
        # Delete the account
        result = account_service.delete_account(account_id)
        
        # Verify the account was deleted
        assert result is True
        updated_count = len(account_service.get_all_accounts())
        assert updated_count == initial_count - 1
        assert account_service.get_account_by_id(account_id) is None
        
        # Test deleting a non-existent account
        non_existent_delete = account_service.delete_account("non-existent-id")
        assert non_existent_delete is False
    
    def test_get_account_types(self, account_service):
        """Test retrieving all account types."""
        account_types = account_service.get_account_types()
        assert isinstance(account_types, list)
        assert len(account_types) > 0
        assert "id" in account_types[0]
        assert "name" in account_types[0]
    
    def test_get_institutions(self, account_service):
        """Test retrieving all financial institutions."""
        institutions = account_service.get_institutions()
        assert isinstance(institutions, list)
        assert len(institutions) > 0
        assert "id" in institutions[0]
        assert "name" in institutions[0]
    
    def test_get_total_balance(self, account_service):
        """Test calculating the total balance."""
        total_balance = account_service.get_total_balance()
        assert isinstance(total_balance, float)
        
        # Calculate the expected total manually
        expected_total = sum(account["balance"] for account in account_service.get_all_accounts())
        assert total_balance == expected_total
    
    def test_get_net_worth(self, account_service):
        """Test calculating the net worth."""
        net_worth = account_service.get_net_worth()
        assert isinstance(net_worth, float)
        
        # Calculate the expected net worth manually
        accounts = account_service.get_all_accounts()
        assets = sum(account["balance"] for account in accounts if account["balance"] > 0)
        liabilities = sum(abs(account["balance"]) for account in accounts if account["balance"] < 0)
        expected_net_worth = assets - liabilities
        
        assert net_worth == expected_net_worth
