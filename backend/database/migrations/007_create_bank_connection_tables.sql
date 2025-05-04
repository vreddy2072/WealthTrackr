-- Migration: Create bank connection tables
-- Description: Adds tables for storing bank connection information

-- Create bank_connections table if it doesn't exist
CREATE TABLE IF NOT EXISTS bank_connections (
    id VARCHAR(50) PRIMARY KEY,
    institution_id VARCHAR(50) NOT NULL,
    access_token VARCHAR(255) NOT NULL,
    item_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    last_sync_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (institution_id) REFERENCES institutions(id)
);

-- Create bank_connection_accounts table if it doesn't exist
CREATE TABLE IF NOT EXISTS bank_connection_accounts (
    id VARCHAR(50) PRIMARY KEY,
    bank_connection_id VARCHAR(50) NOT NULL,
    account_id VARCHAR(50) NOT NULL,
    external_account_id VARCHAR(255) NOT NULL,
    last_sync_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bank_connection_id) REFERENCES bank_connections(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
    UNIQUE (bank_connection_id, account_id)
);
