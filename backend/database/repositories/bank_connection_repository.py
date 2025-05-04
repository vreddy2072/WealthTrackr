"""
Bank Connection Repository Module

This module provides database operations for bank connections.
"""
from typing import List, Dict, Optional, Any
from datetime import datetime, timezone
import uuid
from sqlalchemy.orm import Session
from sqlalchemy import and_

from backend.database.models.bank_connection import BankConnection, BankConnectionAccount
from backend.database.models.account import Account

class BankConnectionRepository:
    """Repository for bank connection operations."""

    def __init__(self, db: Session):
        """
        Initialize the repository with a database session.

        Args:
            db (Session): The database session.
        """
        self.db = db

    def get_all_connections(self) -> List[BankConnection]:
        """
        Get all bank connections.

        Returns:
            List[BankConnection]: A list of all bank connections.
        """
        return self.db.query(BankConnection).all()

    def get_connection_by_id(self, connection_id: str) -> Optional[BankConnection]:
        """
        Get a bank connection by ID.

        Args:
            connection_id (str): The ID of the bank connection.

        Returns:
            Optional[BankConnection]: The bank connection if found, None otherwise.
        """
        return self.db.query(BankConnection).filter(BankConnection.id == connection_id).first()

    def get_connections_by_institution(self, institution_id: str) -> List[BankConnection]:
        """
        Get bank connections by institution ID.

        Args:
            institution_id (str): The ID of the institution.

        Returns:
            List[BankConnection]: A list of bank connections for the institution.
        """
        return self.db.query(BankConnection).filter(BankConnection.institution_id == institution_id).all()

    def create_connection(self, connection_data: Dict[str, Any]) -> BankConnection:
        """
        Create a new bank connection.

        Args:
            connection_data (Dict[str, Any]): The bank connection data.

        Returns:
            BankConnection: The created bank connection.
        """
        # Generate a unique ID for the new connection
        new_id = f"conn-{uuid.uuid4().hex[:8]}"

        # Create the new bank connection
        new_connection = BankConnection(
            id=new_id,
            institution_id=connection_data.get("institution_id"),
            access_token=connection_data.get("access_token"),
            item_id=connection_data.get("item_id"),
            status=connection_data.get("status", "active"),
            error_message=connection_data.get("error_message"),
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )

        self.db.add(new_connection)
        self.db.commit()
        self.db.refresh(new_connection)

        return new_connection

    def update_connection(self, connection_id: str, connection_data: Dict[str, Any]) -> Optional[BankConnection]:
        """
        Update a bank connection.

        Args:
            connection_id (str): The ID of the bank connection to update.
            connection_data (Dict[str, Any]): The updated bank connection data.

        Returns:
            Optional[BankConnection]: The updated bank connection if found, None otherwise.
        """
        connection = self.get_connection_by_id(connection_id)
        if not connection:
            return None

        # Update fields if provided
        if "status" in connection_data:
            connection.status = connection_data["status"]
        if "error_message" in connection_data:
            connection.error_message = connection_data["error_message"]
        if "last_sync_at" in connection_data:
            connection.last_sync_at = connection_data["last_sync_at"]

        connection.updated_at = datetime.now(timezone.utc)

        self.db.commit()
        self.db.refresh(connection)

        return connection

    def delete_connection(self, connection_id: str) -> bool:
        """
        Delete a bank connection.

        Args:
            connection_id (str): The ID of the bank connection to delete.

        Returns:
            bool: True if the connection was deleted, False otherwise.
        """
        connection = self.get_connection_by_id(connection_id)
        if not connection:
            return False

        self.db.delete(connection)
        self.db.commit()

        return True

    def get_connection_accounts(self, connection_id: str) -> List[BankConnectionAccount]:
        """
        Get all accounts linked to a bank connection.

        Args:
            connection_id (str): The ID of the bank connection.

        Returns:
            List[BankConnectionAccount]: A list of bank connection accounts.
        """
        return self.db.query(BankConnectionAccount).filter(
            BankConnectionAccount.bank_connection_id == connection_id
        ).all()

    def link_account_to_connection(self, link_data: Dict[str, Any]) -> BankConnectionAccount:
        """
        Link an account to a bank connection.

        Args:
            link_data (Dict[str, Any]): The link data.

        Returns:
            BankConnectionAccount: The created bank connection account link.
        """
        # Generate a unique ID for the new link
        new_id = f"link-{uuid.uuid4().hex[:8]}"

        # Create the new bank connection account link
        new_link = BankConnectionAccount(
            id=new_id,
            bank_connection_id=link_data.get("bank_connection_id"),
            account_id=link_data.get("account_id"),
            external_account_id=link_data.get("external_account_id"),
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )

        self.db.add(new_link)

        # Update the account's updated_at timestamp
        account = self.db.query(Account).filter(Account.id == link_data.get("account_id")).first()
        if account:
            account.updated_at = datetime.now(timezone.utc)

        self.db.commit()
        self.db.refresh(new_link)

        return new_link

    def unlink_account_from_connection(self, bank_connection_id: str, account_id: str) -> bool:
        """
        Unlink an account from a bank connection.

        Args:
            bank_connection_id (str): The ID of the bank connection.
            account_id (str): The ID of the account.

        Returns:
            bool: True if the account was unlinked, False otherwise.
        """
        link = self.db.query(BankConnectionAccount).filter(
            and_(
                BankConnectionAccount.bank_connection_id == bank_connection_id,
                BankConnectionAccount.account_id == account_id
            )
        ).first()

        if not link:
            return False

        self.db.delete(link)

        # No need to check for other connections anymore

        # Update the account's updated_at timestamp
        account = self.db.query(Account).filter(Account.id == account_id).first()
        if account:
            account.updated_at = datetime.now(timezone.utc)

        self.db.commit()

        return True
