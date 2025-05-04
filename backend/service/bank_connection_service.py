"""
Bank Connection Service Module

This module provides services for managing bank connections in the WealthTrackr application.
"""
from typing import List, Dict, Optional, Any
from datetime import datetime, timezone, timedelta
import uuid
import json
import os
from sqlalchemy.orm import Session

from backend.database.repositories.bank_connection_repository import BankConnectionRepository
from backend.database.repositories.account_repository import AccountRepository
from backend.database.models.bank_connection import BankConnectionAccount

class BankConnectionService:
    """Service for bank connection operations."""

    def __init__(self, db: Session):
        """
        Initialize the service with a database session.

        Args:
            db (Session): The database session.
        """
        self.db = db
        self.bank_connection_repository = BankConnectionRepository(db)
        self.account_repository = AccountRepository(db)

    def get_all_connections(self) -> List[Dict[str, Any]]:
        """
        Get all bank connections.

        Returns:
            List[Dict[str, Any]]: A list of all bank connections.
        """
        connections = self.bank_connection_repository.get_all_connections()
        result = []

        for connection in connections:
            # Get the institution details
            institution = connection.institution

            # Get the linked accounts
            connection_accounts = self.bank_connection_repository.get_connection_accounts(connection.id)
            account_ids = [ca.account_id for ca in connection_accounts]

            # Format the response
            result.append({
                "id": connection.id,
                "institution_id": connection.institution_id,
                "status": connection.status,
                "last_sync_at": connection.last_sync_at.isoformat() if connection.last_sync_at else None,
                "error_message": connection.error_message,
                "created_at": connection.created_at.isoformat(),
                "updated_at": connection.updated_at.isoformat(),
                "institution": {
                    "id": institution.id,
                    "name": institution.name
                },
                "connected_accounts": account_ids
            })

        return result

    def get_connection_by_id(self, connection_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a bank connection by ID.

        Args:
            connection_id (str): The ID of the bank connection.

        Returns:
            Optional[Dict[str, Any]]: The bank connection if found, None otherwise.
        """
        connection = self.bank_connection_repository.get_connection_by_id(connection_id)
        if not connection:
            return None

        # Get the institution details
        institution = connection.institution

        # Get the linked accounts
        connection_accounts = self.bank_connection_repository.get_connection_accounts(connection.id)
        account_ids = [ca.account_id for ca in connection_accounts]

        # Format the response
        return {
            "id": connection.id,
            "institution_id": connection.institution_id,
            "status": connection.status,
            "last_sync_at": connection.last_sync_at.isoformat() if connection.last_sync_at else None,
            "error_message": connection.error_message,
            "created_at": connection.created_at.isoformat(),
            "updated_at": connection.updated_at.isoformat(),
            "institution": {
                "id": institution.id,
                "name": institution.name
            },
            "connected_accounts": account_ids
        }

    def create_connection(self, public_token: str, institution_id: str) -> Dict[str, Any]:
        """
        Create a new bank connection using a public token from Plaid.

        Args:
            public_token (str): The public token from Plaid.
            institution_id (str): The ID of the institution.

        Returns:
            Dict[str, Any]: The created bank connection.
        """
        # In a real implementation, we would exchange the public token for an access token
        # using the Plaid API. For now, we'll simulate this with a mock response.

        # Mock exchange token response
        access_token = f"access-token-{uuid.uuid4().hex[:16]}"
        item_id = f"item-{uuid.uuid4().hex[:16]}"

        # Create the connection in the database
        connection_data = {
            "institution_id": institution_id,
            "access_token": access_token,
            "item_id": item_id,
            "status": "active"
        }

        connection = self.bank_connection_repository.create_connection(connection_data)

        # Get the institution details
        institution = connection.institution

        # Format the response
        return {
            "id": connection.id,
            "institution_id": connection.institution_id,
            "status": connection.status,
            "last_sync_at": connection.last_sync_at.isoformat() if connection.last_sync_at else None,
            "error_message": connection.error_message,
            "created_at": connection.created_at.isoformat(),
            "updated_at": connection.updated_at.isoformat(),
            "institution": {
                "id": institution.id,
                "name": institution.name
            },
            "connected_accounts": []
        }

    def update_connection(self, connection_id: str, connection_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Update a bank connection.

        Args:
            connection_id (str): The ID of the bank connection to update.
            connection_data (Dict[str, Any]): The updated bank connection data.

        Returns:
            Optional[Dict[str, Any]]: The updated bank connection if found, None otherwise.
        """
        connection = self.bank_connection_repository.update_connection(connection_id, connection_data)
        if not connection:
            return None

        # Get the institution details
        institution = connection.institution

        # Get the linked accounts
        connection_accounts = self.bank_connection_repository.get_connection_accounts(connection.id)
        account_ids = [ca.account_id for ca in connection_accounts]

        # Format the response
        return {
            "id": connection.id,
            "institution_id": connection.institution_id,
            "status": connection.status,
            "last_sync_at": connection.last_sync_at.isoformat() if connection.last_sync_at else None,
            "error_message": connection.error_message,
            "created_at": connection.created_at.isoformat(),
            "updated_at": connection.updated_at.isoformat(),
            "institution": {
                "id": institution.id,
                "name": institution.name
            },
            "connected_accounts": account_ids
        }

    def delete_connection(self, connection_id: str) -> bool:
        """
        Delete a bank connection.

        Args:
            connection_id (str): The ID of the bank connection to delete.

        Returns:
            bool: True if the connection was deleted, False otherwise.
        """
        # In a real implementation, we would also need to invalidate the access token
        # with the Plaid API. For now, we'll just delete the connection from the database.
        return self.bank_connection_repository.delete_connection(connection_id)

    def link_account_to_connection(self, bank_connection_id: str, account_id: str, external_account_id: str) -> Dict[str, Any]:
        """
        Link an account to a bank connection.

        Args:
            bank_connection_id (str): The ID of the bank connection.
            account_id (str): The ID of the account.
            external_account_id (str): The external account ID from the bank.

        Returns:
            Dict[str, Any]: The created bank connection account link.
        """
        link_data = {
            "bank_connection_id": bank_connection_id,
            "account_id": account_id,
            "external_account_id": external_account_id
        }

        link = self.bank_connection_repository.link_account_to_connection(link_data)

        # Format the response
        return {
            "id": link.id,
            "bank_connection_id": link.bank_connection_id,
            "account_id": link.account_id,
            "external_account_id": link.external_account_id,
            "last_sync_at": link.last_sync_at.isoformat() if link.last_sync_at else None,
            "created_at": link.created_at.isoformat(),
            "updated_at": link.updated_at.isoformat()
        }

    def unlink_account_from_connection(self, bank_connection_id: str, account_id: str) -> bool:
        """
        Unlink an account from a bank connection.

        Args:
            bank_connection_id (str): The ID of the bank connection.
            account_id (str): The ID of the account.

        Returns:
            bool: True if the account was unlinked, False otherwise.
        """
        return self.bank_connection_repository.unlink_account_from_connection(bank_connection_id, account_id)

    def sync_account_transactions(self, bank_connection_id: str, account_id: str) -> Dict[str, Any]:
        """
        Sync transactions for an account from the bank.

        Args:
            bank_connection_id (str): The ID of the bank connection.
            account_id (str): The ID of the account.

        Returns:
            Dict[str, Any]: The sync result.
        """
        # In a real implementation, we would use the Plaid API to fetch transactions
        # for the account. For now, we'll simulate this with mock data.

        # Get the connection and account
        connection = self.bank_connection_repository.get_connection_by_id(bank_connection_id)
        account = self.account_repository.get_account_by_id(account_id)

        if not connection or not account:
            return {
                "success": False,
                "message": "Connection or account not found"
            }

        # Update the last sync time
        now = datetime.now(timezone.utc)

        # Update the connection account link
        link = self.db.query(BankConnectionAccount).filter(
            BankConnectionAccount.bank_connection_id == bank_connection_id,
            BankConnectionAccount.account_id == account_id
        ).first()

        if link:
            link.last_sync_at = now
            self.db.commit()

        # In a real implementation, we would create transactions based on the data
        # from the bank. For now, we'll just return a success message.
        return {
            "success": True,
            "message": "Transactions synced successfully",
            "last_sync_at": now.isoformat()
        }

    def get_plaid_link_token(self) -> Dict[str, Any]:
        """
        Get a link token from Plaid for initializing Plaid Link.

        Returns:
            Dict[str, Any]: The link token response.
        """
        # In a real implementation, we would use the Plaid API to create a link token.
        # For now, we'll simulate this with a mock response.
        return {
            "link_token": f"link-sandbox-{uuid.uuid4().hex}",
            "expiration": (datetime.now(timezone.utc) + timedelta(minutes=30)).isoformat()
        }
