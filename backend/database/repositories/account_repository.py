"""
Account Repository Module

This module provides database operations for account management.
"""
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session, joinedload

from backend.database.models.account import Account, AccountType, Institution

class AccountRepository:
    """Repository for account database operations."""

    def __init__(self, db: Session):
        """
        Initialize the account repository.

        Args:
            db (Session): The database session.
        """
        self.db = db

    def get_all_accounts(self) -> List[Account]:
        """
        Get all accounts.

        Returns:
            List[Account]: A list of all accounts.
        """
        return self.db.query(Account).options(
            joinedload(Account.account_type),
            joinedload(Account.institution)
        ).all()

    def get_account_by_id(self, account_id: str) -> Optional[Account]:
        """
        Get an account by its ID.

        Args:
            account_id (str): The ID of the account to retrieve.

        Returns:
            Optional[Account]: The account if found, None otherwise.
        """
        return self.db.query(Account).options(
            joinedload(Account.account_type),
            joinedload(Account.institution)
        ).filter(Account.id == account_id).first()

    def get_accounts_by_type(self, account_type: str) -> List[Account]:
        """
        Get all accounts of a specific type.

        Args:
            account_type (str): The type of accounts to retrieve.

        Returns:
            List[Account]: A list of accounts of the specified type.
        """
        return self.db.query(Account).options(
            joinedload(Account.account_type),
            joinedload(Account.institution)
        ).filter(Account.type_id == account_type).all()

    def get_accounts_by_institution(self, institution: str) -> List[Account]:
        """
        Get all accounts from a specific institution.

        Args:
            institution (str): The institution to get accounts for.

        Returns:
            List[Account]: A list of accounts from the specified institution.
        """
        return self.db.query(Account).options(
            joinedload(Account.account_type),
            joinedload(Account.institution)
        ).filter(Account.institution_id == institution).all()

    def create_account(self, account_data: Dict[str, Any]) -> Account:
        """
        Create a new account.

        Args:
            account_data (Dict[str, Any]): The data for the new account.

        Returns:
            Account: The newly created account.
        """
        # Generate a new account ID
        last_account = self.db.query(Account).order_by(Account.id.desc()).first()
        if last_account:
            # Extract the numeric part and increment
            last_id = int(last_account.id.split('-')[1])
            new_id = f"acc-{last_id + 1:03d}"
        else:
            new_id = "acc-001"

        # Create the new account
        new_account = Account(
            id=new_id,
            name=account_data.get("name"),
            type_id=account_data.get("type"),
            institution_id=account_data.get("institution"),
            balance=account_data.get("balance", 0.0),
            currency=account_data.get("currency", "USD"),
            is_active=True,
            notes=account_data.get("notes"),
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )

        self.db.add(new_account)
        self.db.commit()
        self.db.refresh(new_account)

        return new_account

    def update_account(self, account_id: str, account_data: Dict[str, Any]) -> Optional[Account]:
        """
        Update an existing account.

        Args:
            account_id (str): The ID of the account to update.
            account_data (Dict[str, Any]): The new data for the account.

        Returns:
            Optional[Account]: The updated account if found, None otherwise.
        """
        account = self.get_account_by_id(account_id)
        if not account:
            return None

        # Update account fields
        if "name" in account_data:
            account.name = account_data["name"]
        if "type" in account_data:
            account.type_id = account_data["type"]
        if "institution" in account_data:
            account.institution_id = account_data["institution"]
        if "balance" in account_data:
            account.balance = account_data["balance"]
        if "currency" in account_data:
            account.currency = account_data["currency"]
        if "is_active" in account_data:
            account.is_active = account_data["is_active"]
        if "notes" in account_data:
            account.notes = account_data["notes"]

        account.updated_at = datetime.now(timezone.utc)

        self.db.commit()
        self.db.refresh(account)

        return account

    def delete_account(self, account_id: str) -> bool:
        """
        Delete an account.

        Args:
            account_id (str): The ID of the account to delete.

        Returns:
            bool: True if the account was deleted, False otherwise.
        """
        account = self.get_account_by_id(account_id)
        if not account:
            return False

        self.db.delete(account)
        self.db.commit()

        return True

    def get_account_types(self) -> List[AccountType]:
        """
        Get all account types.

        Returns:
            List[AccountType]: A list of all account types.
        """
        return self.db.query(AccountType).all()

    def get_institutions(self) -> List[Institution]:
        """
        Get all financial institutions.

        Returns:
            List[Institution]: A list of all financial institutions.
        """
        return self.db.query(Institution).all()

    def get_total_balance(self) -> float:
        """
        Get the total balance across all accounts.

        Returns:
            float: The total balance.
        """
        result = self.db.query(Account).with_entities(
            Account.balance
        ).all()

        return sum(account.balance for account in result)

    def get_net_worth(self) -> float:
        """
        Calculate the net worth (assets minus liabilities).

        Returns:
            float: The net worth.
        """
        accounts = self.db.query(Account).with_entities(
            Account.balance
        ).all()

        assets = sum(account.balance for account in accounts if account.balance > 0)
        liabilities = sum(abs(account.balance) for account in accounts if account.balance < 0)

        return assets - liabilities
