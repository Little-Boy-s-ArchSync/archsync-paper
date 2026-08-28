# SLR-103 Calibration Candidate Packet

Status: preparation only — not governed SLR-103 calibration evidence.

This directory is a preselection pool of real publication metadata snapshots.
It is deliberately separate from the governed
research/evidence/slr-screening-calibration directory. It is not a pilot set,
not a calibration commitment commit, not SLR evidence, and not an approval.
The packet does not contain reviewer decisions, expected outcomes, strata,
reason codes, evidence classes, governed reviewer identity fields, nonces,
commitments, reveals, agreement results, reconciliation, signatures, or review
records.

The delegated technical operator, GitHub login an1dee3301, prepared this pool
using AI-assisted metadata capture from production DOI, OpenAlex, and DataCite
records. This preparation
did not execute or inspect the official SLR result list. Records come from the
fixed sentinel literature or separately sourced method and software-engineering
publications. The abstract field is a metadata abstract snapshot, not a
full-text copy. The DOI is the persistent publication identity; the
evidence_location identifies the API response used for the captured abstract
and core metadata. Publication type and venue are normalized against DOI
registration metadata.

D-021 is accepted for candidate protocol 0.2.2, while official search and
screening remain blocked until freeze 1.0.0. These protocol-neutral candidate
records are unchanged preparation material and are not promoted by that
acceptance. Hiếu and Tran Minh Hoang must jointly accept at least eight exact
records. Hiếu and Tran Minh Hoang have accepted the exact CAL-001 through
CAL-009 snapshot set without publishing either reviewer's decisions here. The
source metadata still must be verified before the accepted bytes are copied
into the governed calibration root.

After joint acceptance, only the accepted snapshot bytes may be copied into the
official records directory. Both humans must then independently create their
private decision files and commitments following SLR-REVIEWER-RUNBOOK.md. This
candidate packet must never be treated as the first commit in the governed
three-commit calibration chronology and must never be promoted wholesale.

Run the preparation-only integrity check with:

    node research/validate-slr-calibration-candidates.mjs

The manifest pins each record's SHA-256 digest. A passing candidate-packet check
does not satisfy SLR-103, unlock search, freeze the protocol or codebook, or
authorize a signed review.

The validator proves file shape, exact-byte hashes, source-locator structure,
and the absence of decision-specific fields and known leakage markers. It
cannot prove semantic source truth or human independence. Both selectors must
inspect the exact source snapshots before promotion.
