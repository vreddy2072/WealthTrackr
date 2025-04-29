"""
Run Database Initialization Script

This script runs the database initialization process.
"""
import sys
import os

# Add the project root directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')))

from backend.database.scripts.init_db import init_db

if __name__ == "__main__":
    init_db()
