-- Rollback Migration: Remove bank connection tables
-- Description: Removes the tables for storing bank connection information

-- Drop the bank_connection_accounts table
DROP TABLE IF EXISTS bank_connection_accounts;

-- Drop the bank_connections table
DROP TABLE IF EXISTS bank_connections;
