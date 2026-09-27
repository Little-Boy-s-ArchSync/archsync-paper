#!/bin/sh
set -eu
cd "$(dirname "$0")"
export TECTONIC="${TECTONIC:-tectonic}"
exec "${PYTHON_PDF:-python3}" build.py "$@"
