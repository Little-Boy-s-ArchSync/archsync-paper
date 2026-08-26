# SLR Query Translation Amendment Proposal

| Field | Value |
| --- | --- |
| Proposal ID | SLR-QA-001 |
| Proposed protocol version | 0.2.1 |
| Proposed query specification version | 0.2.1 |
| Status | Proposed - not approved |
| Prepared date | 2026-08-27 |
| Protocol owner and decision owner | Hieu |
| Required independent reviewer | Independent SLR Reviewer |
| Search cutoff | 2026-08-16 inclusive (unchanged) |
| Official search execution | Not authorized; not started |
| Candidate result screening | Prohibited; not started |

## 1. Purpose and integrity boundary

This document proposes the smallest candidate amendment needed to make the
OpenAlex and ACM Digital Library translations of the six governed logical
queries executable and semantically auditable. It also confirms that the
Semantic Scholar translation does not need a semantic change.

This proposal does not amend the governed version-0.2.0 files by itself. It must
not be treated as accepted, used to authorize the official SLR-102 search, or
used to claim that the SLR-101 review or freeze gate has passed. No keyword,
logical query, database, cutoff, eligibility criterion, screening rule, research
question, or extraction field is changed here.

If Hieu accepts this proposal, the candidate protocol and query specification
advance from 0.2.0 to 0.2.1 under a new decision-log entry, proposed as D-017.
The final reviewed and frozen target remains version 1.0.0 under D-008.

## 2. Reason for the amendment

The retained sentinel diagnostics exposed two translation defects:

1. OpenAlex rejected the literal version-0.2.0 `search=` expressions because
   every governed logical query includes one or more wildcard terms. The
   diagnostic workaround used `search.exact=` but also appended `~1` to quoted
   wildcard phrases. The parameter correction is required; the added proximity
   operator is not, and broadens the quoted phrase.
2. The retained ACM candidate-query diagnostics used `AllField`, which searches
   more broadly than the predeclared Title, Abstract, and Author Keyword union.
   Those diagnostics establish known-item behavior only and cannot demonstrate
   database-query equivalence.

The current diagnostics remain useful provenance and must not be deleted, but
they cannot serve as the acceptance evidence for protocol 0.2.1 or freeze 1.0.0.

## 3. Primary syntax authorities

- OpenAlex Search documentation:
  https://help.openalex.org/api/searching/
  - Wildcards require the unstemmed `search.exact` parameter.
  - At least three characters must precede a wildcard and leading wildcards are
    unsupported.
  - Wildcards are supported inside quoted multiword phrases and preserve phrase
    adjacency.
  - `~N` changes a quoted phrase into a proximity expression that may permit
    reordering or separation.
  - Request URLs are limited to approximately 4 KB; oversized Boolean queries
    may be split into algebraically equivalent OR chunks and unioned by work ID.
- ACM Digital Library user guide:
  https://libraries.acm.org/binaries/content/assets/libraries/acm-digital-library-user-guide.pdf
  - Advanced Search exposes distinct Title, Abstract, and Author Keyword fields
    and supports multiple field rows.
- Semantic Scholar Academic Graph API documentation and tutorial:
  https://api.semanticscholar.org/api-docs/
  https://www.semanticscholar.org/product/api/tutorial
  - Bulk paper search matches title and abstract, supports its documented query
    operators, and uses continuation-token pagination.

These sources govern source-specific syntax only. Consulting them is not an
official literature search and does not authorize result inspection.

## 4. Proposed normative changes

### 4.1 OpenAlex

For OpenAlex A1, A2, A3, B1, C1, and C2, version 0.2.1 must require all of the
following:

1. Use `search.exact=<url-encoded-expanded-query>` instead of `search=`. The
   governed expressions contain wildcard terms, so the default stemmed search
   is not a valid execution form.
2. Preserve the existing uppercase Boolean operators, parentheses, quoted
   phrases, and trailing wildcard terms. Do not add synonyms, fuzzy matching,
   semantic search, or other expansion.
3. Keep wildcarded multiword phrases quoted and adjacent. Do not append `~1` or
   any other `~N` proximity suffix merely to make a wildcard phrase executable.
4. Record that `search.exact` makes the full OpenAlex expression unstemmed. This
   is an explicit source-specific operational translation of the governed
   terms, not a change to the logical query or a claim of cross-database
   coverage equivalence.
5. Before execution, calculate the complete encoded request URL length. If it
   exceeds OpenAlex's approximately 4-KB limit, split only OR alternatives while
   duplicating every unchanged conjunct and filter, execute every ordered
   subrequest, and take the set union of unique OpenAlex work IDs. Preserve the
   decoded subqueries, credential-free canonical URLs, responses, hashes, and
   union manifest under the same logical query ID. Do not truncate a query or
   drop a term to fit the limit.

