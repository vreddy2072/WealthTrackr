"""
Main FastAPI application for WealthTrackr backend.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import database routers instead of mock routers
from backend.api.account_router_db import router as account_router
from backend.api.transaction_router_db import router as transaction_router
from backend.api.export_router import router as export_router
from backend.api.reports_router import router as reports_router
from backend.api.bank_connection_router import router as bank_connection_router
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

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, this should be restricted to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(account_router)
app.include_router(transaction_router)
app.include_router(export_router)
app.include_router(reports_router)
app.include_router(bank_connection_router)

@app.get("/")
async def root():
    """Root endpoint that returns a welcome message."""
    return {"message": "Welcome to the WealthTrackr API"}

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
