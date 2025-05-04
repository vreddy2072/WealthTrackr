"""
Bank Connection Models Module

This module defines the SQLAlchemy ORM models for bank connection-related entities.
"""
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from backend.database.config.config import Base

class BankConnection(Base):
    """Model for bank connections."""
    __tablename__ = "bank_connections"

    id = Column(String, primary_key=True, index=True)
    institution_id = Column(String, ForeignKey("institutions.id"), nullable=False)
    access_token = Column(String, nullable=False)
    item_id = Column(String, nullable=False)
    status = Column(String, nullable=False, default="active")
    last_sync_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    institution = relationship("Institution")
    connection_accounts = relationship("BankConnectionAccount", back_populates="bank_connection", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<BankConnection(id='{self.id}', institution_id='{self.institution_id}', status='{self.status}')>"


class BankConnectionAccount(Base):
    """Model for linking bank connections to accounts."""
    __tablename__ = "bank_connection_accounts"

    id = Column(String, primary_key=True, index=True)
    bank_connection_id = Column(String, ForeignKey("bank_connections.id", ondelete="CASCADE"), nullable=False)
    account_id = Column(String, ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False)
    external_account_id = Column(String, nullable=False)
    last_sync_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    bank_connection = relationship("BankConnection", back_populates="connection_accounts")
    account = relationship("Account")

    def __repr__(self):
        return f"<BankConnectionAccount(id='{self.id}', bank_connection_id='{self.bank_connection_id}', account_id='{self.account_id}')>"
