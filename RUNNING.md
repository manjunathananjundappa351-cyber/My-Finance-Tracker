# Running My-Finance-Tracker Locally

The project has two services: the **backend** (FastAPI, port 8000) and the **frontend**
(React/Vite, port 5173). The frontend proxies API calls to the backend, so the backend must be
up first — the one-command option below handles that ordering for you.

## Prerequisites

- Python 3.9+ (check with `python3 --version`)
- Node.js 18+ and npm (check with `node --version` / `npm --version`) — not required up front if
  you use the one-command script below and this repo already has a local Node copy in
  `.toolcache/`; see [No Node.js installed?](#no-nodejs-installed) otherwise.

## Option A: one command (recommended)

```bash
./run.sh
```

This single script:

- resolves Node.js (uses `node` on your `PATH`, or falls back to this repo's local
  `.toolcache/` copy if present)
- creates the backend virtualenv and installs Python deps if needed
- installs frontend npm deps if `node_modules/` is missing
- copies `.env.example` → `.env` for both services if missing
- starts **both** the backend and frontend together, and stops **both** together on `Ctrl+C`
- refuses to start if ports 8000 or 5173 are already taken (with a hint on how to check)

Once it prints both URLs, open http://localhost:5173. Press `Ctrl+C` in that terminal to stop
everything.

If you'd rather run/understand each service individually, or `run.sh` doesn't fit your setup,
use Option B below — it's exactly what `run.sh` automates.

## Option B: run each service manually

### 1. Backend (FastAPI)

```bash
cd backend
python3 -m venv venv          # skip if venv/ already exists
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # skip if .env already exists
uvicorn app.main:app --reload
```

- API: http://127.0.0.1:8000
- Interactive docs: http://127.0.0.1:8000/docs
- Health check: `curl http://127.0.0.1:8000/health` → `{"status":"ok"}`

Uses SQLite by default (`backend/finance_tracker.db`, created automatically on first run).
Leave this terminal running.

### Run backend tests

```bash
cd backend
source venv/bin/activate
pytest
```

### 2. Frontend (React + Vite)

In a **new terminal** (leave the backend running in the first one):

```bash
cd frontend
npm install                   # only needed the first time / after dependency changes
cp .env.example .env          # skip if .env already exists
npm run dev
```

- App: http://localhost:5173
- Requests to `/api/*` are proxied to the backend at `http://127.0.0.1:8000` (see
  `frontend/vite.config.ts`), so the backend must already be running.

### Type-check / build

```bash
cd frontend
npm run build      # runs `tsc -b` then `vite build`
```

## Use the app

1. Open http://localhost:5173/register and create an account. This seeds default expense
   categories (Rent, Food, Groceries, ... under Need; Movies, Shopping, ... under Want) and
   income categories (Salary, Freelancing, Dividends, Interest, Other).
2. Log in, then add expenses, income, and portfolio holdings from the sidebar.
3. The Dashboard page aggregates everything into net worth, trends, and allocation charts.

## Stopping the servers

`Ctrl+C` in the terminal running `run.sh` (or in each terminal, if you started them manually via
Option B) — `run.sh` stops both backend and frontend together. If something was started in the
background and you need to find and stop it manually:

```bash
lsof -ti :8000 | xargs kill   # backend
lsof -ti :5173 | xargs kill   # frontend
```

## No Node.js installed?

Install it one of these ways:

- Download the installer from https://nodejs.org (LTS version)
- Homebrew: `brew install node`
- Or a local, non-system install with no sudo required — download the tarball for your
  platform from https://nodejs.org/dist/, verify its checksum against that version's
  `SHASUMS256.txt`, extract it anywhere (e.g. `~/tools/node-vXX`), and add
  `<extracted-folder>/bin` to your `PATH` for that shell session:

  ```bash
  export PATH="$HOME/tools/node-vXX-darwin-arm64/bin:$PATH"
  ```

  This repo has such a local copy already at `.toolcache/node-v24.18.0-darwin-arm64/` (not on
  PATH by default, not committed to git). To use it in a new terminal:

  ```bash
  export PATH="$(pwd)/.toolcache/node-v24.18.0-darwin-arm64/bin:$PATH"
  node --version   # v24.18.0
  npm --version
  ```

## Troubleshooting

- **Frontend can't reach the API / network errors in the browser console**: confirm the
  backend is running (`curl http://127.0.0.1:8000/health`) and that `frontend/.env` has
  `VITE_API_BASE_URL=http://127.0.0.1:8000/api`.
- **Port already in use**: another process is bound to 8000 or 5173.
  `lsof -i :8000` / `lsof -i :5173` to find it, then stop it or change the port
  (`uvicorn app.main:app --reload --port 8001`, or `vite.config.ts` → `server.port`).
- **Reset the local database**: stop the backend, delete `backend/finance_tracker.db`,
  restart — a fresh empty database is created automatically.
