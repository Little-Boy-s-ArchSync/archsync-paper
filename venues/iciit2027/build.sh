#!/bin/sh
set -eu
cd "$(dirname "$0")"
for profile in review compact review-anonymous compact-anonymous supplement; do
  tectonic --keep-logs "iciit2027-$profile.tex" > "$profile-build.log" 2>&1
done
"${PYTHON_PDF:-python3}" validate.py
