#!/usr/bin/env bash
# Dev server for the TutorBot film. Loading local fonts/screenshots needs http://, not file://.
PORT="${1:-8124}"
cd "$(dirname "$0")"
echo "Serving TutorBot film on http://localhost:${PORT}/  → click \"Start the Film\""
exec python3 -m http.server "${PORT}"
