"""
Run Database Application Script

This script runs the FastAPI application with database support.
"""
import sys
import os

# Add the project root directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import uvicorn
from backend.main_db import app

if __name__ == "__main__":
    uvicorn.run("backend.main_db:app", host="0.0.0.0", port=8000, reload=True)
