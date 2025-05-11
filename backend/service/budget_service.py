from typing import List, Optional
from sqlalchemy.orm import Session
from backend.models.budget import BudgetItem, BudgetItemCreate, BudgetResponse
from backend.database.repositories.budget_repository import BudgetRepository

def get_budget(db: Session, month: Optional[str] = None) -> BudgetResponse:
    m = month or "May 2025"
    repo = BudgetRepository(db)
    items = repo.get_budget_items_by_month(m)
    # Convert ORM objects to Pydantic models
    pydantic_items = [BudgetItem.model_validate(item) for item in items]
    return BudgetResponse(month=m, items=pydantic_items)

def create_budget(db: Session, item: BudgetItemCreate) -> BudgetItem:
    repo = BudgetRepository(db)
    item_data = item.dict()
    new_item = repo.add_budget_item(item_data)
    return new_item

def update_budget(db: Session, item_id: int, item: BudgetItem) -> BudgetItem:
    repo = BudgetRepository(db)
    update_data = item.dict(exclude_unset=True)
    updated = repo.update_budget_item(item_id, update_data)
    if not updated:
        raise ValueError("Item not found")
    return updated

def delete_budget(db: Session, item_id: int):
    repo = BudgetRepository(db)
    success = repo.delete_budget_item(item_id)
    if not success:
        raise ValueError("Item not found")
    return {"ok": True} 