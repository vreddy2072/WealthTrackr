from pydantic import BaseModel, ConfigDict
from typing import List

class BudgetItem(BaseModel):
    id: int
    amount: float
    type: str
    section: str  # e.g., 'income', 'bills', etc.
    month: str
    model_config = ConfigDict(from_attributes=True)

class BudgetItemCreate(BaseModel):
    amount: float
    type: str
    section: str  # e.g., 'income', 'bills', etc.
    month: str

class BudgetResponse(BaseModel):
    month: str
    items: List[BudgetItem] 