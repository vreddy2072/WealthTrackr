"""
Main Application Module (Database Version)

This module initializes and configures the FastAPI application with database support.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.account_router_db import router as account_router
from backend.api.transaction_router_db import router as transaction_router
from backend.database.scripts.init_db import init_db
from backend.database.migrations.manager import run_migrations

# Run migrations and initialize the database
run_migrations()
init_db()

# Create the FastAPI application
app = FastAPI(
    title="WealthTrackr API",
    description="API for the WealthTrackr personal finance application",
    version="1.0.0",
    docs_url="/api-docs",  # Custom Swagger UI URL
    redoc_url="/redoc"     # Keep the default ReDoc URL
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(account_router)
app.include_router(transaction_router)

@app.get("/")
async def root():
    """Root endpoint that returns a welcome message."""
    return {"message": "Welcome to the WealthTrackr API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
