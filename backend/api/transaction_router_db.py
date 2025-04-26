"""
Transaction Router Module (Database Version)

This module provides API endpoints for transaction management using database persistence.
"""
from typing import List, Optional
from datetime import datetime
import csv
import json
from io import StringIO
from fastapi import APIRouter, Depends, HTTPException, Query, Body, Response
from sqlalchemy.orm import Session

from backend.database.config.config import get_db
from backend.service.transaction_service_db import TransactionServiceDB
from backend.api.models import (
    TransactionResponse, TransactionCreate, TransactionUpdate,
    TransactionFilter, TransactionImport
)

router = APIRouter(prefix="/api/transactions", tags=["transactions"])

@router.get("/categories", response_model=List[str])
async def get_categories(db: Session = Depends(get_db)):
    """
    Get all unique transaction categories.

    Args:
        db (Session): The database session.

    Returns:
        List[str]: A list of unique categories.
    """
    transaction_service = TransactionServiceDB(db)
    return transaction_service.get_categories()

@router.get("/", response_model=List[TransactionResponse])
async def get_transactions(
    account_id: Optional[str] = Query(None, description="Filter by account ID"),
    category: Optional[str] = Query(None, description="Filter by category"),
    start_date: Optional[str] = Query(None, description="Filter by start date (ISO format)"),
    end_date: Optional[str] = Query(None, description="Filter by end date (ISO format)"),
    min_amount: Optional[float] = Query(None, description="Filter by minimum amount"),
    max_amount: Optional[float] = Query(None, description="Filter by maximum amount"),
    is_reconciled: Optional[bool] = Query(None, description="Filter by reconciliation status"),
    db: Session = Depends(get_db)
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
        db (Session): The database session.

    Returns:
        List[TransactionResponse]: A list of transactions.
    """
    transaction_service = TransactionServiceDB(db)

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

    return transaction_service.get_filtered_transactions(filters)

@router.get("/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(transaction_id: str, db: Session = Depends(get_db)):
    """
    Get a transaction by its ID.

    Args:
        transaction_id (str): The ID of the transaction to retrieve.
        db (Session): The database session.

    Returns:
        TransactionResponse: The transaction.

    Raises:
        HTTPException: If the transaction is not found.
    """
    transaction_service = TransactionServiceDB(db)
    transaction = transaction_service.get_transaction_by_id(transaction_id)

    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    return transaction

@router.get("/account/{account_id}", response_model=List[TransactionResponse])
async def get_transactions_by_account(account_id: str, db: Session = Depends(get_db)):
    """
    Get all transactions for a specific account.

    Args:
        account_id (str): The ID of the account to get transactions for.
        db (Session): The database session.

    Returns:
        List[TransactionResponse]: A list of transactions for the specified account.
    """
    transaction_service = TransactionServiceDB(db)
    return transaction_service.get_transactions_by_account(account_id)

@router.post("/", response_model=TransactionResponse, status_code=201)
async def create_transaction(transaction: TransactionCreate, db: Session = Depends(get_db)):
    """
    Create a new transaction.

    Args:
        transaction (TransactionCreate): The transaction data.
        db (Session): The database session.

    Returns:
        TransactionResponse: The created transaction.
    """
    transaction_service = TransactionServiceDB(db)
    return transaction_service.add_transaction(transaction.model_dump())

@router.put("/{transaction_id}", response_model=TransactionResponse)
async def update_transaction(transaction_id: str, transaction_data: TransactionUpdate, db: Session = Depends(get_db)):
    """
    Update an existing transaction.

    Args:
        transaction_id (str): The ID of the transaction to update.
        transaction_data (TransactionUpdate): The new transaction data.
        db (Session): The database session.

    Returns:
        TransactionResponse: The updated transaction.

    Raises:
        HTTPException: If the transaction is not found.
    """
    transaction_service = TransactionServiceDB(db)

    # Filter out None values
    update_data = {k: v for k, v in transaction_data.model_dump().items() if v is not None}

    updated_transaction = transaction_service.update_transaction(transaction_id, update_data)

    if not updated_transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    return updated_transaction

@router.delete("/{transaction_id}", status_code=204)
async def delete_transaction(transaction_id: str, db: Session = Depends(get_db)):
    """
    Delete a transaction.

    Args:
        transaction_id (str): The ID of the transaction to delete.
        db (Session): The database session.

    Raises:
        HTTPException: If the transaction is not found.
    """
    transaction_service = TransactionServiceDB(db)
    success = transaction_service.delete_transaction(transaction_id)

    if not success:
        raise HTTPException(status_code=404, detail="Transaction not found")

@router.post("/import", response_model=List[TransactionResponse], status_code=201)
async def import_transactions(import_data: TransactionImport, db: Session = Depends(get_db)):
    """
    Import multiple transactions for an account.

    Args:
        import_data (TransactionImport): The import data containing account ID and transactions.
        db (Session): The database session.

    Returns:
        List[TransactionResponse]: The list of imported transactions.
    """
    transaction_service = TransactionServiceDB(db)

    # Convert each transaction to a dict
    transactions = [t.model_dump() for t in import_data.transactions]

    # Import the transactions
    return transaction_service.import_transactions(import_data.account_id, transactions)

@router.post("/search", response_model=List[TransactionResponse])
async def search_transactions(query: str = Body(..., embed=True), db: Session = Depends(get_db)):
    """
    Search for transactions by payee, category, or description.

    Args:
        query (str): The search query.
        db (Session): The database session.

    Returns:
        List[TransactionResponse]: A list of transactions matching the query.
    """
    transaction_service = TransactionServiceDB(db)
    return transaction_service.search_transactions(query)

@router.get("/export")
async def export_transactions(
    format: str = Query("csv", description="Export format: csv or json"),
    account_id: Optional[str] = Query(None, description="Filter by account ID"),
    category: Optional[str] = Query(None, description="Filter by category"),
    start_date: Optional[str] = Query(None, description="Filter by start date (ISO format)"),
    end_date: Optional[str] = Query(None, description="Filter by end date (ISO format)"),
    min_amount: Optional[float] = Query(None, description="Filter by minimum amount"),
    max_amount: Optional[float] = Query(None, description="Filter by maximum amount"),
    is_reconciled: Optional[bool] = Query(None, description="Filter by reconciliation status"),
    db: Session = Depends(get_db)
):
    """
    Export transactions in CSV or JSON format, optionally filtered by various criteria.

    Args:
        format (str): The export format (csv or json).
        account_id (Optional[str]): Filter by account ID.
        category (Optional[str]): Filter by category.
        start_date (Optional[str]): Filter by start date (ISO format).
        end_date (Optional[str]): Filter by end date (ISO format).
        min_amount (Optional[float]): Filter by minimum amount.
        max_amount (Optional[float]): Filter by maximum amount.
        is_reconciled (Optional[bool]): Filter by reconciliation status.
        db (Session): The database session.

    Returns:
        Response: A file download response with the exported data.
    """
    transaction_service = TransactionServiceDB(db)

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

    # Get transactions based on filters
    transactions = transaction_service.get_filtered_transactions(filters)

    # Generate filename with current date
    current_date = datetime.now().strftime("%Y%m%d")
    filename = f"transactions_{current_date}"

    # Export based on format
    if format.lower() == "json":
        # Convert transactions to JSON
        transactions_data = [t.dict() if hasattr(t, "dict") else t for t in transactions]
        json_data = json.dumps(transactions_data, indent=2, default=str)

        # Return JSON response
        return Response(
            content=json_data,
            media_type="application/json",
            headers={
                "Content-Disposition": f"attachment; filename={filename}.json"
            }
        )
    else:  # Default to CSV
        # Create CSV in memory
        output = StringIO()
        writer = csv.writer(output)

        # Write header row
        writer.writerow(["id", "account_id", "account_name", "date", "amount",
                       "payee", "category", "description", "is_reconciled"])

        # Write data rows
        for transaction in transactions:
            t = transaction.dict() if hasattr(transaction, "dict") else transaction
            writer.writerow([
                t.get("id", ""),
                t.get("account_id", ""),
                t.get("account_name", ""),
                t.get("date", ""),
                t.get("amount", ""),
                t.get("payee", ""),
                t.get("category", ""),
                t.get("description", ""),
                t.get("is_reconciled", "")
            ])

        # Return CSV response
        return Response(
            content=output.getvalue(),
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename={filename}.csv"
            }
        )

