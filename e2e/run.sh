#!/usr/bin/env bash
# Builds the site against the local stack and runs the browser tests.
set -euo pipefail
cd "$(dirname "$0")/.."
(cd node_modules/@embedded-postgres/linux-x64 && node scripts/hydrate-symlinks.js)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54421 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=test NEXT_PUBLIC_MEMBER_PORTAL=on npx next build >/dev/null
npx playwright test -c e2e "$@"
