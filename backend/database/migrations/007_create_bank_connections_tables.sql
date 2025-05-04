-- Migration: Create bank connections tables
-- Description: Adds tables for storing bank connection information and links to accounts

-- Create bank_connections table
CREATE TABLE IF NOT EXISTS bank_connections (
    id VARCHAR(50) PRIMARY KEY,
    institution_id VARCHAR(50) NOT NULL,
    access_token VARCHAR(255) NOT NULL,
    item_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    last_sync_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (institution_id) REFERENCES institutions(id)
);

-- Create bank_connection_accounts table to link bank connections to accounts
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
    UNIQUE (bank_connection_id, account_id),
    UNIQUE (bank_connection_id, external_account_id)
);

-- Add has_online_connection column to accounts table
ALTER TABLE accounts ADD COLUMN has_online_connection BOOLEAN NOT NULL DEFAULT 0;
