import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.database.models.budget import BudgetItem, Base

def setup_in_memory_db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    return Session()

def test_budget_item_crud():
    session = setup_in_memory_db()

    # Create
    item = BudgetItem(amount=1000.0, type="Salary", section="income", month="May 2025")
    session.add(item)
    session.commit()
    assert item.id is not None

    # Read
    fetched = session.query(BudgetItem).filter_by(month="May 2025").first()
    assert fetched is not None
    assert fetched.amount == 1000.0
    assert fetched.type == "Salary"
    assert fetched.section == "income"
    assert fetched.month == "May 2025"

    # Update
    fetched.amount = 1200.0
    session.commit()
    updated = session.query(BudgetItem).filter_by(id=fetched.id).first()
    assert updated.amount == 1200.0

    # Delete
    session.delete(updated)
    session.commit()
    assert session.query(BudgetItem).filter_by(id=updated.id).first() is None
    session.close() 