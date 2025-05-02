"""
Reports Router Module

This module provides API endpoints for generating financial reports and dashboards.
"""
from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.database.config.config import get_db
from backend.service.reports_service import ReportsService
from backend.api.models import NetWorthHistoryResponse, SpendingByCategoryResponse, MonthlySummaryResponse

router = APIRouter(prefix="/api/reports", tags=["reports"])

@router.get("/net-worth-history", response_model=List[NetWorthHistoryResponse])
async def get_net_worth_history(
    start_date: Optional[str] = Query(None, description="Start date (ISO format)"),
    end_date: Optional[str] = Query(None, description="End date (ISO format)"),
    interval: str = Query("month", description="Interval: day, week, month, or year"),
    db: Session = Depends(get_db)
):
    """
    Get net worth history over time.

    Args:
        start_date (Optional[str]): Start date in ISO format.
        end_date (Optional[str]): End date in ISO format.
        interval (str): Interval for data points (day, week, month, or year).
        db (Session): The database session.

    Returns:
        List[NetWorthHistoryResponse]: A list of net worth data points over time.
    """
    reports_service = ReportsService(db)
    
    # Set default date range if not provided
    if not end_date:
        end_date = datetime.now().isoformat()
    
    if not start_date:
        # Default to 1 year ago if not specified
        start_date = (datetime.fromisoformat(end_date.split('T')[0]) - timedelta(days=365)).isoformat()
    
    return reports_service.get_net_worth_history(start_date, end_date, interval)

@router.get("/spending-by-category", response_model=List[SpendingByCategoryResponse])
async def get_spending_by_category(
    start_date: Optional[str] = Query(None, description="Start date (ISO format)"),
    end_date: Optional[str] = Query(None, description="End date (ISO format)"),
    account_id: Optional[str] = Query(None, description="Filter by account ID"),
    db: Session = Depends(get_db)
):
    """
    Get spending breakdown by category.

    Args:
        start_date (Optional[str]): Start date in ISO format.
        end_date (Optional[str]): End date in ISO format.
        account_id (Optional[str]): Account ID to filter by.
        db (Session): The database session.

    Returns:
        List[SpendingByCategoryResponse]: A list of spending amounts by category.
    """
    reports_service = ReportsService(db)
    
    # Set default date range if not provided
    if not end_date:
        end_date = datetime.now().isoformat()
    
    if not start_date:
        # Default to 1 month ago if not specified
        start_date = (datetime.fromisoformat(end_date.split('T')[0]) - timedelta(days=30)).isoformat()
    
    return reports_service.get_spending_by_category(start_date, end_date, account_id)

@router.get("/monthly-summary", response_model=MonthlySummaryResponse)
async def get_monthly_summary(
    year: int = Query(..., description="Year for the summary"),
    month: int = Query(..., description="Month for the summary (1-12)"),
    account_id: Optional[str] = Query(None, description="Filter by account ID"),
    db: Session = Depends(get_db)
):
    """
    Get monthly summary report.

    Args:
        year (int): Year for the summary.
        month (int): Month for the summary (1-12).
        account_id (Optional[str]): Account ID to filter by.
        db (Session): The database session.

    Returns:
        MonthlySummaryResponse: Monthly summary data.
    """
    reports_service = ReportsService(db)
    return reports_service.get_monthly_summary(year, month, account_id)