The credential-free request pattern becomes:

```text
https://api.openalex.org/works?search.exact=<url-encoded-expanded-query>&filter=to_publication_date:2026-08-16&per_page=100&cursor=*
```

The existing field-scope disclosure remains unchanged: OpenAlex searches title,
abstract, and full text, and its source-specific yield is reported separately.

### 4.2 ACM Digital Library

For ACM A1, A2, A3, B1, C1, and C2, version 0.2.1 must define the governed
search surface as this exact set union:

```text
Title(expanded query) OR Abstract(expanded query) OR Author Keyword(expanded query)
```

The following rules apply:

1. Search the ACM Guide to Computing Literature, not only ACM-hosted full text.
2. Use the official field label `Author Keyword`; the generic label `Keywords`
   is replaced in the specification and execution-log template.
3. The Boolean structure inside each of the three copies of the expanded query
   must be identical.
4. Prefer a single Advanced Search expression containing three field-scoped
   clauses joined by OR, and retain the exact serialized `View Query Syntax`
   output.
5. If the current interface cannot serialize that single OR expression without
   semantic alteration, execute the Title, Abstract, and Author Keyword clauses
   as three documented subruns and union their stable ACM record identifiers.
   Preserve all three exact field-scoped expressions, locators or exports,
   timestamps, hashes, and the deterministic union/deduplication manifest under
   the same logical query ID.
6. `Anywhere`, `AllField`, and full-text query forms are not governed execution
   forms and cannot satisfy semantic-equivalence or sentinel-recall acceptance.
   They may be retained only when explicitly labelled as diagnostics.
7. A collection selector such as `expand=all` may be retained when it selects
   the ACM Guide. It does not make an `AllField` expression field-equivalent.

Selecting `Anywhere` or `AllField` as the governed surface would materially
broaden the method and is outside this narrow amendment. That alternative would
require Hieu to approve a separately justified candidate version 0.3.0 and a
complete new calibration.

### 4.3 Semantic Scholar

The Semantic Scholar form remains unchanged: use Academic Graph bulk paper
search over title and abstract; translate governed Boolean AND and OR using the
documented `+` and `|` operators; preserve quoted phrases, prefix wildcards, and
parentheses; retain the existing cutoff handling and follow every continuation
token.

Only its references to the candidate protocol and query specification advance
to 0.2.1. This amendment must not silently introduce the relevance-search
endpoint, semantic expansion, different fields, or a new filter.

## 5. Version impact

| Artifact | Current | Proposed after Hieu approval | Reason |
| --- | --- | --- | --- |
| SLR protocol | 0.2.0 | 0.2.1 | Source-specific syntax correction before freeze |
| Query specification | 0.2.0 | 0.2.1 | Correct OpenAlex and clarify ACM execution forms |
| Sentinel evidence schema | 1.1.0 | 1.1.0 | Evidence shape is unchanged |
| Screening criteria | 0.1.0 | 0.1.0 | Eligibility semantics are unchanged; update protocol link only |
| Literature matrix schema | 0.2.0 | 0.2.0 | Extraction schema is unchanged; update protocol link only |
| Final frozen protocol | Not frozen | 1.0.0 target unchanged | Requires independent review and D-008 acceptance |

This is a patch-level candidate amendment because it corrects and constrains
source translations before any official result list has been executed or
inspected. It does not change the review's scientific scope.

## 6. Artifacts affected after approval

Acceptance of D-017 would require coordinated updates to:

- `research/literature-protocol.md`: metadata; Sections 6, 7, 17, 18, 19, and 20.
- `research/literature-search-queries.md`: metadata; governed-query version
  reference; ACM, OpenAlex, and Semantic Scholar execution sections; syntax
  authorities; version history.
- `research/decision-log.md`: add D-017 with owner approval, rationale, version
  impact, evidence invalidation, and no-official-search declaration.
- `research/literature-search-log.template.csv`: set both version columns to
  0.2.1 across all 24 still-blocked rows and use
  `Title; Abstract; Author Keyword` for ACM.
- `research/slr-sentinel-evidence.template.json`: update the candidate protocol
  value to 0.2.1 without changing schema version 1.1.0.
- `research/SLR-REVIEWER-RUNBOOK.md`: identify candidate 0.2.1 and require the
  exact OpenAlex and ACM calibration forms above.
- `research/evidence/slr-sentinel-captures/README.md`: record D-017 and label the
  current OpenAlex `~1` and ACM `AllField` runs diagnostic-only.
