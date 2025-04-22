"""
Account Service Module

This module provides services for managing financial accounts in the WealthTrackr application.
"""
from datetime import datetime
from typing import List, Dict, Optional, Any
from uuid import uuid4

class AccountService:
    """Service for managing financial accounts."""
    
    def __init__(self):
        """Initialize the account service with dummy data."""
        self.accounts = [
            {
                "id": "acc-001",
                "name": "Primary Checking",
                "type": "checking",
                "institution": "Chase Bank",
                "balance": 2500.75,
                "currency": "USD",
                "is_active": True,
                "notes": "Main checking account for daily expenses",
                "created_at": datetime(2025, 1, 15).isoformat(),
                "updated_at": datetime(2025, 4, 10).isoformat()
            },
            {
                "id": "acc-002",
                "name": "Emergency Savings",
                "type": "savings",
                "institution": "Chase Bank",
                "balance": 10000.00,
                "currency": "USD",
                "is_active": True,
                "notes": "Emergency fund - 3 months of expenses",
                "created_at": datetime(2025, 1, 15).isoformat(),
                "updated_at": datetime(2025, 3, 20).isoformat()
            },
            {
                "id": "acc-003",
                "name": "Rewards Credit Card",
                "type": "credit",
                "institution": "American Express",
                "balance": -450.25,
                "currency": "USD",
                "is_active": True,
                "notes": "Primary credit card for points",
                "created_at": datetime(2025, 2, 10).isoformat(),
                "updated_at": datetime(2025, 4, 5).isoformat()
            },
            {
                "id": "acc-004",
                "name": "Vacation Fund",
                "type": "savings",
                "institution": "Ally Bank",
                "balance": 3500.00,
                "currency": "USD",
                "is_active": True,
                "notes": "Saving for summer vacation",
                "created_at": datetime(2025, 3, 1).isoformat(),
                "updated_at": datetime(2025, 4, 1).isoformat()
            },
            {
                "id": "acc-005",
                "name": "Investment Portfolio",
                "type": "investment",
                "institution": "Vanguard",
                "balance": 45000.00,
                "currency": "USD",
                "is_active": True,
                "notes": "Retirement investments - index funds",
                "created_at": datetime(2024, 11, 15).isoformat(),
                "updated_at": datetime(2025, 4, 15).isoformat()
            }
        ]
        
        self.account_types = [
            {"id": "checking", "name": "Checking Account"},
            {"id": "savings", "name": "Savings Account"},
            {"id": "credit", "name": "Credit Card"},
            {"id": "cash", "name": "Cash"},
            {"id": "investment", "name": "Investment Account"},
            {"id": "loan", "name": "Loan"},
            {"id": "mortgage", "name": "Mortgage"}
        ]
        
        self.institutions = [
            {"id": "chase", "name": "Chase Bank"},
            {"id": "bofa", "name": "Bank of America"},
            {"id": "wells", "name": "Wells Fargo"},
            {"id": "citi", "name": "Citibank"},
            {"id": "amex", "name": "American Express"},
            {"id": "discover", "name": "Discover"},
            {"id": "capital_one", "name": "Capital One"},
            {"id": "ally", "name": "Ally Bank"},
            {"id": "vanguard", "name": "Vanguard"},
            {"id": "fidelity", "name": "Fidelity"},
            {"id": "schwab", "name": "Charles Schwab"},
            {"id": "other", "name": "Other"}
        ]
    
    def get_all_accounts(self) -> List[Dict[str, Any]]:
        """
        Get all accounts.
        
        Returns:
            List[Dict[str, Any]]: A list of all accounts.
        """
        return self.accounts
    
    def get_account_by_id(self, account_id: str) -> Optional[Dict[str, Any]]:
        """
        Get an account by its ID.
        
        Args:
            account_id (str): The ID of the account to retrieve.
            
        Returns:
            Optional[Dict[str, Any]]: The account if found, None otherwise.
        """
        for account in self.accounts:
            if account["id"] == account_id:
                return account
        return None
    
    def get_accounts_by_type(self, account_type: str) -> List[Dict[str, Any]]:
        """
        Get all accounts of a specific type.
        
        Args:
            account_type (str): The type of accounts to retrieve.
            
        Returns:
            List[Dict[str, Any]]: A list of accounts of the specified type.
        """
        return [a for a in self.accounts if a["type"] == account_type]
    
    def get_accounts_by_institution(self, institution: str) -> List[Dict[str, Any]]:
        """
        Get all accounts from a specific institution.
        
        Args:
            institution (str): The institution to get accounts for.
            
        Returns:
            List[Dict[str, Any]]: A list of accounts from the specified institution.
        """
        return [a for a in self.accounts if a["institution"] == institution]
    
    def add_account(self, account_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Add a new account.
        
        Args:
            account_data (Dict[str, Any]): The data for the new account.
            
        Returns:
            Dict[str, Any]: The newly created account.
        """
        # In a real implementation, we would validate the data here
        new_account = {
            "id": f"acc-{len(self.accounts) + 1:03d}",
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "is_active": True,
            **account_data
        }
        self.accounts.append(new_account)
        return new_account
    
    def update_account(self, account_id: str, account_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Update an existing account.
        
        Args:
            account_id (str): The ID of the account to update.
            account_data (Dict[str, Any]): The new data for the account.
            
        Returns:
            Optional[Dict[str, Any]]: The updated account if found, None otherwise.
        """
        for i, account in enumerate(self.accounts):
            if account["id"] == account_id:
                self.accounts[i] = {
                    **account,
                    **account_data,
                    "updated_at": datetime.now().isoformat()
                }
                return self.accounts[i]
        return None
    
    def delete_account(self, account_id: str) -> bool:
        """
        Delete an account.
        
        Args:
            account_id (str): The ID of the account to delete.
            
        Returns:
            bool: True if the account was deleted, False otherwise.
        """
        for i, account in enumerate(self.accounts):
            if account["id"] == account_id:
                del self.accounts[i]
                return True
        return False
    
    def get_account_types(self) -> List[Dict[str, str]]:
        """
        Get all account types.
        
        Returns:
            List[Dict[str, str]]: A list of all account types.
        """
        return self.account_types
    
    def get_institutions(self) -> List[Dict[str, str]]:
        """
        Get all financial institutions.
        
        Returns:
            List[Dict[str, str]]: A list of all financial institutions.
        """
        return self.institutions
    
    def get_total_balance(self) -> float:
        """
        Get the total balance across all accounts.
        
        Returns:
            float: The total balance.
        """
        return sum(account["balance"] for account in self.accounts)
    
    def get_net_worth(self) -> float:
        """
        Calculate the net worth (assets minus liabilities).
        
        Returns:
            float: The net worth.
        """
        assets = sum(account["balance"] for account in self.accounts 
                    if account["balance"] > 0)
        liabilities = sum(abs(account["balance"]) for account in self.accounts 
                         if account["balance"] < 0)
        return assets - liabilities
