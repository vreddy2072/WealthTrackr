from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.service.budget_service import (
    get_budget, create_budget, update_budget, delete_budget
)
from backend.models.budget import BudgetItem, BudgetItemCreate, BudgetResponse
from backend.database.config.config import get_db

router = APIRouter(prefix="/api/budget", tags=["Budget"])

@router.get("/", response_model=BudgetResponse)
def api_get_budget(month: Optional[str] = None, db: Session = Depends(get_db)):
    return get_budget(db, month)

@router.post("/", response_model=BudgetItem)
def api_create_budget(item: BudgetItemCreate, db: Session = Depends(get_db)):
    return create_budget(db, item)

@router.put("/{item_id}", response_model=BudgetItem)
def api_update_budget(item_id: int, item: BudgetItem, db: Session = Depends(get_db)):
    return update_budget(db, item_id, item)

@router.delete("/{item_id}")
def api_delete_budget(item_id: int, db: Session = Depends(get_db)):
    return delete_budget(db, item_id) 