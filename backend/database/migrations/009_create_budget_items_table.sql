-- Create budget_items table
CREATE TABLE IF NOT EXISTS budget_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount REAL NOT NULL,
    type VARCHAR(100) NOT NULL,
    section VARCHAR(50) NOT NULL,
    month VARCHAR(20) NOT NULL
); 