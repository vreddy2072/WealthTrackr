"""
Account API Router

This module provides API endpoints for managing financial accounts in the WealthTrackr application.
"""
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Path, Query, Body
from pydantic import BaseModel, Field

from backend.service.account_service import AccountService

# Initialize the router
router = APIRouter(prefix="/api/accounts", tags=["accounts"])

# Initialize the account service
account_service = AccountService()

# Pydantic models for request/response validation
class AccountBase(BaseModel):
    """Base model for account data."""
    name: str = Field(..., description="The name of the account")
    type: str = Field(..., description="The type of account (e.g., checking, savings)")
    institution: str = Field(..., description="The financial institution for the account")
    balance: float = Field(..., description="The current balance of the account")
    currency: str = Field("USD", description="The currency of the account")
    notes: Optional[str] = Field(None, description="Additional notes about the account")

class AccountCreate(AccountBase):
    """Model for creating a new account."""
    pass

class AccountUpdate(BaseModel):
    """Model for updating an existing account."""
    name: Optional[str] = Field(None, description="The name of the account")
    type: Optional[str] = Field(None, description="The type of account")
    institution: Optional[str] = Field(None, description="The financial institution")
    balance: Optional[float] = Field(None, description="The current balance")
    currency: Optional[str] = Field(None, description="The currency of the account")
    notes: Optional[str] = Field(None, description="Additional notes")
    is_active: Optional[bool] = Field(None, description="Whether the account is active")

class AccountResponse(AccountBase):
    """Model for account response data."""
    id: str = Field(..., description="The unique identifier for the account")
    is_active: bool = Field(..., description="Whether the account is active")
    created_at: str = Field(..., description="When the account was created")
    updated_at: str = Field(..., description="When the account was last updated")

class AccountTypeResponse(BaseModel):
    """Model for account type response data."""
    id: str = Field(..., description="The unique identifier for the account type")
    name: str = Field(..., description="The name of the account type")

class InstitutionResponse(BaseModel):
    """Model for institution response data."""
    id: str = Field(..., description="The unique identifier for the institution")
    name: str = Field(..., description="The name of the institution")

# API endpoints
@router.get("/", response_model=List[AccountResponse])
async def get_accounts(
    type: Optional[str] = Query(None, description="Filter by account type"),
    institution: Optional[str] = Query(None, description="Filter by institution")
) -> List[Dict[str, Any]]:
    """
    Get all accounts, optionally filtered by type or institution.
    """
    if type:
        return account_service.get_accounts_by_type(type)
    elif institution:
        return account_service.get_accounts_by_institution(institution)
    else:
        return account_service.get_all_accounts()

@router.get("/{account_id}", response_model=AccountResponse)
async def get_account(
    account_id: str = Path(..., description="The ID of the account to retrieve")
) -> Dict[str, Any]:
    """
    Get a specific account by ID.
    """
    account = account_service.get_account_by_id(account_id)
    if not account:
        raise HTTPException(status_code=404, detail=f"Account with ID {account_id} not found")
    return account

@router.post("/", response_model=AccountResponse, status_code=201)
async def create_account(
    account: AccountCreate = Body(..., description="The account data")
) -> Dict[str, Any]:
    """
    Create a new account.
    """
    return account_service.add_account(account.dict())

@router.put("/{account_id}", response_model=AccountResponse)
async def update_account(
    account_id: str = Path(..., description="The ID of the account to update"),
    account_data: AccountUpdate = Body(..., description="The updated account data")
) -> Dict[str, Any]:
    """
    Update an existing account.
    """
    # Filter out None values
    update_data = {k: v for k, v in account_data.dict().items() if v is not None}
    
    updated_account = account_service.update_account(account_id, update_data)
    if not updated_account:
        raise HTTPException(status_code=404, detail=f"Account with ID {account_id} not found")
    return updated_account

@router.delete("/{account_id}", status_code=204)
async def delete_account(
    account_id: str = Path(..., description="The ID of the account to delete")
) -> None:
    """
    Delete an account.
    """
    success = account_service.delete_account(account_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Account with ID {account_id} not found")

@router.get("/types/all", response_model=List[AccountTypeResponse])
async def get_account_types() -> List[Dict[str, str]]:
    """
    Get all available account types.
    """
    return account_service.get_account_types()

@router.get("/institutions/all", response_model=List[InstitutionResponse])
async def get_institutions() -> List[Dict[str, str]]:
    """
    Get all available financial institutions.
    """
    return account_service.get_institutions()

@router.get("/summary/total-balance", response_model=float)
async def get_total_balance() -> float:
    """
    Get the total balance across all accounts.
    """
    return account_service.get_total_balance()

@router.get("/summary/net-worth", response_model=float)
async def get_net_worth() -> float:
    """
    Get the net worth (assets minus liabilities).
    """
    return account_service.get_net_worth()
