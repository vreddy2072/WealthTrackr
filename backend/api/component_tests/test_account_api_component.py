"""
Account API Component Tests

This module contains component tests for the account API endpoints.
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


# Create a test client
client = TestClient(app)

# Use in-memory SQLite database for testing with thread checking disabled
TEST_DB_URL = "sqlite:///:memory:?check_same_thread=False"


class TestAccountAPIComponent:
    """Component tests for the Account API endpoints."""

    @pytest.fixture(scope="class")
    def db_engine(self):
        """Create a test database engine."""
        engine = create_engine(TEST_DB_URL)
        # Create all tables
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

    def test_get_all_accounts(self, db_session):
        """Test getting all accounts."""
        response = client.get("/api/accounts/")

        assert response.status_code == 200
        accounts = response.json()
        assert len(accounts) >= 3
        assert any(a["id"] == "acc-001" for a in accounts)
        assert any(a["id"] == "acc-002" for a in accounts)
        assert any(a["id"] == "acc-003" for a in accounts)

    def test_get_account_by_id(self, db_session):
        """Test getting an account by ID."""
        response = client.get("/api/accounts/acc-001")

        assert response.status_code == 200
        account = response.json()
        assert account["id"] == "acc-001"
        assert account["name"] == "Test Checking"
        assert account["type"] == "checking"
        assert account["institution"] == "test_bank"
        assert account["balance"] == 1000.0

    def test_get_account_not_found(self, db_session):
        """Test getting an account that doesn't exist."""
        response = client.get("/api/accounts/non-existent-id")

        assert response.status_code == 404
        assert "detail" in response.json()
        assert "not found" in response.json()["detail"].lower()

    def test_get_accounts_by_type(self, db_session):
        """Test getting accounts by type."""
        response = client.get("/api/accounts/?type=checking")

        assert response.status_code == 200
        accounts = response.json()
        assert len(accounts) >= 1
        assert all(a["type"] == "checking" for a in accounts)
        assert any(a["id"] == "acc-001" for a in accounts)

    def test_get_accounts_by_institution(self, db_session):
        """Test getting accounts by institution."""
        response = client.get("/api/accounts/?institution=test_bank")

        assert response.status_code == 200
        accounts = response.json()
        assert len(accounts) >= 2
        assert all(a["institution"] == "test_bank" for a in accounts)
        assert any(a["id"] == "acc-001" for a in accounts)
        assert any(a["id"] == "acc-002" for a in accounts)

    def test_create_account(self, db_session):
        """Test creating a new account."""
        account_data = {
            "name": "New Test Account",
            "type": "checking",
            "institution": "test_bank",
            "balance": 2000.00,
            "currency": "USD",
            "notes": "New test account"
        }

        response = client.post("/api/accounts/", json=account_data)

        assert response.status_code == 201
        created_account = response.json()
        assert created_account["name"] == account_data["name"]
        assert created_account["type"] == account_data["type"]
        assert created_account["institution"] == account_data["institution"]
        assert created_account["balance"] == account_data["balance"]
        assert created_account["currency"] == account_data["currency"]
        assert created_account["notes"] == account_data["notes"]

        # Verify the account was actually created in the database
        db_account = db_session.query(Account).filter_by(id=created_account["id"]).first()
        assert db_account is not None
        assert db_account.name == account_data["name"]

    def test_update_account(self, db_session):
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

        create_response = client.post("/api/accounts/", json=account_data)
        created_account = create_response.json()
        account_id = created_account["id"]

        # Now update the account
        update_data = {
            "name": "Updated Account Name",
            "balance": 3500.00,
            "notes": "Updated account notes"
        }

        update_response = client.put(f"/api/accounts/{account_id}", json=update_data)

        assert update_response.status_code == 200
        updated_account = update_response.json()
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

    def test_delete_account(self, db_session):
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

        create_response = client.post("/api/accounts/", json=account_data)
        created_account = create_response.json()
        account_id = created_account["id"]

        # Now delete the account
        delete_response = client.delete(f"/api/accounts/{account_id}")

        assert delete_response.status_code == 204

        # Verify the account was actually deleted from the database
        db_account = db_session.query(Account).filter_by(id=account_id).first()
        assert db_account is None

        # Verify the API returns 404 when trying to get the deleted account
        get_response = client.get(f"/api/accounts/{account_id}")
        assert get_response.status_code == 404

    def test_get_account_types(self, db_session):
        """Test getting all account types."""
        response = client.get("/api/accounts/types/all")

        assert response.status_code == 200
        account_types = response.json()
        assert len(account_types) >= 4
        assert any(t["id"] == "checking" for t in account_types)
        assert any(t["id"] == "savings" for t in account_types)
        assert any(t["id"] == "credit" for t in account_types)
        assert any(t["id"] == "investment" for t in account_types)

    def test_get_institutions(self, db_session):
        """Test getting all institutions."""
        response = client.get("/api/accounts/institutions/all")

        assert response.status_code == 200
        institutions = response.json()
        assert len(institutions) >= 2
        assert any(i["id"] == "test_bank" for i in institutions)
        assert any(i["id"] == "other_bank" for i in institutions)

    def test_get_total_balance(self, db_session):
        """Test getting the total balance."""
        response = client.get("/api/accounts/stats/total-balance")

        assert response.status_code == 200
        total_balance = response.json()
        # The total balance should be the sum of all positive account balances
        assert total_balance >= 6000.0  # 1000 + 5000

    def test_get_net_worth(self, db_session):
        """Test getting the net worth."""
        response = client.get("/api/accounts/stats/net-worth")

        assert response.status_code == 200
        net_worth = response.json()
        # The net worth should be the sum of all account balances (positive and negative)
        assert net_worth >= 5500.0  # 1000 + 5000 - 500
