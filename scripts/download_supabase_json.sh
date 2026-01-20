#!/usr/bin/env bash
set -euo pipefail

# download_supabase_json.sh
# Simple helper to download a Supabase JSON file from a URL with optional Authorization header.
# Usage:
#   SUPABASE_URL="https://.../path/to/supabase.json" ./scripts/download_supabase_json.sh [output.json]
#   ./scripts/download_supabase_json.sh "https://.../supabase.json" [output.json]
# Optional:
#   export SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
# If SUPABASE_SERVICE_ROLE_KEY is set, the script will send it as a Bearer token.

if [ "$#" -ge 1 ] && [[ "$1" == http* ]]; then
  URL="$1"
  shift
elif [ -n "${SUPABASE_URL:-}" ]; then
  URL="$SUPABASE_URL"
else
  echo "Usage: SUPABASE_URL=... $0 [output.json]  OR  $0 <url> [output.json]"
  exit 1
fi

OUTFILE="${1:-supabase.json}"

CURL_ARGS=( -fSL )
if [ -n "${SUPABASE_SERVICE_ROLE_KEY:-}" ]; then
  CURL_ARGS+=( -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" )
fi

echo "Downloading $URL -> $OUTFILE"
if curl "${CURL_ARGS[@]}" "$URL" -o "$OUTFILE"; then
  echo "Saved to $OUTFILE"
  exit 0
else
  echo "Failed to download $URL" >&2
  exit 2
fi
