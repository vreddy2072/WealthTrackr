# WealthTrackr API Documentation

## API Endpoints

The WealthTrackr API provides the following documentation endpoints:

- **Swagger UI**: [http://localhost:8000/api-docs](http://localhost:8000/api-docs)
  - Interactive API documentation with the ability to try out API calls directly from the browser.

- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
  - Alternative API documentation with a clean, responsive interface.

## Available API Endpoints

### Accounts

- `GET /api/accounts/` - Get all accounts
- `POST /api/accounts/` - Create a new account
- `GET /api/accounts/{account_id}` - Get a specific account by ID
- `PUT /api/accounts/{account_id}` - Update an account
- `DELETE /api/accounts/{account_id}` - Delete an account
- `GET /api/accounts/types/all` - Get all account types
- `GET /api/accounts/institutions/all` - Get all institutions
- `GET /api/accounts/stats/total-balance` - Get total balance across all accounts
- `GET /api/accounts/stats/net-worth` - Get net worth (total assets minus liabilities)

### Transactions

- `GET /api/transactions/` - Get all transactions
- `POST /api/transactions/` - Create a new transaction
- `GET /api/transactions/{transaction_id}` - Get a specific transaction by ID
- `PUT /api/transactions/{transaction_id}` - Update a transaction
- `DELETE /api/transactions/{transaction_id}` - Delete a transaction
- `GET /api/transactions/categories/all` - Get all transaction categories
- `GET /api/transactions/by-account/{account_id}` - Get all transactions for a specific account
- `GET /api/transactions/stats/monthly-spending` - Get monthly spending statistics
- `GET /api/transactions/stats/category-breakdown` - Get spending breakdown by category

## API Server

To start the API server, run:

```
python -m uvicorn backend.main_db:app --reload
```

The server will be available at http://localhost:8000.
