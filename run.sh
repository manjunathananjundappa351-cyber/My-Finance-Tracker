#!/usr/bin/env bash
# Runs the entire My-Finance-Tracker project (backend + frontend) with one command.
# Usage: ./run.sh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
BACKEND_PORT=8000
FRONTEND_PORT=5173

log() { printf '\033[1;36m[run]\033[0m %s\n' "$1"; }
fail() { printf '\033[1;31m[run]\033[0m %s\n' "$1" >&2; exit 1; }

# --- Resolve Node.js (system install, or this repo's local .toolcache copy) ---
if command -v node >/dev/null 2>&1; then
  NODE_BIN_DIR="$(dirname "$(command -v node)")"
else
  NODE_BIN_DIR="$(find "$ROOT_DIR/.toolcache" -maxdepth 1 -type d -name 'node-*' 2>/dev/null | head -1)/bin"
  [ -d "$NODE_BIN_DIR" ] || fail "Node.js not found (checked PATH and $ROOT_DIR/.toolcache). See RUNNING.md to install it."
fi
export PATH="$NODE_BIN_DIR:$PATH"
log "Using node $(node --version) ($(command -v node))"

# --- Fail fast if the ports we need are already taken ---
for port in "$BACKEND_PORT" "$FRONTEND_PORT"; do
  if lsof -i ":$port" -sTCP:LISTEN >/dev/null 2>&1; then
    fail "Port $port is already in use (often a previous ./run.sh still running). Inspect with 'lsof -i :$port', or free it with 'lsof -ti :$port | xargs kill', then re-run."
  fi
done

# --- Backend: venv + deps + .env ---
log "Setting up backend..."
cd "$BACKEND_DIR"
[ -d venv ] || python3 -m venv venv
# shellcheck disable=SC1091
source venv/bin/activate
pip install -q -r requirements.txt
[ -f .env ] || cp .env.example .env

# --- Frontend: deps + .env ---
log "Setting up frontend..."
cd "$FRONTEND_DIR"
[ -f .env ] || cp .env.example .env
[ -d node_modules ] || npm install

# --- Launch both, tear both down together on exit ---
PIDS=()
cleanup() {
  log "Stopping servers..."
  for pid in "${PIDS[@]:-}"; do
    kill "$pid" 2>/dev/null || true
  done
}
trap cleanup EXIT INT TERM

cd "$BACKEND_DIR"
uvicorn app.main:app --reload --host 127.0.0.1 --port "$BACKEND_PORT" &
PIDS+=("$!")

cd "$FRONTEND_DIR"
npm run dev -- --port "$FRONTEND_PORT" &
PIDS+=("$!")

log "Backend:  http://127.0.0.1:$BACKEND_PORT  (docs at /docs)"
log "Frontend: http://localhost:$FRONTEND_PORT"
log "Press Ctrl+C to stop both."

wait
