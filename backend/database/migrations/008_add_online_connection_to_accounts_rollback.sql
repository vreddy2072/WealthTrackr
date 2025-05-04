-- Rollback Migration: Remove has_online_connection column from accounts table
-- Description: Removes the column that tracks whether an account is connected to online banking

-- Create a temporary table without the has_online_connection column
CREATE TABLE accounts_temp (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type_id VARCHAR(50) NOT NULL,
    institution_id VARCHAR(50) NOT NULL,
    balance REAL NOT NULL DEFAULT 0.0,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    is_active BOOLEAN NOT NULL DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (type_id) REFERENCES account_types(id),
    FOREIGN KEY (institution_id) REFERENCES institutions(id)
);

-- Copy data from the original table to the temporary table
INSERT INTO accounts_temp (id, name, type_id, institution_id, balance, currency, is_active, notes, created_at, updated_at)
SELECT id, name, type_id, institution_id, balance, currency, is_active, notes, created_at, updated_at FROM accounts;

-- Drop the original table
DROP TABLE accounts;

-- Rename the temporary table to the original table name
ALTER TABLE accounts_temp RENAME TO accounts;
