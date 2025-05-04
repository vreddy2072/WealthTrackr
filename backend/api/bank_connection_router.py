"""
Bank Connection Router Module

This module provides API endpoints for bank connection management.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.database.config.config import get_db
from backend.service.bank_connection_service import BankConnectionService
from backend.api.models import (
    BankConnectionResponse, BankConnectionCreate, BankConnectionUpdate,
    BankConnectionAccountResponse, BankConnectionAccountCreate
)

router = APIRouter(prefix="/api/bank-connections", tags=["bank-connections"])

@router.get("/", response_model=List[BankConnectionResponse])
async def get_bank_connections(
    institution_id: Optional[str] = Query(None, description="Filter by institution ID"),
    db: Session = Depends(get_db)
):
    """
    Get all bank connections, optionally filtered by institution.

    Args:
        institution_id (Optional[str]): Filter by institution ID.
        db (Session): The database session.

    Returns:
        List[BankConnectionResponse]: A list of bank connections.
    """
    bank_connection_service = BankConnectionService(db)
    connections = bank_connection_service.get_all_connections()
    
    if institution_id:
        connections = [c for c in connections if c["institution_id"] == institution_id]
    
    return connections

@router.get("/{connection_id}", response_model=BankConnectionResponse)
async def get_bank_connection(
    connection_id: str,
    db: Session = Depends(get_db)
):
    """
    Get a bank connection by ID.

    Args:
        connection_id (str): The ID of the bank connection.
        db (Session): The database session.

    Returns:
        BankConnectionResponse: The bank connection.
    """
    bank_connection_service = BankConnectionService(db)
    connection = bank_connection_service.get_connection_by_id(connection_id)
    
    if not connection:
        raise HTTPException(status_code=404, detail=f"Bank connection with ID {connection_id} not found")
    
    return connection

@router.post("/", response_model=BankConnectionResponse)
async def create_bank_connection(
    connection_data: BankConnectionCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new bank connection.

    Args:
        connection_data (BankConnectionCreate): The bank connection data.
        db (Session): The database session.

    Returns:
        BankConnectionResponse: The created bank connection.
    """
    bank_connection_service = BankConnectionService(db)
    
    try:
        connection = bank_connection_service.create_connection(
            connection_data.public_token,
            connection_data.institution_id
        )
        return connection
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{connection_id}", response_model=BankConnectionResponse)
async def update_bank_connection(
    connection_id: str,
    connection_data: BankConnectionUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a bank connection.

    Args:
        connection_id (str): The ID of the bank connection.
        connection_data (BankConnectionUpdate): The updated bank connection data.
        db (Session): The database session.

    Returns:
        BankConnectionResponse: The updated bank connection.
    """
    bank_connection_service = BankConnectionService(db)
    
    # Convert Pydantic model to dict, excluding None values
    update_data = {k: v for k, v in connection_data.dict().items() if v is not None}
    
    connection = bank_connection_service.update_connection(connection_id, update_data)
    
    if not connection:
        raise HTTPException(status_code=404, detail=f"Bank connection with ID {connection_id} not found")
    
    return connection

@router.delete("/{connection_id}")
async def delete_bank_connection(
    connection_id: str,
    db: Session = Depends(get_db)
):
    """
    Delete a bank connection.

    Args:
        connection_id (str): The ID of the bank connection.
        db (Session): The database session.

    Returns:
        dict: A success message.
    """
    bank_connection_service = BankConnectionService(db)
    
    success = bank_connection_service.delete_connection(connection_id)
    
    if not success:
        raise HTTPException(status_code=404, detail=f"Bank connection with ID {connection_id} not found")
    
    return {"message": f"Bank connection with ID {connection_id} deleted successfully"}

@router.post("/{connection_id}/accounts", response_model=BankConnectionAccountResponse)
async def link_account_to_connection(
    connection_id: str,
    link_data: BankConnectionAccountCreate,
    db: Session = Depends(get_db)
):
    """
    Link an account to a bank connection.

    Args:
        connection_id (str): The ID of the bank connection.
        link_data (BankConnectionAccountCreate): The link data.
        db (Session): The database session.

    Returns:
        BankConnectionAccountResponse: The created bank connection account link.
    """
    bank_connection_service = BankConnectionService(db)
    
    # Ensure the connection ID in the path matches the one in the request body
    if link_data.bank_connection_id != connection_id:
        raise HTTPException(status_code=400, detail="Connection ID in path does not match the one in the request body")
    
    try:
        link = bank_connection_service.link_account_to_connection(
            link_data.bank_connection_id,
            link_data.account_id,
            link_data.external_account_id
        )
        return link
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{connection_id}/accounts/{account_id}")
async def unlink_account_from_connection(
    connection_id: str,
    account_id: str,
    db: Session = Depends(get_db)
):
    """
    Unlink an account from a bank connection.

    Args:
        connection_id (str): The ID of the bank connection.
        account_id (str): The ID of the account.
        db (Session): The database session.

    Returns:
        dict: A success message.
    """
    bank_connection_service = BankConnectionService(db)
    
    success = bank_connection_service.unlink_account_from_connection(connection_id, account_id)
    
    if not success:
        raise HTTPException(status_code=404, detail=f"Link between connection {connection_id} and account {account_id} not found")
    
    return {"message": f"Account {account_id} unlinked from connection {connection_id} successfully"}

@router.post("/{connection_id}/accounts/{account_id}/sync")
async def sync_account_transactions(
    connection_id: str,
    account_id: str,
    db: Session = Depends(get_db)
):
    """
    Sync transactions for an account from the bank.

    Args:
        connection_id (str): The ID of the bank connection.
        account_id (str): The ID of the account.
        db (Session): The database session.

    Returns:
        dict: The sync result.
    """
    bank_connection_service = BankConnectionService(db)
    
    result = bank_connection_service.sync_account_transactions(connection_id, account_id)
    
    if not result.get("success", False):
        raise HTTPException(status_code=400, detail=result.get("message", "Failed to sync transactions"))
    
    return result

@router.get("/plaid/link-token")
async def get_plaid_link_token(
    db: Session = Depends(get_db)
):
    """
    Get a link token from Plaid for initializing Plaid Link.

    Args:
        db (Session): The database session.

    Returns:
        dict: The link token response.
    """
    bank_connection_service = BankConnectionService(db)
    
    try:
        link_token = bank_connection_service.get_plaid_link_token()
        return link_token
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
