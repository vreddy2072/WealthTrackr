"""
Simple API test script to verify that the backend API is running and accessible.

This script tests basic API endpoints to ensure they are responding correctly.
"""
import requests
import sys
import os

# Add the project root to the Python path to allow imports from other modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

def test_api():
    """
    Test basic API endpoints to verify they are working.
    """
    try:
        # Test the root endpoint
        response = requests.get("http://localhost:8000/")
        print(f"Root endpoint: {response.status_code}")
        print(response.json())
        
        # Test the OpenAPI schema
        response = requests.get("http://localhost:8000/openapi.json")
        print(f"OpenAPI schema: {response.status_code}")
        
        # Test the accounts endpoint
        response = requests.get("http://localhost:8000/api/accounts/")
        print(f"Accounts endpoint: {response.status_code}")
        print(response.json())
        
        # Test the transactions endpoint
        response = requests.get("http://localhost:8000/api/transactions/")
        print(f"Transactions endpoint: {response.status_code}")
        print(f"Found {len(response.json())} transactions")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_api()
