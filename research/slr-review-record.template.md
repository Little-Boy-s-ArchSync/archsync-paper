# SLR-101 Independent Review Record Template

This file is a template, not review evidence. In shared-account mode, the Independent SLR Reviewer
must generate `slr-review-record.md` with
`create-slr-signed-review.mjs sign` only after reviewing the exact commit. The
tool replaces every placeholder with immutable evidence and signs the matching
JSON attestation; CI rejects a manual, incomplete, overwritten, or self-approved
frozen protocol.

| Field | Value |
| --- | --- |
| Task | SLR-101 |
| Protocol version | 1.0.0 |
| Review mode | Signed attestation |
| Review PR | `<approved ArchSync paper PR URL>` |
| Reviewer role | Independent SLR Reviewer |
| Review decision | Approved |
| Review commit | `<full 40-character commit SHA>` |
| Review timestamp | `<ISO-8601 UTC timestamp>` |
| Search results inspected | No |
| Sentinel recall | Passed |
| Review attestation | `research/evidence/slr-review/independent-slr-reviewer-attestation.json#sha256=<SHA-256>` |
| Review signature | `research/evidence/slr-review/independent-slr-reviewer-attestation.sig#sha256=<SHA-256>` |
| Reviewer public key | `research/evidence/slr-review/independent-slr-reviewer-public-key.pem#sha256=<SHA-256>` |
