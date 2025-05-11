from typing import List, Optional
from sqlalchemy.orm import Session
from backend.database.models.budget import BudgetItem

class BudgetRepository:
    def __init__(self, db: Session):
        self.db = db

    def add_budget_item(self, item_data: dict) -> BudgetItem:
        item = BudgetItem(**item_data)
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return item

    def get_budget_items_by_month(self, month: str) -> List[BudgetItem]:
        return self.db.query(BudgetItem).filter_by(month=month).all()

    def update_budget_item(self, item_id: int, update_data: dict) -> Optional[BudgetItem]:
        item = self.db.query(BudgetItem).filter_by(id=item_id).first()
        if not item:
            return None
        for key, value in update_data.items():
            setattr(item, key, value)
        self.db.commit()
        self.db.refresh(item)
        return item

    def delete_budget_item(self, item_id: int) -> bool:
        item = self.db.query(BudgetItem).filter_by(id=item_id).first()
        if not item:
            return False
        self.db.delete(item)
        self.db.commit()
        return True 