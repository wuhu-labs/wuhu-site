#!/usr/bin/env bash
# Smoke-test the wuhu-site-router Worker behavior end-to-end against production.
#
# Asserts:
#   1. Bare directory paths (e.g. /alignment, /download) 301 → canonical trailing-slash.
#   2. The canonical slash form returns the expected index body.
#   3. A deep relative link from alignment/index.html (e.g. /alignment/commit/<sha>/)
#      actually resolves (not a 404 to /commit/<sha>/).
#
# Exit non-zero on any failure. Safe to run repeatedly. No auth needed — pure black-box.

set -euo pipefail

BASE="${BASE:-https://wuhu.ai}"
FAIL=0

pass() { printf '  ✓ %s\n' "$1"; }
fail() { printf '  ✗ %s\n' "$1" >&2; FAIL=1; }

probe() {
  # probe <label> <url> <expected_status> [<expected_redirect_substring>]
  local label="$1" url="$2" expected_status="$3" expected_redirect="${4:-}"
  local out status redirect
  out="$(curl -sS -o /dev/null -w '%{http_code}|%{redirect_url}' "$url")"
  status="${out%%|*}"
  redirect="${out#*|}"

  if [[ "$status" != "$expected_status" ]]; then
    fail "$label: expected status $expected_status, got $status (url=$url)"
    return
  fi

  if [[ -n "$expected_redirect" && "$redirect" != *"$expected_redirect"* ]]; then
    fail "$label: expected redirect to contain '$expected_redirect', got '$redirect'"
    return
  fi

  pass "$label (status=$status${redirect:+ → $redirect})"
}

echo "→ Worker redirects (bare directory paths)"
probe "bare /alignment → /alignment/"        "$BASE/alignment"        301 "/alignment/"
probe "bare /download  → /download/"         "$BASE/download"         301 "/download/"

echo
echo "→ Canonical slash paths (no redirect, 200 body)"
probe "slash /alignment/"                    "$BASE/alignment/"       200
probe "slash /download/"                     "$BASE/download/"        200

echo
echo "→ Deep commit link resolves (the bug we fixed)"
# Pull the freshest commit sha from the live manifest and verify the relative
# link the dashboard uses actually lands on a real object.
sha="$(curl -sS "$BASE/alignment/manifest.json" | python3 -c \
  'import json,sys; print(json.load(sys.stdin)["commits"][0]["sha"])')"
probe "deep commit/$sha/ (200)"              "$BASE/alignment/commit/$sha/"   200
probe "buggy form /commit/$sha/ (should 404)" "$BASE/commit/$sha/"            404

echo
echo "→ Alignment .swift inline (text/plain, not octet-stream download)"
# Pull the snapshot index page and find any .swift href to probe.
swift_key="$(curl -sS "$BASE/alignment/commit/$sha/" | python3 -c '
import re, sys
m = re.search(r"href=\"(interfaces/[^\"]+\.swift)\"", sys.stdin.read())
print(m.group(1) if m else "")
')"
if [[ -n "$swift_key" ]]; then
  swift_url="$BASE/alignment/commit/$sha/$swift_key"
  ctype="$(curl -sS -o /dev/null -w '%{content_type}' "$swift_url")"
  if [[ "$ctype" == text/plain* ]]; then
    pass "swift inline content-type=$ctype ($swift_key)"
  else
    fail "swift content-type expected text/plain*, got '$ctype' ($swift_url)"
  fi
else
  fail "could not locate a .swift interface under commit/$sha/"
fi

echo
echo "→ Query & hash preservation on redirect"
out="$(curl -sS -o /dev/null -w '%{redirect_url}' "$BASE/alignment?foo=bar")"
if [[ "$out" == *"/alignment/"* && "$out" == *"foo=bar"* ]]; then
  pass "query preserved: $out"
else
  fail "query not preserved on redirect: $out"
fi

echo
if (( FAIL )); then
  echo "FAIL"
  exit 1
fi
echo "OK"
