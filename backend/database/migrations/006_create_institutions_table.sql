-- Migration: Create institutions table
-- Description: Adds a table for storing financial institution information

-- Create institutions table if it doesn't exist
CREATE TABLE IF NOT EXISTS institutions (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
