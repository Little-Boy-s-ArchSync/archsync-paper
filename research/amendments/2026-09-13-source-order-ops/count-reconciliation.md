# Count reconciliation for C1 accepted markers

This amendment bundle preserves all seven originally bound files under:
`research/amendments/2026-09-13-source-order-ops/`.

The original C1 inventory file `c1-prefix-inventory.json` contains 77 total `accepted.json` markers.
This is a mechanical split, not a data correction:

- translation markers: 1
  - `official-campaign/exports/OPENALEX-C1/attempts/00000001-10f8b620c6ef4d4681368f9cfb05a717/accepted.json`
  - `sha256`: `130bb7b61aebc80864b0badcb266b1314561b57fa45208b9354fbc234440826c`
  - `phase`: `translation`
  - `record_count`: `null`
- export pages: 76

All 76 export-page markers carry `record_count = 100`, so the export-record total is 7,600.

Reviewer-named final marker `attempts/00000090-1873471f7e3c4bde8ab357c4f162a0e4/accepted.json` is an export page and remains included.
