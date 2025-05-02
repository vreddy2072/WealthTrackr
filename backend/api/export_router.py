"""
Export Router Module

This module provides API endpoints for exporting data from the WealthTrackr application.
"""
from typing import Optional
from datetime import datetime, timedelta
import csv
import json
import traceback
from io import StringIO
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session

from backend.database.config.config import get_db
from backend.service.transaction_service_db import TransactionServiceDB
from backend.service.reports_service import ReportsService

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

@router.get("/report", include_in_schema=True)
async def export_report(
    format: str = Query("csv", description="Export format: csv or json"),
    report_type: str = Query(..., description="Report type: net-worth, spending, or monthly"),
    start_date: Optional[str] = Query(None, description="Start date (ISO format)"),
    end_date: Optional[str] = Query(None, description="End date (ISO format)"),
    year: Optional[int] = Query(None, description="Year for monthly report"),
    month: Optional[int] = Query(None, description="Month for monthly report (1-12)"),
    account_id: Optional[str] = Query(None, description="Filter by account ID"),
    interval: str = Query("month", description="Interval for net worth: day, week, month, or year"),
    db: Session = Depends(get_db)
):
    """
    Export financial reports in CSV or JSON format.

    Args:
        format (str): The export format (csv or json).
        report_type (str): The type of report (net-worth, spending, or monthly).
        start_date (Optional[str]): Start date in ISO format.
        end_date (Optional[str]): End date in ISO format.
        year (Optional[int]): Year for monthly report.
        month (Optional[int]): Month for monthly report (1-12).
        account_id (Optional[str]): Filter by account ID.
        interval (str): Interval for net worth data points.
        db (Session): The database session.

    Returns:
        Response: A file download response with the exported data.
    """
    try:
        reports_service = ReportsService(db)

        # Generate filename with current date
        current_date = datetime.now().strftime("%Y%m%d")
        filename = f"{report_type}_report_{current_date}"

        # Get report data based on report type
        if report_type == "net-worth":
            # Set default date range if not provided
            if not end_date:
                end_date = datetime.now().isoformat()

            if not start_date:
                # Default to 1 year ago if not specified
                start_date = (datetime.fromisoformat(end_date.split('T')[0]) - timedelta(days=365)).isoformat()

            data = reports_service.get_net_worth_history(start_date, end_date, interval)

            # Export based on format
            if format.lower() == "json":
                # Convert data to JSON
                json_data = json.dumps(data, indent=2, default=str)

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
                writer.writerow(["date", "net_worth"])

                # Write data rows
                for item in data:
                    if isinstance(item, dict):
                        writer.writerow([
                            item.get("date", ""),
                            item.get("net_worth", "")
                        ])
                    else:  # Pydantic model
                        writer.writerow([
                            getattr(item, "date", ""),
                            getattr(item, "net_worth", "")
                        ])

                # Return CSV response
                return Response(
                    content=output.getvalue(),
                    media_type="text/csv",
                    headers={
                        "Content-Disposition": f"attachment; filename={filename}.csv"
                    }
                )

        elif report_type == "spending":
            # Set default date range if not provided
            if not end_date:
                end_date = datetime.now().isoformat()

            if not start_date:
                # Default to 1 month ago if not specified
                start_date = (datetime.fromisoformat(end_date.split('T')[0]) - timedelta(days=30)).isoformat()

            data = reports_service.get_spending_by_category(start_date, end_date, account_id)

            # Export based on format
            if format.lower() == "json":
                # Convert data to JSON
                json_data = json.dumps(data, indent=2, default=str)

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
                writer.writerow(["category", "amount", "percentage"])

                # Write data rows
                for item in data:
                    if isinstance(item, dict):
                        writer.writerow([
                            item.get("category", ""),
                            item.get("amount", ""),
                            item.get("percentage", "")
                        ])
                    else:  # Pydantic model
                        writer.writerow([
                            getattr(item, "category", ""),
                            getattr(item, "amount", ""),
                            getattr(item, "percentage", "")
                        ])

                # Return CSV response
                return Response(
                    content=output.getvalue(),
                    media_type="text/csv",
                    headers={
                        "Content-Disposition": f"attachment; filename={filename}.csv"
                    }
                )

        elif report_type == "monthly":
            # Use current year/month if not provided
            if not year or not month:
                current_date = datetime.now()
                year = year or current_date.year
                month = month or current_date.month

            print(f"Exporting monthly report for {year}-{month}")
            data = reports_service.get_monthly_summary(year, month, account_id)
            print(f"Monthly report data type: {type(data)}")
            print(f"Monthly report data: {data}")

            # The monthly summary data is already a dictionary
            # We'll use it directly for export

            # Check if data is a dictionary or a Pydantic model
            if isinstance(data, dict):
                # Data is already a dictionary
                export_data = data
                income_categories = data["top_income_categories"]
                expense_categories = data["top_expense_categories"]
            else:
                # Data is a Pydantic model, convert to dictionary
                income_categories = []
                for category in data.top_income_categories:
                    if hasattr(category, 'dict'):
                        income_categories.append(category.dict())
                    else:
                        income_categories.append({
                            "category": category.category,
                            "amount": category.amount,
                            "percentage": category.percentage
                        })

                expense_categories = []
                for category in data.top_expense_categories:
                    if hasattr(category, 'dict'):
                        expense_categories.append(category.dict())
                    else:
                        expense_categories.append({
                            "category": category.category,
                            "amount": category.amount,
                            "percentage": category.percentage
                        })

                export_data = {
                    "year": data.year,
                    "month": data.month,
                    "income": data.income,
                    "expenses": data.expenses,
                    "net_change": data.net_change,
                    "top_income_categories": income_categories,
                    "top_expense_categories": expense_categories
                }

            # For CSV export, we'll create separate sections
            if format.lower() == "csv":
                # Create CSV in memory
                output = StringIO()
                writer = csv.writer(output)

                # Write summary section
                writer.writerow(["Monthly Summary"])
                writer.writerow(["Year", "Month", "Income", "Expenses", "Net Change"])
                if isinstance(data, dict):
                    writer.writerow([data["year"], data["month"], data["income"], data["expenses"], data["net_change"]])
                else:
                    writer.writerow([data.year, data.month, data.income, data.expenses, data.net_change])
                writer.writerow([])

                # Write income categories section
                writer.writerow(["Top Income Categories"])
                writer.writerow(["Category", "Amount", "Percentage"])
                for category in income_categories:
                    writer.writerow([category.get("category", ""), category.get("amount", 0), category.get("percentage", 0)])
                writer.writerow([])

                # Write expense categories section
                writer.writerow(["Top Expense Categories"])
                writer.writerow(["Category", "Amount", "Percentage"])
                for category in expense_categories:
                    writer.writerow([category.get("category", ""), category.get("amount", 0), category.get("percentage", 0)])

                # Return CSV response
                return Response(
                    content=output.getvalue(),
                    media_type="text/csv",
                    headers={
                        "Content-Disposition": f"attachment; filename={filename}.csv"
                    }
                )
            else:  # JSON format
                # Convert data to JSON
                json_data = json.dumps(export_data, indent=2, default=str)

                # Return JSON response
                return Response(
                    content=json_data,
                    media_type="application/json",
                    headers={
                        "Content-Disposition": f"attachment; filename={filename}.json"
                    }
                )
        else:
            raise HTTPException(status_code=400, detail=f"Invalid report type: {report_type}")

    except Exception as e:
        error_details = traceback.format_exc()
        print(f"Error exporting report: {str(e)}\n{error_details}")
        raise HTTPException(status_code=500, detail=f"Error exporting report: {str(e)}")
