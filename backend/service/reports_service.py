"""
Reports Service Module

This module provides services for generating financial reports and dashboards.
"""
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from collections import defaultdict

from backend.database.repositories.transaction_repository import TransactionRepository
from backend.database.repositories.account_repository import AccountRepository
# Import repositories only, we don't need the models directly

class ReportsService:
    """Service for generating financial reports and dashboards."""

    def __init__(self, db: Session):
        """
        Initialize the reports service with a database session.

        Args:
            db (Session): The database session.
        """
        self.db = db
        self.transaction_repository = TransactionRepository(db)
        self.account_repository = AccountRepository(db)

    def get_net_worth_history(self, start_date: str, end_date: str, interval: str = "month") -> List[Dict[str, Any]]:
        """
        Get net worth history over time.

        Args:
            start_date (str): Start date in ISO format.
            end_date (str): End date in ISO format.
            interval (str): Interval for data points (day, week, month, or year).

        Returns:
            List[Dict[str, Any]]: A list of net worth data points over time.
        """
        # For now, we'll generate dummy data
        # In a real implementation, this would query the database for historical balances

        try:
            start = datetime.fromisoformat(start_date.split('T')[0])
        except (ValueError, TypeError):
            start = datetime.now() - timedelta(days=365)

        try:
            end = datetime.fromisoformat(end_date.split('T')[0])
        except (ValueError, TypeError):
            end = datetime.now()

        # Get current net worth
        current_net_worth = self.account_repository.get_net_worth()

        # Generate data points based on interval
        data_points = []
        current_date = start

        # Determine the time delta based on the interval
        if interval == "day":
            delta = timedelta(days=1)
        elif interval == "week":
            delta = timedelta(weeks=1)
        elif interval == "year":
            delta = timedelta(days=365)
        else:  # Default to month
            delta = timedelta(days=30)

        # Generate dummy data points
        # In a real implementation, this would use actual historical data
        while current_date <= end:
            # Simulate some variation in net worth over time
            # This is just dummy data for demonstration
            days_ago = (end - current_date).days
            if days_ago == 0:
                net_worth = current_net_worth
            else:
                # Simulate a growth trend with some random variation
                net_worth = current_net_worth * (0.95 + (days_ago / 365) * 0.1)

            data_points.append({
                "date": current_date.isoformat(),
                "net_worth": round(net_worth, 2)
            })

            current_date += delta

        return data_points

    def get_spending_by_category(self, start_date: str, end_date: str, account_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Get spending breakdown by category.

        Args:
            start_date (str): Start date in ISO format.
            end_date (str): End date in ISO format.
            account_id (Optional[str]): Account ID to filter by.

        Returns:
            List[Dict[str, Any]]: A list of spending amounts by category.
        """
        # Get transactions within the date range
        try:
            # Parse dates for validation but use the original strings in the filter
            datetime.fromisoformat(start_date.split('T')[0])
            datetime.fromisoformat(end_date.split('T')[0])
        except (ValueError, TypeError):
            # Default to last 30 days if dates are invalid
            end_date = datetime.now().isoformat()
            start_date = (datetime.now() - timedelta(days=30)).isoformat()

        # Get transactions within the date range
        filters = {
            "start_date": start_date,
            "end_date": end_date
        }

        if account_id:
            filters["account_id"] = account_id

        transactions = self.transaction_repository.filter_transactions(filters)

        # Calculate spending by category
        category_totals = defaultdict(float)
        total_spending = 0

        for transaction in transactions:
            # Only include expenses (negative amounts)
            if transaction.amount < 0:
                amount = abs(transaction.amount)
                category = transaction.category or "Uncategorized"
                category_totals[category] += amount
                total_spending += amount

        # Convert to list of dictionaries with percentages
        result = []
        for category, amount in category_totals.items():
            percentage = (amount / total_spending * 100) if total_spending > 0 else 0
            result.append({
                "category": category,
                "amount": round(amount, 2),
                "percentage": round(percentage, 2)
            })

        # Sort by amount descending
        result.sort(key=lambda x: x["amount"], reverse=True)

        return result

    def get_monthly_summary(self, year: int, month: int, account_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Get monthly summary report.

        Args:
            year (int): Year for the summary.
            month (int): Month for the summary (1-12).
            account_id (Optional[str]): Account ID to filter by.

        Returns:
            Dict[str, Any]: Monthly summary data.
        """
        try:
            # Calculate start and end dates for the month
            start_date = datetime(year, month, 1)
            if month == 12:
                end_date = datetime(year + 1, 1, 1) - timedelta(days=1)
            else:
                end_date = datetime(year, month + 1, 1) - timedelta(days=1)

            # Get transactions for the month
            filters = {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat()
            }

            if account_id:
                filters["account_id"] = account_id

            transactions = self.transaction_repository.filter_transactions(filters)

            # Calculate income and expenses
            income = 0
            expenses = 0
            income_by_category = defaultdict(float)
            expenses_by_category = defaultdict(float)

            for transaction in transactions:
                if transaction.amount > 0:
                    income += transaction.amount
                    category = transaction.category or "Uncategorized"
                    income_by_category[category] += transaction.amount
                else:
                    expenses += abs(transaction.amount)
                    category = transaction.category or "Uncategorized"
                    expenses_by_category[category] += abs(transaction.amount)

            # Calculate net change
            net_change = income - expenses

            # Prepare top categories
            top_income_categories = []
            for category, amount in income_by_category.items():
                percentage = (amount / income * 100) if income > 0 else 0
                top_income_categories.append({
                    "category": category,
                    "amount": round(amount, 2),
                    "percentage": round(percentage, 2)
                })

            top_expense_categories = []
            for category, amount in expenses_by_category.items():
                percentage = (amount / expenses * 100) if expenses > 0 else 0
                top_expense_categories.append({
                    "category": category,
                    "amount": round(amount, 2),
                    "percentage": round(percentage, 2)
                })

            # Sort categories by amount
            top_income_categories.sort(key=lambda x: x["amount"], reverse=True)
            top_expense_categories.sort(key=lambda x: x["amount"], reverse=True)

            # Limit to top 5 categories
            top_income_categories = top_income_categories[:5]
            top_expense_categories = top_expense_categories[:5]

            return {
                "year": year,
                "month": month,
                "income": round(income, 2),
                "expenses": round(expenses, 2),
                "net_change": round(net_change, 2),
                "top_income_categories": top_income_categories,
                "top_expense_categories": top_expense_categories
            }
        except Exception as e:
            # Return empty data with default values in case of error
            print(f"Error generating monthly summary: {e}")
            return {
                "year": year,
                "month": month,
                "income": 0,
                "expenses": 0,
                "net_change": 0,
                "top_income_categories": [],
                "top_expense_categories": []
            }
