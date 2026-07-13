#!/usr/bin/env bash
set -euo pipefail

# Make a curl request to https://caffeinesoftware.com and save verbose output
# to OUTPUT.txt in the repository root.
# Verbose output from curl is written to stderr; redirect both stdout and stderr
# into OUTPUT.txt so the file contains the full verbose session and response.

curl -v https://caffeinesoftware.com > "$(dirname "${BASH_SOURCE[0]}")/../OUTPUT.txt" 2>&1

echo "Saved verbose curl output to OUTPUT.txt"
