"""
Main FastAPI application for WealthTrackr backend.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.account_router import router as account_router

# Create the FastAPI application
app = FastAPI(
    title="WealthTrackr API",
    description="API for the WealthTrackr personal finance application",
    version="0.1.0"
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

@app.get("/")
async def root():
    """Root endpoint that returns a welcome message."""
    return {"message": "Welcome to the WealthTrackr API"}

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
