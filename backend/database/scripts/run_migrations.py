"""
Run Migrations Script

This script runs database migrations.
"""
import sys
import os

# Add the project root directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')))

from backend.database.migrations.manager import run_migrations

if __name__ == "__main__":
    run_migrations()
