"""
Account Service Module (Database Version)

This module provides services for managing financial accounts in the WealthTrackr application,
using the database repository for persistence.
"""
from typing import List, Dict, Optional, Any
from sqlalchemy.orm import Session

from backend.database.repositories.account_repository import AccountRepository
from backend.database.models.account import Account, AccountType, Institution

class AccountServiceDB:
    """Service for managing financial accounts using database persistence."""

    def __init__(self, db: Session):
        """
        Initialize the account service with a database session.

        Args:
            db (Session): The database session.
        """
        self.repository = AccountRepository(db)

    def get_all_accounts(self) -> List[Dict[str, Any]]:
        """
        Get all accounts.

        Returns:
            List[Dict[str, Any]]: A list of all accounts.
        """
        accounts = self.repository.get_all_accounts()
        return [self._account_to_dict(account) for account in accounts]

    def get_account_by_id(self, account_id: str) -> Optional[Dict[str, Any]]:
        """
        Get an account by its ID.

        Args:
            account_id (str): The ID of the account to retrieve.

        Returns:
            Optional[Dict[str, Any]]: The account if found, None otherwise.
        """
        account = self.repository.get_account_by_id(account_id)
        if account:
            return self._account_to_dict(account)
        return None

    def get_accounts_by_type(self, account_type: str) -> List[Dict[str, Any]]:
        """
        Get all accounts of a specific type.

        Args:
            account_type (str): The type of accounts to retrieve.

        Returns:
            List[Dict[str, Any]]: A list of accounts of the specified type.
        """
        accounts = self.repository.get_accounts_by_type(account_type)
        return [self._account_to_dict(account) for account in accounts]

    def get_accounts_by_institution(self, institution: str) -> List[Dict[str, Any]]:
        """
        Get all accounts from a specific institution.

        Args:
            institution (str): The institution to get accounts for.

        Returns:
            List[Dict[str, Any]]: A list of accounts from the specified institution.
        """
        accounts = self.repository.get_accounts_by_institution(institution)
        return [self._account_to_dict(account) for account in accounts]

    def add_account(self, account_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Add a new account.

        Args:
            account_data (Dict[str, Any]): The data for the new account.

        Returns:
            Dict[str, Any]: The newly created account.
        """
        account = self.repository.create_account(account_data)
        return self._account_to_dict(account)

    def update_account(self, account_id: str, account_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Update an existing account.

        Args:
            account_id (str): The ID of the account to update.
            account_data (Dict[str, Any]): The new data for the account.

        Returns:
            Optional[Dict[str, Any]]: The updated account if found, None otherwise.
        """
        account = self.repository.update_account(account_id, account_data)
        if account:
            return self._account_to_dict(account)
        return None

    def delete_account(self, account_id: str) -> bool:
        """
        Delete an account.

        Args:
            account_id (str): The ID of the account to delete.

        Returns:
            bool: True if the account was deleted, False otherwise.
        """
        return self.repository.delete_account(account_id)

    def get_account_types(self) -> List[Dict[str, str]]:
        """
        Get all account types.

        Returns:
            List[Dict[str, str]]: A list of all account types.
        """
        account_types = self.repository.get_account_types()
        return [{"id": at.id, "name": at.name} for at in account_types]

    def get_institutions(self) -> List[Dict[str, str]]:
        """
        Get all financial institutions.

        Returns:
            List[Dict[str, str]]: A list of all financial institutions.
        """
        institutions = self.repository.get_institutions()
        return [{"id": inst.id, "name": inst.name} for inst in institutions]

    def get_total_balance(self) -> float:
        """
        Get the total balance across all accounts.

        Returns:
            float: The total balance.
        """
        return self.repository.get_total_balance()

    def get_net_worth(self) -> float:
        """
        Calculate the net worth (assets minus liabilities).

        Returns:
            float: The net worth.
        """
        return self.repository.get_net_worth()

    def _account_to_dict(self, account: Account) -> Dict[str, Any]:
        """
        Convert an Account model to a dictionary.

        Args:
            account (Account): The account model to convert.

        Returns:
            Dict[str, Any]: The account as a dictionary.
        """
        return {
            "id": account.id,
            "name": account.name,
            "type": account.type_id,
            "type_name": account.account_type.name if account.account_type else None,
            "institution": account.institution_id,
            "institution_name": account.institution.name if account.institution else None,
            "balance": account.balance,
            "currency": account.currency,
            "is_active": account.is_active,
            "notes": account.notes,
            "created_at": account.created_at.isoformat() if account.created_at else None,
            "updated_at": account.updated_at.isoformat() if account.updated_at else None
        }
