"""
Account Models Module

This module defines the SQLAlchemy ORM models for account-related entities.
"""
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from backend.database.config.config import Base

class AccountType(Base):
    """Model for account types."""
    __tablename__ = "account_types"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)

    # Relationships
    accounts = relationship("Account", back_populates="account_type")

    def __repr__(self):
        return f"<AccountType(id='{self.id}', name='{self.name}')>"


class Institution(Base):
    """Model for financial institutions."""
    __tablename__ = "institutions"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)

    # Relationships
    accounts = relationship("Account", back_populates="institution")

    def __repr__(self):
        return f"<Institution(id='{self.id}', name='{self.name}')>"


class Account(Base):
    """Model for financial accounts."""
    __tablename__ = "accounts"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type_id = Column(String, ForeignKey("account_types.id"), nullable=False)
    institution_id = Column(String, ForeignKey("institutions.id"), nullable=False)
    balance = Column(Float, nullable=False, default=0.0)
    currency = Column(String, nullable=False, default="USD")
    is_active = Column(Boolean, nullable=False, default=True)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    account_type = relationship("AccountType", back_populates="accounts")
    institution = relationship("Institution", back_populates="accounts")
    transactions = relationship("Transaction", back_populates="account", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Account(id='{self.id}', name='{self.name}', type='{self.type_id}', balance={self.balance})>"
