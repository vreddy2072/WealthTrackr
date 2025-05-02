"""
API Models Module

This module defines the Pydantic models for API requests and responses.
"""
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

class AccountTypeResponse(BaseModel):
    """Model for account type response."""
    id: str
    name: str

class InstitutionResponse(BaseModel):
    """Model for institution response."""
    id: str
    name: str

class AccountBase(BaseModel):
    """Base model for account data."""
    name: str
    type: str
    institution: str
    balance: float = 0.0
    currency: str = "USD"
    notes: Optional[str] = None

class AccountCreate(AccountBase):
    """Model for creating a new account."""
    pass

class AccountUpdate(BaseModel):
    """Model for updating an account."""
    name: Optional[str] = None
    type: Optional[str] = None
    institution: Optional[str] = None
    balance: Optional[float] = None
    currency: Optional[str] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None

class AccountResponse(AccountBase):
    """Model for account response."""
    id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic model configuration."""
        from_attributes = True


class TransactionBase(BaseModel):
    """Base model for transaction data."""
    account_id: str
    date: datetime
    amount: float
    payee: str
    category: str
    description: Optional[str] = None
    is_reconciled: bool = False


class TransactionCreate(TransactionBase):
    """Model for creating a new transaction."""
    pass


class TransactionUpdate(BaseModel):
    """Model for updating a transaction."""
    account_id: Optional[str] = None
    date: Optional[datetime] = None
    amount: Optional[float] = None
    payee: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    is_reconciled: Optional[bool] = None


class TransactionResponse(TransactionBase):
    """Model for transaction response."""
    id: str
    account_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic model configuration."""
        from_attributes = True


class TransactionFilter(BaseModel):
    """Model for filtering transactions."""
    account_id: Optional[str] = None
    category: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    min_amount: Optional[float] = None
    max_amount: Optional[float] = None
    is_reconciled: Optional[bool] = None


class TransactionImport(BaseModel):
    """Model for importing transactions."""
    account_id: str
    transactions: List[TransactionCreate]


class NetWorthHistoryResponse(BaseModel):
    """Model for net worth history data point."""
    date: datetime
    net_worth: float


class SpendingByCategoryResponse(BaseModel):
    """Model for spending by category data point."""
    category: str
    amount: float
    percentage: float


class MonthlySummaryResponse(BaseModel):
    """Model for monthly summary report."""
    year: int
    month: int
    income: float
    expenses: float
    net_change: float
    top_income_categories: List[SpendingByCategoryResponse]
    top_expense_categories: List[SpendingByCategoryResponse]
