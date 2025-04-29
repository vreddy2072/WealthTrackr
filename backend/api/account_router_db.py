"""
Account Router Module (Database Version)

This module provides API endpoints for account management using database persistence.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.database.config.config import get_db
from backend.service.account_service_db import AccountServiceDB
from backend.api.models import (
    AccountResponse, AccountCreate, AccountUpdate,
    AccountTypeResponse, InstitutionResponse
)

router = APIRouter(prefix="/api/accounts", tags=["accounts"])

@router.get("/", response_model=List[AccountResponse])
async def get_accounts(
    type: Optional[str] = Query(None, description="Filter accounts by type"),
    institution: Optional[str] = Query(None, description="Filter accounts by institution"),
    db: Session = Depends(get_db)
):
    """
    Get all accounts, optionally filtered by type or institution.

    Args:
        type (Optional[str]): Filter accounts by type.
        institution (Optional[str]): Filter accounts by institution.
        db (Session): The database session.

    Returns:
        List[AccountResponse]: A list of accounts.
    """
    account_service = AccountServiceDB(db)

    if type:
        return account_service.get_accounts_by_type(type)
    elif institution:
        return account_service.get_accounts_by_institution(institution)
    else:
        return account_service.get_all_accounts()

@router.get("/{account_id}", response_model=AccountResponse)
async def get_account(account_id: str, db: Session = Depends(get_db)):
    """
    Get an account by its ID.

    Args:
        account_id (str): The ID of the account to retrieve.
        db (Session): The database session.

    Returns:
        AccountResponse: The account.

    Raises:
        HTTPException: If the account is not found.
    """
    account_service = AccountServiceDB(db)
    account = account_service.get_account_by_id(account_id)

    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    return account

@router.post("/", response_model=AccountResponse, status_code=201)
async def create_account(account: AccountCreate, db: Session = Depends(get_db)):
    """
    Create a new account.

    Args:
        account (AccountCreate): The account data.
        db (Session): The database session.

    Returns:
        AccountResponse: The created account.
    """
    account_service = AccountServiceDB(db)
    return account_service.add_account(account.model_dump())

@router.put("/{account_id}", response_model=AccountResponse)
async def update_account(account_id: str, account_data: AccountUpdate, db: Session = Depends(get_db)):
    """
    Update an existing account.

    Args:
        account_id (str): The ID of the account to update.
        account_data (AccountUpdate): The new account data.
        db (Session): The database session.

    Returns:
        AccountResponse: The updated account.

    Raises:
        HTTPException: If the account is not found.
    """
    account_service = AccountServiceDB(db)

    # Filter out None values
    update_data = {k: v for k, v in account_data.model_dump().items() if v is not None}

    updated_account = account_service.update_account(account_id, update_data)

    if not updated_account:
        raise HTTPException(status_code=404, detail="Account not found")

    return updated_account

@router.delete("/{account_id}", status_code=204)
async def delete_account(account_id: str, db: Session = Depends(get_db)):
    """
    Delete an account.

    Args:
        account_id (str): The ID of the account to delete.
        db (Session): The database session.

    Raises:
        HTTPException: If the account is not found.
    """
    account_service = AccountServiceDB(db)
    success = account_service.delete_account(account_id)

    if not success:
        raise HTTPException(status_code=404, detail="Account not found")

@router.get("/types/all", response_model=List[AccountTypeResponse])
async def get_account_types(db: Session = Depends(get_db)):
    """
    Get all account types.

    Args:
        db (Session): The database session.

    Returns:
        List[AccountTypeResponse]: A list of account types.
    """
    account_service = AccountServiceDB(db)
    return account_service.get_account_types()

@router.get("/institutions/all", response_model=List[InstitutionResponse])
async def get_institutions(db: Session = Depends(get_db)):
    """
    Get all financial institutions.

    Args:
        db (Session): The database session.

    Returns:
        List[InstitutionResponse]: A list of financial institutions.
    """
    account_service = AccountServiceDB(db)
    return account_service.get_institutions()

@router.get("/stats/total-balance", response_model=float)
async def get_total_balance(db: Session = Depends(get_db)):
    """
    Get the total balance across all accounts.

    Args:
        db (Session): The database session.

    Returns:
        float: The total balance.
    """
    account_service = AccountServiceDB(db)
    return account_service.get_total_balance()

@router.get("/stats/net-worth", response_model=float)
async def get_net_worth(db: Session = Depends(get_db)):
    """
    Calculate the net worth (assets minus liabilities).

    Args:
        db (Session): The database session.

    Returns:
        float: The net worth.
    """
    account_service = AccountServiceDB(db)
    return account_service.get_net_worth()
