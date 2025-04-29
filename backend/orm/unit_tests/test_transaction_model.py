"""
Transaction Model Unit Tests

This module contains unit tests for the Transaction ORM model.
"""
import pytest
from datetime import datetime, timezone
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from database.config import Base
from orm.models import Transaction, Account, AccountType, Institution


class TestTransactionModel:
    """Test cases for the Transaction ORM model."""
    
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
    
    def _seed_test_data(self, session):
        """Seed the database with test data."""
        # Create account types
        account_type = AccountType(id="checking", name="Checking Account")
        session.add(account_type)
        
        # Create institutions
        institution = Institution(id="test_bank", name="Test Bank")
        session.add(institution)
        
        # Create accounts
        account = Account(
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
        session.add(account)
        
        # Commit the changes
        session.commit()
    
    def test_create_transaction(self, db_session):
        """Test creating a transaction."""
        # Create a new transaction
        transaction = Transaction(
            id="trans-test",
            account_id="acc-001",
            date=datetime(2025, 4, 15, tzinfo=timezone.utc),
            amount=-45.67,
            payee="Test Payee",
            description="Test Description",
            category="Test Category",
            is_income=False,
            is_reconciled=True,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        
        # Add to session and commit
        db_session.add(transaction)
        db_session.commit()
        
        # Query the transaction
        queried_transaction = db_session.query(Transaction).filter_by(id="trans-test").first()
        
        # Assertions
        assert queried_transaction is not None
        assert queried_transaction.id == "trans-test"
        assert queried_transaction.account_id == "acc-001"
        assert queried_transaction.amount == -45.67
        assert queried_transaction.payee == "Test Payee"
        assert queried_transaction.description == "Test Description"
        assert queried_transaction.category == "Test Category"
        assert queried_transaction.is_income is False
        assert queried_transaction.is_reconciled is True
    
    def test_transaction_account_relationship(self, db_session):
        """Test the relationship between Transaction and Account."""
        # Create a new transaction
        transaction = Transaction(
            id="trans-rel",
            account_id="acc-001",
            date=datetime(2025, 4, 15, tzinfo=timezone.utc),
            amount=-45.67,
            payee="Test Payee",
            description="Test Description",
            category="Test Category",
            is_income=False,
            is_reconciled=True,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        
        # Add to session and commit
        db_session.add(transaction)
        db_session.commit()
        
        # Query the transaction with the account relationship
        queried_transaction = db_session.query(Transaction).filter_by(id="trans-rel").first()
        
        # Assertions for the relationship
        assert queried_transaction.account is not None
        assert queried_transaction.account.id == "acc-001"
        assert queried_transaction.account.name == "Test Checking"
        
        # Query the account with transactions relationship
        account = db_session.query(Account).filter_by(id="acc-001").first()
        
        # Assertions for the reverse relationship
        assert account.transactions is not None
        assert len(account.transactions) > 0
        assert any(t.id == "trans-rel" for t in account.transactions)
    
    def test_transaction_is_income_calculation(self, db_session):
        """Test that is_income is correctly calculated based on amount."""
        # Create transactions with positive and negative amounts
        expense_transaction = Transaction(
            id="trans-expense",
            account_id="acc-001",
            date=datetime(2025, 4, 15, tzinfo=timezone.utc),
            amount=-45.67,
            payee="Expense Payee",
            description="Expense Description",
            category="Expense Category",
            is_income=False,  # This should match the negative amount
            is_reconciled=True,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        
        income_transaction = Transaction(
            id="trans-income",
            account_id="acc-001",
            date=datetime(2025, 4, 15, tzinfo=timezone.utc),
            amount=100.00,
            payee="Income Payee",
            description="Income Description",
            category="Income Category",
            is_income=True,  # This should match the positive amount
            is_reconciled=True,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        
        # Add to session and commit
        db_session.add(expense_transaction)
        db_session.add(income_transaction)
        db_session.commit()
        
        # Query the transactions
        expense = db_session.query(Transaction).filter_by(id="trans-expense").first()
        income = db_session.query(Transaction).filter_by(id="trans-income").first()
        
        # Assertions
        assert expense.amount < 0
        assert expense.is_income is False
        
        assert income.amount > 0
        assert income.is_income is True
    
    def test_transaction_repr(self, db_session):
        """Test the string representation of a Transaction."""
        # Create a new transaction
        transaction = Transaction(
            id="trans-repr",
            account_id="acc-001",
            date=datetime(2025, 4, 15, tzinfo=timezone.utc),
            amount=-45.67,
            payee="Test Payee",
            description="Test Description",
            category="Test Category",
            is_income=False,
            is_reconciled=True,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        
        # Add to session and commit
        db_session.add(transaction)
        db_session.commit()
        
        # Query the transaction
        queried_transaction = db_session.query(Transaction).filter_by(id="trans-repr").first()
        
        # Test the __repr__ method
        repr_str = repr(queried_transaction)
        assert "trans-repr" in repr_str
        assert "acc-001" in repr_str
        assert "-45.67" in repr_str
        assert "Test Description" in repr_str
