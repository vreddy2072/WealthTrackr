from pydantic import BaseModel
from typing import List

class BudgetItem(BaseModel):
    id: int
    amount: float
    type: str
    section: str  # e.g., 'income', 'bills', etc.

class BudgetItemCreate(BaseModel):
    amount: float
    type: str
    section: str  # e.g., 'income', 'bills', etc.

class BudgetResponse(BaseModel):
    month: str
    items: List[BudgetItem] 