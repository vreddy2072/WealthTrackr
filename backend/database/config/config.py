"""
Database Configuration Module

This module provides configuration for the SQLAlchemy database connection.
"""
import os
import pathlib
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Get the database directory path
DB_DIR = pathlib.Path(__file__).parent.parent / "data"
# Create the directory if it doesn't exist
DB_DIR.mkdir(exist_ok=True)
# Define the database path
DB_PATH = DB_DIR / "wealthtrackr.db"

# SQLite database URL - for development
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

# Create SQLAlchemy engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for declarative models
Base = declarative_base()

def get_db():
    """
    Get a database session.
    
    Yields:
        Session: A SQLAlchemy database session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
