# My-Finance-Tracker

An AI-powered Personal Finance, Investment & Stock Analytics Platform. See
[`Implementation/README.md`](Implementation/README.md), [`Implementation/Enhancements.md`](Implementation/Enhancements.md)
and [`Implementation/File-Structure.md`](Implementation/File-Structure.md) for the full product vision and roadmap.

**To run the whole project with one command:**

```bash
./run.sh
```

See [`RUNNING.md`](RUNNING.md) for what that does, manual step-by-step commands, and
troubleshooting.

## Current status: Phase 1 (Foundation)

This repo currently implements **Phase 1** of the roadmap:

- JWT authentication (register / login / refresh / me)
- Expense tracking with Need/Want categories (seeded per user on registration)
- Income tracking with categories
- Portfolio holdings (stocks, ETFs, mutual funds, gold, etc.) with computed P&L
- Dashboard aggregation (net worth, monthly income/expenses, trends, allocation, top movers)
- Interactive charts (pie / line / bar) via Apache ECharts

Not yet implemented (later phases per `Implementation/README.md`): live market data feeds,
WebSockets, AI assistant/RAG, ML forecasting, trading journal, alerts/notifications, reports,
and Docker/Postgres deployment. The backend currently uses SQLite for local development; the
`DATABASE_URL` setting is the only thing that needs to change to move to PostgreSQL.

## Project layout

```
backend/    FastAPI app (see backend/app/)
frontend/   React + TypeScript + Vite app (see frontend/src/)
Implementation/   Product spec & roadmap docs
```

## Backend setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

The API is served at `http://127.0.0.1:8000`, with interactive docs at `/docs`.

Run tests:

```bash
cd backend
source venv/bin/activate
pytest
```

## Frontend setup

Requires Node.js (LTS) and npm.

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The app is served at `http://localhost:5173` and proxies `/api` requests to the backend at
`http://127.0.0.1:8000` (see `vite.config.ts`). Make sure the backend is running first.

Both the backend and frontend have been installed, run, and verified end-to-end (register →
login → expense/income/portfolio CRUD → dashboard, exercised through the actual running
servers, plus `pytest` for the backend and `tsc -b` for the frontend). See
[`RUNNING.md`](RUNNING.md) for full step-by-step commands and troubleshooting.

## Default login flow

1. Register a new account at `/register` — this seeds default expense categories (Rent, Food,
   Groceries, ... under Need; Movies, Shopping, ... under Want) and income categories (Salary,
   Freelancing, Dividends, Interest, Other).
2. Log in, then add expenses, income, and portfolio holdings from their respective pages.
3. The Dashboard aggregates everything into net worth, trends, and allocation charts.
