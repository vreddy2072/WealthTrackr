"""
Transaction Models Module

This module defines the SQLAlchemy ORM models for transaction-related entities.
"""
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from backend.database.config.config import Base

class Transaction(Base):
    """Model for financial transactions."""
    __tablename__ = "transactions"

    id = Column(String, primary_key=True, index=True)
    account_id = Column(String, ForeignKey("accounts.id"), nullable=False)
    date = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    amount = Column(Float, nullable=False)
    payee = Column(String, nullable=True)
    description = Column(String, nullable=False)
    category = Column(String, nullable=True)
    is_income = Column(Boolean, nullable=False, default=False)
    is_reconciled = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    account = relationship("Account", back_populates="transactions")

    def __repr__(self):
        return f"<Transaction(id='{self.id}', account_id='{self.account_id}', amount={self.amount}, description='{self.description}')>"
