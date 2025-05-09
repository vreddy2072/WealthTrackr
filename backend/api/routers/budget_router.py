from fastapi import APIRouter, HTTPException
from typing import List, Optional
from backend.service.budget_service import (
    get_budget, create_budget, update_budget, delete_budget
)
from backend.models.budget import BudgetItem, BudgetItemCreate, BudgetResponse

router = APIRouter(prefix="/api/budget", tags=["Budget"])

@router.get("/", response_model=BudgetResponse)
def api_get_budget(month: Optional[str] = None):
    return get_budget(month)

@router.post("/", response_model=BudgetItem)
def api_create_budget(item: BudgetItemCreate):
    return create_budget(item)

@router.put("/{item_id}", response_model=BudgetItem)
def api_update_budget(item_id: int, item: BudgetItem):
    return update_budget(item_id, item)

@router.delete("/{item_id}")
def api_delete_budget(item_id: int):
    return delete_budget(item_id) 