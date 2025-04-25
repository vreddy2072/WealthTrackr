"""
Transaction API Component Tests (Direct)

This module contains component tests for the transaction API endpoints
using direct calls to the service layer instead of HTTP requests.
"""
import pytest
from datetime import datetime, timezone
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import uuid

from backend.database.config.config import Base
from backend.service.transaction_service_db import TransactionServiceDB
from backend.database.models.account import AccountType, Institution, Account
from backend.database.models.transaction import Transaction


class TestTransactionAPIComponent:
    """Component tests for the Transaction API endpoints."""

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
    def transaction_service(self, db_session):
        """Create a transaction service instance for testing."""
        return TransactionServiceDB(db_session)

    def _seed_test_data(self, session):
        """Seed the database with test data."""
        # Check if data already exists
        if session.query(AccountType).count() > 0:
            return

        # Create account types
        account_type = AccountType(id="checking", name="Checking Account")
        session.add(account_type)

        # Create institutions
        institution = Institution(id="test_bank", name="Test Bank")
        session.add(institution)

        # Create accounts
        account1 = Account(
            id="acc-001",
            name="Test Checking",
            type_id="checking",
            institution_id="test_bank",
            balance=1000.00,
            currency="USD",
            is_active=True,
            notes="Test account",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        account2 = Account(
            id="acc-002",
            name="Test Savings",
            type_id="checking",
            institution_id="test_bank",
            balance=5000.00,
            currency="USD",
            is_active=True,
            notes="Test account",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        session.add(account1)
        session.add(account2)

        # Create transactions
        transactions = [
            Transaction(
                id="trans-001",
                account_id="acc-001",
                date=datetime(2025, 4, 15, tzinfo=timezone.utc),
                amount=-45.67,
                payee="Grocery Store",
                description="Weekly grocery shopping",
                category="Groceries",
                is_income=False,
                is_reconciled=True,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc)
            ),
            Transaction(
                id="trans-002",
                account_id="acc-001",
                date=datetime(2025, 4, 14, tzinfo=timezone.utc),
                amount=-25.00,
                payee="Gas Station",
                description="Fuel for car",
                category="Transportation",
                is_income=False,
                is_reconciled=True,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc)
            ),
            Transaction(
                id="trans-003",
                account_id="acc-002",
                date=datetime(2025, 4, 13, tzinfo=timezone.utc),
                amount=500.00,
                payee="Transfer",
                description="Transfer from checking",
                category="Transfer",
                is_income=True,
                is_reconciled=False,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc)
            )
        ]
        session.add_all(transactions)

        # Commit the changes
        session.commit()

    def test_get_all_transactions(self, transaction_service):
        """Test getting all transactions."""
        transactions = transaction_service.get_all_transactions()

        assert len(transactions) >= 3
        assert any(t["id"] == "trans-001" for t in transactions)
        assert any(t["id"] == "trans-002" for t in transactions)
        assert any(t["id"] == "trans-003" for t in transactions)

    def test_get_transaction_by_id(self, transaction_service):
        """Test getting a transaction by ID."""
        transaction = transaction_service.get_transaction_by_id("trans-001")

        assert transaction is not None
        assert transaction["id"] == "trans-001"
        assert transaction["payee"] == "Grocery Store"
        assert transaction["amount"] == -45.67
        assert transaction["category"] == "Groceries"
        assert transaction["account_id"] == "acc-001"
        assert transaction["account_name"] == "Test Checking"

    def test_get_transaction_by_id_not_found(self, transaction_service):
        """Test getting a transaction that doesn't exist."""
        transaction = transaction_service.get_transaction_by_id("non-existent-id")

        assert transaction is None

    def test_get_transactions_by_account(self, transaction_service):
        """Test getting transactions by account."""
        transactions = transaction_service.get_transactions_by_account("acc-001")

        assert len(transactions) >= 2
        assert all(t["account_id"] == "acc-001" for t in transactions)
        assert any(t["id"] == "trans-001" for t in transactions)
        assert any(t["id"] == "trans-002" for t in transactions)

    def test_add_transaction(self, transaction_service, db_session):
        """Test adding a new transaction."""
        transaction_data = {
            "account_id": "acc-001",
            "date": datetime.now(timezone.utc),
            "amount": -50.00,
            "payee": "Test Payee",
            "category": "Test Category",
            "description": "Test Description",
            "is_reconciled": False
        }

        transaction = transaction_service.add_transaction(transaction_data)

        assert transaction is not None
        assert "id" in transaction
        assert transaction["account_id"] == transaction_data["account_id"]
        assert transaction["amount"] == transaction_data["amount"]
        assert transaction["payee"] == transaction_data["payee"]
        assert transaction["category"] == transaction_data["category"]
        assert transaction["description"] == transaction_data["description"]
        assert transaction["is_reconciled"] == transaction_data["is_reconciled"]

        # Verify the transaction was actually created in the database
        db_transaction = db_session.query(Transaction).filter_by(id=transaction["id"]).first()
        assert db_transaction is not None
        assert db_transaction.payee == transaction_data["payee"]

    def test_update_transaction(self, transaction_service, db_session):
        """Test updating a transaction."""
        # First, create a transaction to update
        transaction_data = {
            "account_id": "acc-001",
            "date": datetime.now(timezone.utc),
            "amount": -60.00,
            "payee": "Original Payee",
            "category": "Original Category",
            "description": "Original Description",
            "is_reconciled": False
        }

        created_transaction = transaction_service.add_transaction(transaction_data)
        transaction_id = created_transaction["id"]

        # Now update the transaction
        update_data = {
            "amount": -75.00,
            "payee": "Updated Payee",
            "category": "Updated Category",
            "description": "Updated Description",
            "is_reconciled": True
        }

        updated_transaction = transaction_service.update_transaction(transaction_id, update_data)

        assert updated_transaction is not None
        assert updated_transaction["id"] == transaction_id
        assert updated_transaction["amount"] == update_data["amount"]
        assert updated_transaction["payee"] == update_data["payee"]
        assert updated_transaction["category"] == update_data["category"]
        assert updated_transaction["description"] == update_data["description"]
        assert updated_transaction["is_reconciled"] == update_data["is_reconciled"]

        # Verify the transaction was actually updated in the database
        db_transaction = db_session.query(Transaction).filter_by(id=transaction_id).first()
        assert db_transaction is not None
        assert db_transaction.amount == update_data["amount"]
        assert db_transaction.payee == update_data["payee"]

    def test_delete_transaction(self, transaction_service, db_session):
        """Test deleting a transaction."""
        # First, create a transaction to delete
        transaction_data = {
            "account_id": "acc-001",
            "date": datetime.now(timezone.utc),
            "amount": -70.00,
            "payee": "Delete Test Payee",
            "category": "Delete Test Category",
            "description": "Delete Test Description",
            "is_reconciled": False
        }

        created_transaction = transaction_service.add_transaction(transaction_data)
        transaction_id = created_transaction["id"]

        # Now delete the transaction
        result = transaction_service.delete_transaction(transaction_id)

        assert result is True

        # Verify the transaction was actually deleted from the database
        db_transaction = db_session.query(Transaction).filter_by(id=transaction_id).first()
        assert db_transaction is None

    def test_filter_transactions(self, transaction_service):
        """Test filtering transactions."""
        # Test filtering by account ID
        filters = {"account_id": "acc-001"}
        transactions = transaction_service.get_filtered_transactions(filters)
        assert len(transactions) >= 2
        assert all(t["account_id"] == "acc-001" for t in transactions)

        # Test filtering by category
        filters = {"category": "Groceries"}
        transactions = transaction_service.get_filtered_transactions(filters)
        assert len(transactions) >= 1
        assert all(t["category"] == "Groceries" for t in transactions)

        # Test filtering by amount range
        filters = {"min_amount": -30, "max_amount": 0}
        transactions = transaction_service.get_filtered_transactions(filters)
        assert len(transactions) >= 1
        assert all(-30 <= t["amount"] <= 0 for t in transactions)

        # Test filtering by reconciliation status
        filters = {"is_reconciled": False}
        transactions = transaction_service.get_filtered_transactions(filters)
        assert len(transactions) >= 1
        assert all(t["is_reconciled"] is False for t in transactions)

    def test_search_transactions(self, transaction_service, db_session):
        """Test searching for transactions."""
        # Create a transaction with a unique search term
        unique_term = f"Unique{uuid.uuid4()}"
        transaction_data = {
            "account_id": "acc-001",
            "date": datetime.now(timezone.utc),
            "amount": -50.00,
            "payee": f"Test Payee {unique_term}",
            "category": "Test Category",
            "description": "Test Description",
            "is_reconciled": False
        }

        transaction_service.add_transaction(transaction_data)

        # Search for the transaction
        search_results = transaction_service.search_transactions(unique_term)
        assert len(search_results) >= 1
        assert any(unique_term in t["payee"] for t in search_results)

    def test_import_transactions(self, transaction_service, db_session):
        """Test importing multiple transactions."""
        account_id = "acc-001"
        transactions_data = [
            {
                "date": datetime.now(timezone.utc),
                "amount": -50.00,
                "payee": "Import Payee 1",
                "category": "Import Category",
                "description": "Import Description 1",
                "is_reconciled": False
            },
            {
                "date": datetime.now(timezone.utc),
                "amount": -30.00,
                "payee": "Import Payee 2",
                "category": "Import Category",
                "description": "Import Description 2",
                "is_reconciled": False
            }
        ]

        imported_transactions = transaction_service.import_transactions(account_id, transactions_data)
        assert len(imported_transactions) == 2
        assert all(t["account_id"] == "acc-001" for t in imported_transactions)
        assert any(t["payee"] == "Import Payee 1" for t in imported_transactions)
        assert any(t["payee"] == "Import Payee 2" for t in imported_transactions)

        # Verify the transactions were actually created in the database
        db_transactions = db_session.query(Transaction).filter(
            Transaction.payee.in_(["Import Payee 1", "Import Payee 2"])
        ).all()
        assert len(db_transactions) == 2
