"""
Transaction Router Module

This module provides API endpoints for transaction management.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Body
from datetime import datetime

from service.transaction_service import TransactionService

router = APIRouter(prefix="/api/transactions", tags=["transactions"])

@router.get("/", response_model=List[dict])
async def get_transactions(
    account_id: Optional[str] = Query(None, description="Filter by account ID"),
    category: Optional[str] = Query(None, description="Filter by category"),
    start_date: Optional[str] = Query(None, description="Filter by start date (ISO format)"),
    end_date: Optional[str] = Query(None, description="Filter by end date (ISO format)"),
    min_amount: Optional[float] = Query(None, description="Filter by minimum amount"),
    max_amount: Optional[float] = Query(None, description="Filter by maximum amount"),
    is_reconciled: Optional[bool] = Query(None, description="Filter by reconciliation status")
):
    """
    Get all transactions, optionally filtered by various criteria.

    Args:
        account_id (Optional[str]): Filter by account ID.
        category (Optional[str]): Filter by category.
        start_date (Optional[str]): Filter by start date (ISO format).
        end_date (Optional[str]): Filter by end date (ISO format).
        min_amount (Optional[float]): Filter by minimum amount.
        max_amount (Optional[float]): Filter by maximum amount.
        is_reconciled (Optional[bool]): Filter by reconciliation status.

    Returns:
        List[dict]: A list of transactions.
    """
    transaction_service = TransactionService()

    # Create filter object from query parameters
    filters = {}
    if account_id:
        filters["account_id"] = account_id
    if category:
        filters["category"] = category
    if start_date:
        filters["start_date"] = start_date
    if end_date:
        filters["end_date"] = end_date
    if min_amount is not None:
        filters["min_amount"] = min_amount
    if max_amount is not None:
        filters["max_amount"] = max_amount
    if is_reconciled is not None:
        filters["is_reconciled"] = is_reconciled

    if filters:
        return transaction_service.filter_transactions(filters)
    else:
        return transaction_service.get_all_transactions()

@router.get("/{transaction_id}", response_model=dict)
async def get_transaction(transaction_id: str):
    """
    Get a transaction by its ID.

    Args:
        transaction_id (str): The ID of the transaction to retrieve.

    Returns:
        dict: The transaction.

    Raises:
        HTTPException: If the transaction is not found.
    """
    transaction_service = TransactionService()
    transaction = transaction_service.get_transaction_by_id(transaction_id)

    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    return transaction

@router.get("/account/{account_id}", response_model=List[dict])
async def get_transactions_by_account(account_id: str):
    """
    Get all transactions for a specific account.

    Args:
        account_id (str): The ID of the account to get transactions for.

    Returns:
        List[dict]: A list of transactions for the specified account.
    """
    transaction_service = TransactionService()
    return transaction_service.get_transactions_by_account(account_id)

@router.post("/", response_model=dict, status_code=201)
async def create_transaction(transaction: dict):
    """
    Create a new transaction.

    Args:
        transaction (dict): The transaction data.

    Returns:
        dict: The created transaction.
    """
    transaction_service = TransactionService()
    return transaction_service.add_transaction(transaction)

@router.put("/{transaction_id}", response_model=dict)
async def update_transaction(transaction_id: str, transaction_data: dict):
    """
    Update an existing transaction.

    Args:
        transaction_id (str): The ID of the transaction to update.
        transaction_data (dict): The new transaction data.

    Returns:
        dict: The updated transaction.

    Raises:
        HTTPException: If the transaction is not found.
    """
    transaction_service = TransactionService()
    updated_transaction = transaction_service.update_transaction(transaction_id, transaction_data)

    if not updated_transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    return updated_transaction

@router.delete("/{transaction_id}", status_code=204)
async def delete_transaction(transaction_id: str):
    """
    Delete a transaction.

    Args:
        transaction_id (str): The ID of the transaction to delete.

    Raises:
        HTTPException: If the transaction is not found.
    """
    transaction_service = TransactionService()
    success = transaction_service.delete_transaction(transaction_id)

    if not success:
        raise HTTPException(status_code=404, detail="Transaction not found")

@router.post("/search", response_model=List[dict])
async def search_transactions(query: str = Body(..., embed=True)):
    """
    Search for transactions by payee, category, or description.

    Args:
        query (str): The search query.

    Returns:
        List[dict]: A list of transactions matching the query.
    """
    transaction_service = TransactionService()
    return transaction_service.search_transactions(query)

@router.post("/import", response_model=List[dict], status_code=201)
async def import_transactions(import_data: dict):
    """
    Import multiple transactions for an account.

    Args:
        import_data (dict): The import data containing account ID and transactions.

    Returns:
        List[dict]: The list of imported transactions.
    """
    transaction_service = TransactionService()

    # Extract account ID and transactions from import data
    account_id = import_data.get("account_id")
    transactions = import_data.get("transactions", [])

    # Import the transactions using the service method
    return transaction_service.import_transactions(account_id, transactions)
