#!/usr/bin/env bash
set -euo pipefail

# Make a curl request to https://caffeinesoftware.com and save verbose output to OUTPUT.txt
# Redirect both stdout and stderr so verbose information is captured alongside the response body.

echo "Fetching https://caffeinesoftware.com and writing verbose output to OUTPUT.txt"

curl -v https://caffeinesoftware.com > OUTPUT.txt 2>&1

echo "Done. OUTPUT.txt created in repository root."