- `research/literature-screening-criteria.md`: update only its protocol linkage
  to 0.2.1.
- `research/literature-matrix.md`: update only its protocol linkage to 0.2.1.
- `main.tex`: report the 0.2.1 candidate and disclose the corrected source
  translations without claiming a completed review.

The currently governed version-0.2.0 files must remain unchanged until Hieu
accepts the decision. This proposal itself is not an authorization to make those
updates.

## 7. Evidence invalidation and mandatory rerun

After Hieu accepts D-017, all six current sentinel evidence bundles must be
regenerated as protocol-0.2.1 artifacts before independent review:

1. Retain the existing protocol-0.2.0 JSON files and capture notes as historical
   diagnostic provenance; do not present them as passing evidence and do not
   relabel them as 0.2.1.
2. Rerun each sentinel's governed OpenAlex candidate-query check with
   `search.exact`, quoted wildcard phrases, and no compatibility `~1` suffix.
3. Rerun each sentinel's governed ACM candidate-query check using the exact
   Title/Abstract/Author Keyword union. An `AllField` result cannot substitute.
4. For an internally consistent evidence bundle, rerun and recapture the
   four-source sentinel checks for all six sentinels under the accepted 0.2.1
   candidate. At minimum, every indexed source must have the runs required by
   the protocol and runbook.
5. Regenerate `research/evidence/slr-sentinel/S-001.json` through `S-006.json`,
   rebuild `research/literature-sentinel-recall.csv`, and recompute every pinned
   SHA-256 digest. The ledger and JSON content must agree exactly.
6. Preserve official source locators, exact query text, canonical UTC execution
   timestamps, result counts, reviewer identity, and factual indexing or access
   classifications. Do not fabricate a zero or reuse a stale hash.
7. Keep `official_search_executed=false` and
   `candidate_results_screened=false`. Sentinel-only known-item calibration is
   allowed; inspecting or screening the official result list is not.

Any unavailable source or missing required team credential remains a failed
access preflight. It must be documented and resolved; it cannot be waived by
changing an artifact label or by reusing an unauthenticated diagnostic.

## 8. Validator and test impact after approval

The amendment should be enforced with offline fixtures and no live search calls:

- `research/validate-search-queries.mjs` and its tests must require candidate
  versions 0.2.1, require wildcard-bearing OpenAlex expressions to use
  `search.exact`, reject compatibility `~N` suffixes on quoted wildcard phrases,
  require the ACM field union, reject `AllField` as governed evidence, and keep
  all 24 execution rows blocked.
- `research/validate-literature-protocol.mjs` and its tests must accept the
  governed 0.2.1 candidate or reviewed 1.0.0 state, require D-017 and the updated
  query link, and continue to reject any implied official execution or result
  inspection.
- `research/verify-slr-sentinel-evidence.mjs` and its tests must require
  protocol 0.2.1 for candidate evidence and enforce the corrected OpenAlex and
  ACM execution forms.
- `research/freeze-literature-protocol.mjs` and its tests must freeze candidate
  0.2.1 to 1.0.0 while preserving both D-016 and D-017 in history.
- The screening-criteria, literature-matrix, and signed-review validators and
  tests must update only their expected candidate protocol linkage where
  applicable; their own schema versions remain unchanged.

## 9. Required decisions and review gates

### Hieu, protocol owner

Only Hieu may accept the proposed D-017 and authorize candidate version 0.2.1.
That acceptance must explicitly confirm:

- use of OpenAlex `search.exact` and its global unstemmed behavior for all six
  governed expressions;
- removal of diagnostic `~1` proximity suffixes from wildcard phrases;
- the ACM Title/Abstract/Author Keyword set union as the governed field scope;
- invalidation of current 0.2.0 captures as freeze-acceptance evidence; and
- authorization to regenerate the six sentinel evidence bundles under 0.2.1.

Until those decisions are recorded, implementation must not claim that this
proposal is approved.

### Independent SLR Reviewer

After implementation and rerun, the named Independent SLR Reviewer must:

- verify semantic equivalence of every database-specific form;
- inspect the exact 0.2.1 queries, regenerated source evidence, ledger, hashes,
  and access classifications;
- confirm every indexed sentinel is retrieved or has a defensible documented
  indexing reason; and
- sign or approve the exact governed commit using the repository's independent
  review mechanism.

Hieu's protocol-owner acceptance cannot substitute for this independent review.
The official SLR-102 search remains blocked until the reviewer accepts the exact
evidence bundle, D-008 is accepted, and the protocol is frozen as version 1.0.0.
