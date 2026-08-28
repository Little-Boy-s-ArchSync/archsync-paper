# SLR Query and Reconciliation Amendment 0.2.2

| Field | Value |
| --- | --- |
| Proposal ID | SLR-QA-002 |
| Candidate protocol version | 0.2.2 |
| Query specification version | 0.2.2 |
| Screening criteria version | 0.2.0 |
| Sentinel evidence schema | 1.2.0 |
| Calibration schema | 1.2.0 |
| Status | Accepted under D-021 |
| Decision | D-021 |
| Accepted date | 2026-08-28 |
| Owner | Võ Đức Hiếu |
| Official search | Not authorized; not started |
| Candidate results screened | No |

## 1. Scope and integrity boundary

This amendment corrects provider serialization defects found during fixed-item
sentinel calibration and changes only the pre-search reconciliation mechanism.
It does not authorize an official search, result-list inspection, eligibility
screening, or manuscript result claim. No sentinel title, DOI, author, venue,
or other fixed-item identifier becomes a search term.

## 2. Logical query correction

Define the source-neutral domain guard:

```text
L = software OR architectur*
```

A1 and B1 remain unchanged. Replace only:

```text
A2 = (L) AND (K2)
A3 = (L) AND (K3)
```

The correction removes redundant mandatory P and D blocks from K2/K3 families.
K2 already contains explicit conformance, compliance, violation, and constraint
concepts; K3 already contains reconstruction, recovery, and reflexion concepts.

## 3. OpenAlex execution contract

1. Represent every original atom or wildcard as an exact
   `fulltext.search.exact` OQL leaf while preserving the complete Boolean tree,
   DOI identity constraint for sentinel runs, and publication cutoff.
2. Submit the complete OQL to official `/query` for validation and
   canonicalization without executing it.
3. Require clean validation and retain the input OQL, canonical OQL, canonical
   OQO, versions, and SHA-256 hashes.
4. Execute the canonical OQO with `POST /`; use an authorization header at
   runtime and never persist a credential. Retain credential-free view
   parameters, response bytes, response hash, aggregate count, and requested
   DOI identity result.
5. Fail closed on Boolean or term-multiset drift, a validation error, a secret
   in persisted material, stemmed `search`, `search.exact`, or diagnostic `~N`.
6. An emitted `oxurl` may be retained as diagnostic translation provenance but
   is not required and is not the normative execution surface.

This uses the canonical OQO rather than the deprecated classic filter surface
and avoids URL-length truncation by using POST.

## 4. ACM execution contract

Execute and retain the authenticated ACM Guide Advanced Search expression:

```text
Title:(Q) OR Abstract:(Q) OR Keyword:(Q)
```

The complete Q must be identical in all three fields and the sentinel identity
constraint must remain present for calibration. The official `AllField=` URL
parameter is permitted only as a transport carrier when its decoded value is
exactly the field-scoped expression above. `Keyword:` is the ACM interface name
for Author Keyword. Semantic AllField/Anywhere, unscoped Q, and full-text search
remain forbidden.

## 5. Evidence and classification

The sentinel schema is 1.2.0 and pins provider translation provenance. A DOI or
title identity check may establish only `indexed_sources`. A positive governed
A1/A2/A3/B1/C1/C2 family run is required for `retrieved_sources` and the
`retrieved` classification. HTTP errors, rate limits, or security verification
pages are access failures, never zero-result evidence.

All 0.2.0 evidence and failed 0.2.1 attempts remain immutable diagnostics.
After implementation, all six fixed sentinels must be rerun across IEEE Xplore,
ACM Digital Library, OpenAlex, and Semantic Scholar. Both execution flags remain
false because fixed-item calibration is not the official search or screening.

## 6. Blind calibration reconciliation

The exact CAL-001 through CAL-009 snapshots are the jointly accepted pilot.
Each reviewer independently creates decisions and a private nonce before either
decision file is revealed. Both commitments must coexist in the strict ancestor
commit.

After both reveals, each disagreement is resolved only by a reconciliation row
that binds both sealed decision hashes and records explicit approval from both
reviewers. Neither reviewer may determine the final value alone. If consensus
is unavailable, the gate fails and calibration restarts with a fresh pilot and
new criteria version. Original decisions are never overwritten.

## 7. Acceptance gate

The amendment is complete only when updated documents and validators agree,
fresh 1.2.0 sentinel evidence and ledger pass, the three-commit blind
calibration passes, the exact review commit is signed by Trần Minh Hoàng, local
and hosted checks pass, and prospective freeze prints
`READY TO FREEZE SLR PROTOCOL 1.0.0`.
