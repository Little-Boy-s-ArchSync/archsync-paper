# Minimal source-date ledger specification

Status: approved operational companion to the appended date-precision amendment. It specifies a later execution artifact; it contains no official result records. Cutoff: `2026-08-16`, inclusive. The CSV template is empty apart from its header.

One row represents one source publication identity, retaining all relevant source/field subrun origins. A repeated hit can share a row only when its origin list is complete; publication companions keep separate identities. Do not perform fuzzy study-level merging in this ledger.

| Column | Required meaning |
| --- | --- |
| `source_record_id` | Actual source accession, DOI or retained source locator; never fabricated. |
| `database` | `IEEE Xplore` or `ACM Digital Library`. |
| `origins_json` | Array of actual logical job IDs, IEEE subfield where relevant, raw export paths, SHA-256 hashes and within-file locations. |
| `source_content_type` | Source-reported type; preserve the governed retrieval filters separately in run records. |
| `date_evidence_json` | All relevant retained source date labels/values, their source URL or raw-file location, capture UTC and evidence SHA-256. Keep publication, event, issue and update dates distinguishable. |
| `selected_date_evidence_id` | Reference to evidence with a verified publication meaning; blank if unresolved. |
| `publication_date_raw` | Exact selected source value, unchanged; blank when none. |
| `date_precision` | `day`, `month`, `quarter`, `year`, `range`, `unknown` or `conflict`. |
| `date_lower_bound` / `date_upper_bound` | ISO dates delimiting all dates supported by the selected evidence. These are bounds, not invented publication dates. Blank for unresolved conflicts/unknown evidence. |
| `cutoff_action` | `ON_OR_BEFORE_CUTOFF`, `AFTER_CUTOFF`, or `DATE_UNRESOLVED`. |
| `reason` | Factual basis and any source-date semantics or unresolved discrepancy. |
| `verification_reference` | Reference to the named human's bundle/date verification when obtained; blank while pending. |
| `verified_at_utc` | Actual verification timestamp or blank. |

**Date meaning.** The ledger must identify which source label establishes publication. IEEE's official help defines journal Date of Publication and conference Date Added differently from conference-event dates. Preserve those labels instead of treating every available date as interchangeable. ACM's actual publication label and any conflicting dates must likewise be retained. Never choose the earliest of arbitrary event, update, issue and publication fields just because it passes the cutoff. [IEEE date definitions](https://ieeexplore.ieee.org/Xplorehelp/working-with-documents/publication-dates)

**Deterministic classification.** An unambiguous exact day has identical bounds. A month, quarter or year spans its entire stated calendar period; an explicit range retains both bounds. Parse only a documented/unambiguous date representation. If the upper bound is on/before the cutoff, classify `ON_OR_BEFORE_CUTOFF`; if the lower bound is after it, classify `AFTER_CUTOFF`. A period spanning the cutoff, missing data, ambiguous notation, incompatible date evidence, or an unverified date-field meaning is `DATE_UNRESOLVED`. Invalid dates must not be coerced into valid ones. [IEEE date precision documentation](https://developer.ieee.org/docs/read/Metadata_API_responses)

**Boundary and counts.** Produce the mechanical classifications only after all 24 raw exports are frozen. Date repair uses existing authorized metadata routes; actual screening decisions remain the two reviewers' responsibility. `ON_OR_BEFORE_CUTOFF` means only that the date condition is met, not that the study is included. `DATE_UNRESOLVED` does not count as eligible or excluded and must not disappear from the screening flow. Maintain the identity-level equation `input = on_or_before + after + unresolved`; separately reconcile provider hits, field overlaps, exported companions and raw entry counts. Preserve every raw input and every later correction to the ledger rather than overwriting its provenance.
