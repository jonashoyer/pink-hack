#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p /home/data
node dist/migrate.mjs
exec node dist/index.mjs
