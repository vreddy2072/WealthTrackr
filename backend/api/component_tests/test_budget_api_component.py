import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from backend.main import app
from backend.database.config.config import Base, get_db
from backend.database.models.budget import BudgetItem

# Use a test database (in-memory SQLite) with StaticPool to share the same DB across connections
TEST_DB_URL = "sqlite:///:memory:"
engine = create_engine(
    TEST_DB_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Ensure tables are created before any tests/fixtures run
Base.metadata.create_all(bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(autouse=True)
def clear_budget_table():
    # Clean up the table before each test
    session = TestingSessionLocal()
    session.query(BudgetItem).delete()
    session.commit()
    session.close()


def test_create_and_get_budget_item():
    # Create
    payload = {"amount": 5000, "type": "Salary", "section": "income", "month": "May 2025"}
    resp = client.post("/api/budget/", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["amount"] == 5000
    assert data["type"] == "Salary"
    assert data["section"] == "income"
    assert data["month"] == "May 2025"
    item_id = data["id"]

    # Get
    resp = client.get("/api/budget/?month=May%202025")
    assert resp.status_code == 200
    data = resp.json()
    assert data["month"] == "May 2025"
    assert any(item["type"] == "Salary" for item in data["items"])


def test_update_budget_item():
    # Create
    payload = {"amount": 1000, "type": "Bonus", "section": "income", "month": "May 2025"}
    resp = client.post("/api/budget/", json=payload)
    item_id = resp.json()["id"]

    # Update
    update_payload = {"id": item_id, "amount": 2000, "type": "Bonus", "section": "income", "month": "May 2025"}
    resp = client.put(f"/api/budget/{item_id}", json=update_payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["amount"] == 2000


def test_delete_budget_item():
    # Create
    payload = {"amount": 300, "type": "Streaming", "section": "subscriptions", "month": "May 2025"}
    resp = client.post("/api/budget/", json=payload)
    item_id = resp.json()["id"]

    # Delete
    resp = client.delete(f"/api/budget/{item_id}")
    assert resp.status_code == 200
    # Ensure it's gone
    resp = client.get("/api/budget/?month=May%202025")
    data = resp.json()
    assert all(item["id"] != item_id for item in data["items"]) 