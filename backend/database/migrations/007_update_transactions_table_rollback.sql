-- Rollback the update to transactions table
ALTER TABLE transactions DROP COLUMN payee;
ALTER TABLE transactions DROP COLUMN is_reconciled;
