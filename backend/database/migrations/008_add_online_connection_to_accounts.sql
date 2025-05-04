-- Migration: Add has_online_connection column to accounts table
-- Description: Adds a column to track whether an account is connected to online banking

-- Add has_online_connection column to accounts table if it doesn't exist
ALTER TABLE accounts ADD COLUMN has_online_connection BOOLEAN NOT NULL DEFAULT 0;
