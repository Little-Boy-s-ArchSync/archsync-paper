#!/usr/bin/env bash
set -euo pipefail

# The source-package verifier builds in a fresh directory. Mount that exact
# working directory into the same TeX Live image as the hosted profile build.
exec docker run --rm \
  -v "$PWD:$PWD" \
  -w "$PWD" \
  ghcr.io/xu-cheng/texlive-historic-alpine:2024 \
  latexmk "$@"
