# WealthTrackr - Product Requirements Document (PRD)

**Version:** 1.0  
**Author:** Vinesh Vonteru  
**Date:** April 20, 2025

---

## 1. Overview

**WealthTrackr** is a local-first personal finance tracking application that allows users to view, manage, and plan their financial life across bank accounts, credit cards, investments, income, expenses, and savings goals. The application is inspired by Quicken Simplifi, built using a React frontend and Python (FastAPI) backend with a SQLite database.

---

## 2. System Architecture

**Architecture Layers:**  
UI → API → Service → ORM → SQLite (local)

**Tech Stack:**
- **Frontend:** React (with Vite), Tailwind CSS, shadcn/ui
- **Backend:** FastAPI (Python 3.11+)
- **ORM:** SQLAlchemy
- **Database:** SQLite (local file storage)
- **State Management:** React Context + Reducers
- **Auth:** Local-only auth (Google OAuth optional later)

---

## 3. Key Features

### 3.1 Account Management
- Add and manage multiple account types: checking, savings, credit card, cash, and investments.
- Categorize by account type and institution.
- Track balances and sync with bank APIs (future integration with Plaid or manual import).

### 3.2 Transaction Tracking
- List all transactions grouped by account and date.
- Import transactions via CSV or JSON.
- Auto-categorize by payee and type.
- Manual transaction entry and editing.
- Search, filter, and sort transactions.

### 3.3 Reports & Dashboards
- Net worth over time
- Spending by category/pie chart
- Monthly summary reports
- Download reports as PDF/CSV

### 3.4 Spending Plan (Budgeting)
- Monthly income and expense planning.
- Recurring bills, subscriptions, and one-time expenses.
- Budget vs actual comparison.
- Visual charts showing spending trends and limits.

### 3.5 Savings Goals
- Set up goals (e.g., Vacation Fund, Emergency Savings).
- Track contributions and time-to-target.
- Allocate monthly contribution amounts.
- Tie goals to specific accounts.

### 3.6 Investment Tracking (Future Phase)
- Track holdings (stocks, ETFs, crypto)
- Manual data entry or import CSV
- Visualize gain/loss

### 3.7 Refund Tracker
- Log expected refunds (e.g., tax refund, item return)
- Track amount, date filed, and received
- Alert if overdue

### 3.8 Watchlists
- Track spending categories, merchants, or tags
- Set thresholds for alerts (e.g., $200 spent on dining)
- Visual trend of spending in each watchlist

### 3.9 User Preferences
- Set currency
- Date format and time zone
- Theme: Light/Dark

---

## 4. Security and Privacy
- All data is stored locally (SQLite)
- No cloud sync in V1
- Data encryption (optional) for local `.db` file
- Auth (optional): Google OAuth for multi-device use in future

---

## 5. Non-Functional Requirements
- Local-first performance: responsive and fast
- Portable installation (cross-platform desktop packaging as future phase)
- Scalable codebase (modular services, clean separation between API and UI)
- Testable (unit tests for service and API layer)

---

## 6. Future Enhancements
- Bank sync using Plaid API
- Cloud backup + sync
- Mobile version with shared local database or sync
- AI-based spending insights and recommendation engine
