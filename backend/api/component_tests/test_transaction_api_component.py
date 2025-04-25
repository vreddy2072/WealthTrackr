"""
Transaction API Component Tests

This module contains component tests for the transaction API endpoints.
These tests verify that the entire stack (API -> Service -> Repository -> Database) works correctly.
"""
import pytest
from datetime import datetime, timezone
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
import uuid

from backend.database.config.config import Base, get_db
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.account_router_db import router as account_router
from backend.api.transaction_router_db import router as transaction_router

# Create a test app without running migrations
app = FastAPI(
    title="WealthTrackr API",
    description="API for the WealthTrackr personal finance application",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(account_router)
app.include_router(transaction_router)
from backend.database.models.account import AccountType, Institution, Account
from backend.database.models.transaction import Transaction


# Create a test client
client = TestClient(app)

# Use in-memory SQLite database for testing
TEST_DB_URL = "sqlite:///:memory:"


class TestTransactionAPIComponent:
    """Component tests for the Transaction API endpoints."""

    @pytest.fixture(scope="class")
    def db_engine(self):
        """Create a test database engine."""
        engine = create_engine(TEST_DB_URL)
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

        # Override the get_db dependency
        def override_get_db():
            try:
                yield session
                session.commit()
            finally:
                session.close()

        app.dependency_overrides[get_db] = override_get_db

        yield session

        # Clean up
        session.close()
        app.dependency_overrides.clear()

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

    def test_get_all_transactions(self, db_session):
        """Test getting all transactions."""
        response = client.get("/api/transactions/")

        assert response.status_code == 200
        transactions = response.json()
        assert len(transactions) >= 3
        assert any(t["id"] == "trans-001" for t in transactions)
        assert any(t["id"] == "trans-002" for t in transactions)
        assert any(t["id"] == "trans-003" for t in transactions)

    def test_get_transaction_by_id(self, db_session):
        """Test getting a transaction by ID."""
        response = client.get("/api/transactions/trans-001")

        assert response.status_code == 200
        transaction = response.json()
        assert transaction["id"] == "trans-001"
        assert transaction["payee"] == "Grocery Store"
        assert transaction["amount"] == -45.67
        assert transaction["category"] == "Groceries"
        assert transaction["account_id"] == "acc-001"
        assert transaction["account_name"] == "Test Checking"

    def test_get_transaction_not_found(self, db_session):
        """Test getting a transaction that doesn't exist."""
        response = client.get("/api/transactions/non-existent-id")

        assert response.status_code == 404
        assert "detail" in response.json()
        assert "not found" in response.json()["detail"].lower()

    def test_get_transactions_by_account(self, db_session):
        """Test getting transactions by account."""
        response = client.get("/api/transactions/account/acc-001")

        assert response.status_code == 200
        transactions = response.json()
        assert len(transactions) >= 2
        assert all(t["account_id"] == "acc-001" for t in transactions)
        assert any(t["id"] == "trans-001" for t in transactions)
        assert any(t["id"] == "trans-002" for t in transactions)

    def test_create_transaction(self, db_session):
        """Test creating a new transaction."""
        transaction_data = {
            "account_id": "acc-001",
            "date": datetime.now(timezone.utc).isoformat(),
            "amount": -50.00,
            "payee": "Test Payee",
            "category": "Test Category",
            "description": "Test Description",
            "is_reconciled": False
        }

        response = client.post("/api/transactions/", json=transaction_data)

        assert response.status_code == 201
        created_transaction = response.json()
        assert created_transaction["account_id"] == transaction_data["account_id"]
        assert created_transaction["amount"] == transaction_data["amount"]
        assert created_transaction["payee"] == transaction_data["payee"]
        assert created_transaction["category"] == transaction_data["category"]
        assert created_transaction["description"] == transaction_data["description"]
        assert created_transaction["is_reconciled"] == transaction_data["is_reconciled"]

        # Verify the transaction was actually created in the database
        db_transaction = db_session.query(Transaction).filter_by(id=created_transaction["id"]).first()
        assert db_transaction is not None
        assert db_transaction.payee == transaction_data["payee"]

    def test_update_transaction(self, db_session):
        """Test updating a transaction."""
        # First, create a transaction to update
        transaction_data = {
            "account_id": "acc-001",
            "date": datetime.now(timezone.utc).isoformat(),
            "amount": -60.00,
            "payee": "Original Payee",
            "category": "Original Category",
            "description": "Original Description",
            "is_reconciled": False
        }

        create_response = client.post("/api/transactions/", json=transaction_data)
        created_transaction = create_response.json()
        transaction_id = created_transaction["id"]

        # Now update the transaction
        update_data = {
            "amount": -75.00,
            "payee": "Updated Payee",
            "category": "Updated Category",
            "description": "Updated Description",
            "is_reconciled": True
        }

        update_response = client.put(f"/api/transactions/{transaction_id}", json=update_data)

        assert update_response.status_code == 200
        updated_transaction = update_response.json()
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

    def test_delete_transaction(self, db_session):
        """Test deleting a transaction."""
        # First, create a transaction to delete
        transaction_data = {
            "account_id": "acc-001",
            "date": datetime.now(timezone.utc).isoformat(),
            "amount": -70.00,
            "payee": "Delete Test Payee",
            "category": "Delete Test Category",
            "description": "Delete Test Description",
            "is_reconciled": False
        }

        create_response = client.post("/api/transactions/", json=transaction_data)
        created_transaction = create_response.json()
        transaction_id = created_transaction["id"]

        # Now delete the transaction
        delete_response = client.delete(f"/api/transactions/{transaction_id}")

        assert delete_response.status_code == 204

        # Verify the transaction was actually deleted from the database
        db_transaction = db_session.query(Transaction).filter_by(id=transaction_id).first()
        assert db_transaction is None

        # Verify the API returns 404 when trying to get the deleted transaction
        get_response = client.get(f"/api/transactions/{transaction_id}")
        assert get_response.status_code == 404

    def test_filter_transactions(self, db_session):
        """Test filtering transactions."""
        # Test filtering by account ID
        response = client.get("/api/transactions/?account_id=acc-001")
        assert response.status_code == 200
        transactions = response.json()
        assert len(transactions) >= 2
        assert all(t["account_id"] == "acc-001" for t in transactions)

        # Test filtering by category
        response = client.get("/api/transactions/?category=Groceries")
        assert response.status_code == 200
        transactions = response.json()
        assert len(transactions) >= 1
        assert all(t["category"] == "Groceries" for t in transactions)

        # Test filtering by amount range
        response = client.get("/api/transactions/?min_amount=-30&max_amount=0")
        assert response.status_code == 200
        transactions = response.json()
        assert len(transactions) >= 1
        assert all(-30 <= t["amount"] <= 0 for t in transactions)

        # Test filtering by reconciliation status
        response = client.get("/api/transactions/?is_reconciled=false")
        assert response.status_code == 200
        transactions = response.json()
        assert len(transactions) >= 1
        assert all(t["is_reconciled"] is False for t in transactions)

    def test_search_transactions(self, db_session):
        """Test searching for transactions."""
        # Create a transaction with a unique search term
        unique_term = f"Unique{uuid.uuid4()}"
        transaction_data = {
            "account_id": "acc-001",
            "date": datetime.now(timezone.utc).isoformat(),
            "amount": -50.00,
            "payee": f"Test Payee {unique_term}",
            "category": "Test Category",
            "description": "Test Description",
            "is_reconciled": False
        }

        client.post("/api/transactions/", json=transaction_data)

        # Search for the transaction
        response = client.post("/api/transactions/search", json={"query": unique_term})

        assert response.status_code == 200
        transactions = response.json()
        assert len(transactions) >= 1
        assert any(unique_term in t["payee"] for t in transactions)

    def test_import_transactions(self, db_session):
        """Test importing multiple transactions."""
        # Create TransactionImport model data
        now = datetime.now(timezone.utc).isoformat()
        import_data = {
            "account_id": "acc-001",
            "transactions": [
                {
                    "account_id": "acc-001",
                    "date": now,
                    "amount": -50.00,
                    "payee": "Import Payee 1",
                    "category": "Import Category",
                    "description": "Import Description 1",
                    "is_reconciled": False
                },
                {
                    "account_id": "acc-001",
                    "date": now,
                    "amount": -30.00,
                    "payee": "Import Payee 2",
                    "category": "Import Category",
                    "description": "Import Description 2",
                    "is_reconciled": False
                }
            ]
        }

        response = client.post("/api/transactions/import", json=import_data)

        assert response.status_code == 201
        imported_transactions = response.json()
        assert len(imported_transactions) == 2
        assert all(t["account_id"] == "acc-001" for t in imported_transactions)
        assert any(t["payee"] == "Import Payee 1" for t in imported_transactions)
        assert any(t["payee"] == "Import Payee 2" for t in imported_transactions)

        # Verify the transactions were actually created in the database
        db_transactions = db_session.query(Transaction).filter(
            Transaction.payee.in_(["Import Payee 1", "Import Payee 2"])
        ).all()
        assert len(db_transactions) == 2
