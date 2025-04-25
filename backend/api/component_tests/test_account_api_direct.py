"""
Account API Component Tests (Direct)

This module contains component tests for the account API endpoints
using direct calls to the service layer instead of HTTP requests.
"""
import pytest
from datetime import datetime, timezone
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.database.config.config import Base
from backend.service.account_service_db import AccountServiceDB
from backend.database.models.account import AccountType, Institution, Account


class TestAccountAPIComponent:
    """Component tests for the Account API endpoints."""

    @pytest.fixture(scope="class")
    def db_engine(self):
        """Create a test database engine."""
        # Use in-memory SQLite database for testing
        engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(engine)

        yield engine

        # Clean up
        Base.metadata.drop_all(engine)

    @pytest.fixture
    def db_session(self, db_engine):
        """Create a database session for testing."""
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=db_engine)
        session = SessionLocal()

        # Seed test data
        self._seed_test_data(session)

        yield session

        # Clean up
        session.close()

    @pytest.fixture
    def account_service(self, db_session):
        """Create an account service instance for testing."""
        return AccountServiceDB(db_session)

    def _seed_test_data(self, session):
        """Seed the database with test data."""
        # Check if data already exists
        if session.query(AccountType).count() > 0:
            return

        # Create account types
        account_types = [
            AccountType(id="checking", name="Checking Account"),
            AccountType(id="savings", name="Savings Account"),
            AccountType(id="credit", name="Credit Card"),
            AccountType(id="investment", name="Investment Account")
        ]
        session.add_all(account_types)

        # Create institutions
        institutions = [
            Institution(id="test_bank", name="Test Bank"),
            Institution(id="other_bank", name="Other Bank")
        ]
        session.add_all(institutions)

        # Create accounts
        accounts = [
            Account(
                id="acc-001",
                name="Test Checking",
                type_id="checking",
                institution_id="test_bank",
                balance=1000.00,
                currency="USD",
                is_active=True,
                notes="Test checking account",
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc)
            ),
            Account(
                id="acc-002",
                name="Test Savings",
                type_id="savings",
                institution_id="test_bank",
                balance=5000.00,
                currency="USD",
                is_active=True,
                notes="Test savings account",
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc)
            ),
            Account(
                id="acc-003",
                name="Test Credit Card",
                type_id="credit",
                institution_id="other_bank",
                balance=-500.00,
                currency="USD",
                is_active=True,
                notes="Test credit card account",
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc)
            )
        ]
        session.add_all(accounts)

        # Commit the changes
        session.commit()

    def test_get_all_accounts(self, account_service):
        """Test getting all accounts."""
        accounts = account_service.get_all_accounts()

        assert len(accounts) >= 3
        assert any(a["id"] == "acc-001" for a in accounts)
        assert any(a["id"] == "acc-002" for a in accounts)
        assert any(a["id"] == "acc-003" for a in accounts)

    def test_get_account_by_id(self, account_service):
        """Test getting an account by ID."""
        account = account_service.get_account_by_id("acc-001")

        assert account is not None
        assert account["id"] == "acc-001"
        assert account["name"] == "Test Checking"
        assert account["type"] == "checking"
        assert account["institution"] == "test_bank"
        assert account["balance"] == 1000.0

    def test_get_account_by_id_not_found(self, account_service):
        """Test getting an account that doesn't exist."""
        account = account_service.get_account_by_id("non-existent-id")

        assert account is None

    def test_get_accounts_by_type(self, account_service):
        """Test getting accounts by type."""
        accounts = account_service.get_accounts_by_type("checking")

        assert len(accounts) >= 1
        assert all(a["type"] == "checking" for a in accounts)
        assert any(a["id"] == "acc-001" for a in accounts)

    def test_get_accounts_by_institution(self, account_service):
        """Test getting accounts by institution."""
        accounts = account_service.get_accounts_by_institution("test_bank")

        assert len(accounts) >= 2
        assert all(a["institution"] == "test_bank" for a in accounts)
        assert any(a["id"] == "acc-001" for a in accounts)
        assert any(a["id"] == "acc-002" for a in accounts)

    def test_add_account(self, account_service, db_session):
        """Test adding a new account."""
        account_data = {
            "name": "New Test Account",
            "type": "checking",
            "institution": "test_bank",
            "balance": 2000.00,
            "currency": "USD",
            "notes": "New test account"
        }

        account = account_service.add_account(account_data)

        assert account is not None
        assert "id" in account
        assert account["name"] == account_data["name"]
        assert account["type"] == account_data["type"]
        assert account["institution"] == account_data["institution"]
        assert account["balance"] == account_data["balance"]
        assert account["currency"] == account_data["currency"]
        assert account["notes"] == account_data["notes"]

        # Verify the account was actually created in the database
        db_account = db_session.query(Account).filter_by(id=account["id"]).first()
        assert db_account is not None
        assert db_account.name == account_data["name"]

    def test_update_account(self, account_service, db_session):
        """Test updating an account."""
        # First, create an account to update
        account_data = {
            "name": "Account to Update",
            "type": "checking",
            "institution": "test_bank",
            "balance": 3000.00,
            "currency": "USD",
            "notes": "Account to be updated"
        }

        created_account = account_service.add_account(account_data)
        account_id = created_account["id"]

        # Now update the account
        update_data = {
            "name": "Updated Account Name",
            "balance": 3500.00,
            "notes": "Updated account notes"
        }

        updated_account = account_service.update_account(account_id, update_data)

        assert updated_account is not None
        assert updated_account["id"] == account_id
        assert updated_account["name"] == update_data["name"]
        assert updated_account["balance"] == update_data["balance"]
        assert updated_account["notes"] == update_data["notes"]
        # These fields should remain unchanged
        assert updated_account["type"] == account_data["type"]
        assert updated_account["institution"] == account_data["institution"]

        # Verify the account was actually updated in the database
        db_account = db_session.query(Account).filter_by(id=account_id).first()
        assert db_account is not None
        assert db_account.name == update_data["name"]
        assert db_account.balance == update_data["balance"]

    def test_delete_account(self, account_service, db_session):
        """Test deleting an account."""
        # First, create an account to delete
        account_data = {
            "name": "Account to Delete",
            "type": "checking",
            "institution": "test_bank",
            "balance": 4000.00,
            "currency": "USD",
            "notes": "Account to be deleted"
        }

        created_account = account_service.add_account(account_data)
        account_id = created_account["id"]

        # Now delete the account
        result = account_service.delete_account(account_id)

        assert result is True

        # Verify the account was actually deleted from the database
        db_account = db_session.query(Account).filter_by(id=account_id).first()
        assert db_account is None

    def test_get_account_types(self, account_service):
        """Test getting all account types."""
        account_types = account_service.get_account_types()

        assert len(account_types) >= 4
        assert any(t["id"] == "checking" for t in account_types)
        assert any(t["id"] == "savings" for t in account_types)
        assert any(t["id"] == "credit" for t in account_types)
        assert any(t["id"] == "investment" for t in account_types)

    def test_get_institutions(self, account_service):
        """Test getting all institutions."""
        institutions = account_service.get_institutions()

        assert len(institutions) >= 2
        assert any(i["id"] == "test_bank" for i in institutions)
        assert any(i["id"] == "other_bank" for i in institutions)

    def test_get_total_balance(self, account_service):
        """Test getting the total balance."""
        total_balance = account_service.get_total_balance()

        # The total balance should be the sum of all positive account balances
        assert total_balance >= 6000.0  # 1000 + 5000

    def test_get_net_worth(self, account_service):
        """Test getting the net worth."""
        net_worth = account_service.get_net_worth()

        # The net worth should be the sum of all account balances (positive and negative)
        assert net_worth >= 5500.0  # 1000 + 5000 - 500
