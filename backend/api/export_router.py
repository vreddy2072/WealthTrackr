"""
Export Router Module

This module provides API endpoints for exporting data from the WealthTrackr application.
"""
from typing import List, Optional
from datetime import datetime
import csv
import json
from io import StringIO
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session

from backend.database.config.config import get_db
from backend.service.transaction_service_db import TransactionServiceDB

router = APIRouter(prefix="/api/export", tags=["export"])

@router.get("/transactions", include_in_schema=True)
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
