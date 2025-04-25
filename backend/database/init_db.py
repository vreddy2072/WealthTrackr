"""
Database Initialization Module

This module initializes the database with tables and seed data.
"""
import logging
from datetime import datetime

from database.config import engine, SessionLocal, Base
from orm.models import AccountType, Institution, Account

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db():
    """Initialize the database with tables and seed data."""
    # Create tables
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)

    # Create a database session
    db = SessionLocal()

    try:
        # Check if we already have data
        if db.query(AccountType).count() > 0:
            logger.info("Database already initialized, skipping seed data.")
            return

        # Seed account types
        logger.info("Seeding account types...")
        account_types = [
            AccountType(id="checking", name="Checking Account"),
            AccountType(id="savings", name="Savings Account"),
            AccountType(id="credit", name="Credit Card"),
            AccountType(id="cash", name="Cash"),
            AccountType(id="investment", name="Investment Account"),
            AccountType(id="loan", name="Loan"),
            AccountType(id="mortgage", name="Mortgage")
        ]
        db.add_all(account_types)

        # Seed institutions
        logger.info("Seeding financial institutions...")
        institutions = [
            Institution(id="chase", name="Chase Bank"),
            Institution(id="bofa", name="Bank of America"),
            Institution(id="wells", name="Wells Fargo"),
            Institution(id="citi", name="Citibank"),
            Institution(id="amex", name="American Express"),
            Institution(id="discover", name="Discover"),
            Institution(id="capital_one", name="Capital One"),
            Institution(id="ally", name="Ally Bank"),
            Institution(id="vanguard", name="Vanguard"),
            Institution(id="fidelity", name="Fidelity"),
            Institution(id="schwab", name="Charles Schwab"),
            Institution(id="other", name="Other")
        ]
        db.add_all(institutions)

        # Commit the changes to persist the seed data
        db.commit()

        # Seed sample accounts
        logger.info("Seeding sample accounts...")
        accounts = [
            Account(
                id="acc-001",
                name="Primary Checking",
                type_id="checking",
                institution_id="chase",
                balance=2500.75,
                currency="USD",
                is_active=True,
                notes="Main checking account for daily expenses",
                created_at=datetime(2025, 1, 15),
                updated_at=datetime(2025, 4, 10)
            ),
            Account(
                id="acc-002",
                name="Emergency Savings",
                type_id="savings",
                institution_id="chase",
                balance=10000.00,
                currency="USD",
                is_active=True,
                notes="Emergency fund - 3 months of expenses",
                created_at=datetime(2025, 1, 15),
                updated_at=datetime(2025, 3, 20)
            ),
            Account(
                id="acc-003",
                name="Rewards Credit Card",
                type_id="credit",
                institution_id="amex",
                balance=-450.25,
                currency="USD",
                is_active=True,
                notes="Primary credit card for points",
                created_at=datetime(2025, 2, 10),
                updated_at=datetime(2025, 4, 5)
            ),
            Account(
                id="acc-004",
                name="Vacation Fund",
                type_id="savings",
                institution_id="ally",
                balance=3500.00,
                currency="USD",
                is_active=True,
                notes="Saving for summer vacation",
                created_at=datetime(2025, 3, 1),
                updated_at=datetime(2025, 4, 1)
            ),
            Account(
                id="acc-005",
                name="Investment Portfolio",
                type_id="investment",
                institution_id="vanguard",
                balance=45000.00,
                currency="USD",
                is_active=True,
                notes="Retirement investments - index funds",
                created_at=datetime(2024, 11, 15),
                updated_at=datetime(2025, 4, 15)
            )
        ]
        db.add_all(accounts)

        # Commit the changes to persist the sample accounts
        db.commit()

        logger.info("Database initialization complete.")

    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        db.rollback()
        raise

    finally:
        db.close()

if __name__ == "__main__":
    logger.info("Initializing database...")
    init_db()
