"""
Configuration file for pytest.

This file sets up the Python path for tests.
"""
import sys
import os
from pathlib import Path

# Add the parent directory to sys.path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir.parent))
