"""
Transaction Repository Unit Tests

This module contains unit tests for the transaction repository.
"""
import pytest
from datetime import datetime, timezone
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from uuid import uuid4

from database.config import Base
from database.repositories.transaction_repository import TransactionRepository
from orm.models import Transaction, Account, AccountType, Institution


class TestTransactionRepository:
    """Test cases for the TransactionRepository class."""
    
    @pytest.fixture
    def db_session(self):
        """Create an in-memory database session for testing."""
        # Create an in-memory SQLite database
        engine = create_engine("sqlite:///:memory:")
        
        # Create all tables
        Base.metadata.create_all(engine)
        
        # Create a session factory
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        
        # Create a session
        session = SessionLocal()
        
        # Seed test data
        self._seed_test_data(session)
        
        yield session
        
        # Clean up
        session.close()
    
    @pytest.fixture
    def repository(self, db_session):
        """Create a transaction repository instance for testing."""
        return TransactionRepository(db_session)
    
    def _seed_test_data(self, session):
        """Seed the database with test data."""
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
    
    def test_get_all_transactions(self, repository):
        """Test getting all transactions."""
        transactions = repository.get_all_transactions()
        assert len(transactions) == 3
        assert transactions[0].id in ["trans-001", "trans-002", "trans-003"]
        assert hasattr(transactions[0], 'account')
    
    def test_get_transaction_by_id(self, repository):
        """Test getting a transaction by ID."""
        transaction = repository.get_transaction_by_id("trans-001")
        assert transaction is not None
        assert transaction.id == "trans-001"
        assert transaction.payee == "Grocery Store"
        assert transaction.amount == -45.67
        assert transaction.account is not None
    
    def test_get_transaction_by_id_not_found(self, repository):
        """Test getting a transaction by ID that doesn't exist."""
        transaction = repository.get_transaction_by_id("non-existent-id")
        assert transaction is None
    
    def test_get_transactions_by_account(self, repository):
        """Test getting transactions by account."""
        transactions = repository.get_transactions_by_account("acc-001")
        assert len(transactions) == 2
        assert all(t.account_id == "acc-001" for t in transactions)
    
    def test_filter_transactions(self, repository):
        """Test filtering transactions."""
        # Filter by account ID
        filters = {"account_id": "acc-001"}
        transactions = repository.filter_transactions(filters)
        assert len(transactions) == 2
        assert all(t.account_id == "acc-001" for t in transactions)
        
        # Filter by category
        filters = {"category": "Groceries"}
        transactions = repository.filter_transactions(filters)
        assert len(transactions) == 1
        assert transactions[0].category == "Groceries"
        
        # Filter by date range
        filters = {
            "start_date": datetime(2025, 4, 13, tzinfo=timezone.utc).isoformat(),
            "end_date": datetime(2025, 4, 14, tzinfo=timezone.utc).isoformat()
        }
        transactions = repository.filter_transactions(filters)
        assert len(transactions) == 2
        
        # Filter by amount range
        filters = {"min_amount": -30.0, "max_amount": 0.0}
        transactions = repository.filter_transactions(filters)
        assert len(transactions) == 1
        assert transactions[0].amount == -25.00
        
        # Filter by reconciliation status
        filters = {"is_reconciled": False}
        transactions = repository.filter_transactions(filters)
        assert len(transactions) == 1
        assert transactions[0].is_reconciled is False
    
    def test_create_transaction(self, repository):
        """Test creating a new transaction."""
        transaction_data = {
            "account_id": "acc-001",
            "date": datetime.now(timezone.utc),
            "amount": -50.00,
            "payee": "Test Payee",
            "description": "Test Description",
            "category": "Test Category",
            "is_reconciled": False
        }
        
        transaction = repository.create_transaction(transaction_data)
        assert transaction is not None
        assert transaction.id is not None
        assert transaction.account_id == "acc-001"
        assert transaction.amount == -50.00
        assert transaction.payee == "Test Payee"
        assert transaction.description == "Test Description"
        assert transaction.category == "Test Category"
        assert transaction.is_reconciled is False
        assert transaction.is_income is False  # Negative amount means expense
    
    def test_update_transaction(self, repository):
        """Test updating a transaction."""
        # Update data
        update_data = {
            "amount": -75.00,
            "payee": "Updated Payee",
            "category": "Updated Category",
            "description": "Updated Description",
            "is_reconciled": True
        }
        
        # Update the transaction
        transaction = repository.update_transaction("trans-001", update_data)
        assert transaction is not None
        assert transaction.id == "trans-001"
        assert transaction.amount == -75.00
        assert transaction.payee == "Updated Payee"
        assert transaction.category == "Updated Category"
        assert transaction.description == "Updated Description"
        assert transaction.is_reconciled is True
        assert transaction.is_income is False
    
    def test_update_transaction_not_found(self, repository):
        """Test updating a transaction that doesn't exist."""
        update_data = {"amount": -75.00}
        transaction = repository.update_transaction("non-existent-id", update_data)
        assert transaction is None
    
    def test_delete_transaction(self, repository):
        """Test deleting a transaction."""
        # Delete the transaction
        result = repository.delete_transaction("trans-002")
        assert result is True
        
        # Verify it's deleted
        transaction = repository.get_transaction_by_id("trans-002")
        assert transaction is None
    
    def test_delete_transaction_not_found(self, repository):
        """Test deleting a transaction that doesn't exist."""
        result = repository.delete_transaction("non-existent-id")
        assert result is False
    
    def test_import_transactions(self, repository):
        """Test importing multiple transactions."""
        transactions_data = [
            {
                "account_id": "acc-001",
                "date": datetime.now(timezone.utc),
                "amount": -50.00,
                "payee": "Import Payee 1",
                "description": "Import Description 1",
                "category": "Import Category",
                "is_reconciled": False
            },
            {
                "account_id": "acc-001",
                "date": datetime.now(timezone.utc),
                "amount": -30.00,
                "payee": "Import Payee 2",
                "description": "Import Description 2",
                "category": "Import Category",
                "is_reconciled": False
            }
        ]
        
        imported_transactions = repository.import_transactions(transactions_data)
        assert len(imported_transactions) == 2
        assert all(t.account_id == "acc-001" for t in imported_transactions)
        assert any(t.payee == "Import Payee 1" for t in imported_transactions)
        assert any(t.payee == "Import Payee 2" for t in imported_transactions)
    
    def test_search_transactions(self, repository):
        """Test searching for transactions."""
        # Create a transaction with a unique search term
        unique_term = f"Unique{uuid4()}"
        transaction_data = {
            "account_id": "acc-001",
            "date": datetime.now(timezone.utc),
            "amount": -50.00,
            "payee": f"Test Payee {unique_term}",
            "description": "Test Description",
            "category": "Test Category",
            "is_reconciled": False
        }
        repository.create_transaction(transaction_data)
        
        # Search for the transaction
        search_results = repository.search_transactions(unique_term)
        assert len(search_results) > 0
        assert any(unique_term in t.payee for t in search_results)
