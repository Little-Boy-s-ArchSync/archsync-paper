# SLR-101 sentinel source-run notes

These notes accompany the six schema-1.1.0 JSON artifacts generated from real
sentinel-only runs on 2026-08-25 UTC. The operator used the authorized browser
session of the Independent SLR Reviewer. No official SLR-102 result set was
executed or screened.

D-019 accepted candidate protocol 0.2.1 on 2026-08-28. Every capture described
here remains immutable protocol-0.2.0 diagnostic provenance. It is not
freeze-acceptance evidence and must not be relabelled. The independent reviewer
must rerun all six four-source bundles using the governed 0.2.1 translations.

## Access and credential boundary

- IEEE Xplore and ACM Digital Library were queried through the authenticated
  browser session. ACM checks used `expand=all` so the ACM Guide to Computing
  Literature, rather than only ACM full text, was searched.
- OpenAlex DOI and diagnostic candidate queries used the team account API key
  only at runtime in an Authorization header. The key was not printed or
  persisted; every retained URL is credential-free.
- Semantic Scholar DOI singleton and web exact-title checks were observable,
  but no team-controlled `x-api-key` was available. An unauthenticated bulk
  sentinel query returned HTTP 429 at 2026-08-25T18:20:45Z. Under the runbook,
  this is an access-preflight failure and cannot authorize freeze. The assigned
  reviewer explicitly authorized unauthenticated Semantic Scholar requests
  after confirming that API-key access was unavailable; that operational
  authorization does not amend the candidate protocol's API-key requirement.

## Query-translation findings

- OpenAlex rejected the literal version-0.2.0 `search=` expansion with HTTP
  400 because wildcard phrases are invalid there and wildcard queries now
  require `search.exact=`. Diagnostic sentinel runs used `search.exact=`
  and `~1` adjacency for wildcard phrases, with the exact executed string
  retained in each JSON. This compatibility translation needs a formal
  candidate amendment before approval.
- ACM all-fields sentinel diagnostics are retained where run. They demonstrate
  known-item behavior but are broader than the protocol's planned
  Title/Abstract/Author-Keyword field union and therefore do not by themselves
  prove database-query equivalence.
- Candidate diagnostics did not retrieve S-003 or S-005 in the tested OpenAlex
  or ACM forms, and OpenAlex A3 did not retrieve S-001. These are genuine
  calibration findings, not zero-value placeholders.

## Metadata exceptions

- ACM Guide indexes S-003 under surrogate locator
  https://dl.acm.org/doi/10.5555/1573951.1573954 even though its canonical DOI
  lookup returns zero.
- Semantic Scholar indexes S-005 at
  https://www.semanticscholar.org/paper/Introducing-an-Architectural-Conformance-Process-in-Pinto-Terra/931bc335706870d4a88317ceae6a934ed69d35f8
  but its canonical DOI endpoint returns 404.

The deterministic JSON/ledger validators do not test API authentication,
field-scope equivalence, blind calibration, or human acceptance. A passing
local validator must not be interpreted as review approval while the blockers
above remain.
