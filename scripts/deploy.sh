#!/usr/bin/env bash
set -euo pipefail

# Upload all files from dist/ to the wuhu-site R2 bucket.
# Requires CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN to be set,
# or wrangler to be logged in.

DIST_DIR="${1:-dist}"
BUCKET="wuhu-site"

if [ ! -d "$DIST_DIR" ]; then
  echo "Error: dist directory '$DIST_DIR' not found. Run 'npm run build' first."
  exit 1
fi

cd "$DIST_DIR"

find . -type f | while read -r file; do
  key="${file#./}"

  # Determine content type from extension
  case "$file" in
    *.html)  ct="text/html" ;;
    *.css)   ct="text/css" ;;
    *.js)    ct="application/javascript" ;;
    *.json)  ct="application/json" ;;
    *.svg)   ct="image/svg+xml" ;;
    *.png)   ct="image/png" ;;
    *.jpg|*.jpeg) ct="image/jpeg" ;;
    *.webp)  ct="image/webp" ;;
    *.woff2) ct="font/woff2" ;;
    *.woff)  ct="font/woff" ;;
    *.wasm)  ct="application/wasm" ;;
    *.xml)   ct="application/xml" ;;
    *.txt)   ct="text/plain" ;;
    *)       ct="application/octet-stream" ;;
  esac

  echo "  $key ($ct)"
  wrangler r2 object put "$BUCKET/$key" --file="$file" --content-type="$ct" --remote 2>&1 | tail -1
done

echo "Deploy complete."
