# ArchSync Literature Matrix Contract

| Field | Value |
| --- | --- |
| Task | SLR-104 |
| Matrix version | 0.2.0 |
| Protocol version | 0.2.0 |
| Status | Schema complete - population blocked |
| Prepared date | 2026-08-18 |
| Search cutoff | 2026-08-16 inclusive |
| Owner | Hieu |
| Depends on | SLR-102 1.0.0 and SLR-103 1.0.0 |
| Official search | Not started |
| Included-study set | Not available |
| Extracted records | 0 |
| Search results inspected | No |

This document defines the versioned SLR-104 literature matrix. The governed
CSV is `literature-matrix.csv`. It currently contains only its header because
SLR-101 has not been independently approved and frozen, the official search has
not started, and no included-study set exists. Zero rows is an integrity
condition, not missing work and not a literature result.

SLR-104 completes the extraction structure only. It does not authorize an
official database search, screening, data extraction, or a claim about the
number, quality, coverage, or findings of publications.

## 1. Unit and identity

One matrix row represents one included publication. Publications that report
the same study use different `record_id` values and the same `study_id`. The
matrix therefore preserves the protocol distinction between publication-level
selection and study-level synthesis.

Identifiers are stable within one frozen review:

- `record_id` uses `LIT-0001`, `LIT-0002`, and so on and must match the
  corresponding frozen record in `literature-records.csv`.
- `study_id` uses `STUDY-0001`, `STUDY-0002`, and so on.
- `record_sha256` is the lowercase SHA-256 digest of the immutable canonical
  record used for screening and extraction.

## 2. Field contract

| Column | Required meaning |
| --- | --- |
| `matrix_version` | Exact schema version used by the row. |
| `record_id` | Stable publication identifier linked to screening evidence. |
| `study_id` | Stable synthesis identifier shared by companion publications. |
| `citation` | Complete human-readable citation sufficient to identify the publication. |
| `title` | Publication title exactly as verified from the version of record. |
| `authors` | Ordered author list from the version of record. |
| `publication_year` | Governed publication year, not database indexing year. |
| `venue` | Journal, conference, or workshop name. |
| `evidence_class` | `primary-study` or `secondary-context`. |
| `publication_type` | Reported study record type, such as journal article or conference paper. |
| `doi` | Normalized DOI without `doi:` or `https://doi.org/`; use `NR` only when no DOI exists. |
| `canonical_url` | HTTPS DOI, publisher, or official repository URL; use `NR` only when no URL exists. |
| `source_databases` | Semicolon-separated governed discovery sources. |
| `method` | Research or evaluation method reported by the publication. |
| `system` | Evaluated software system, repository, product, or population. |
| `language` | Programming or modeling language in scope. |
| `dataset` | Dataset, corpus, sample, or case selection used by the publication. |
| `evidence_source` | Code, dependency graph, Git, IaC, runtime, telemetry, document, or human evidence. |
| `metric` | Reported metric with unit or denominator where available. |
| `limitation` | Author-reported limitation or extraction-level threat. |
| `relevance` | Factual relevance to ArchSync's governed scope, without novelty inference. |
| `claim_supported` | Governed claim ID, semicolon-separated IDs, or `none`. |
| `slr_rqs` | One or more of `SLR-RQ1` through `SLR-RQ6`. |
| `extraction_source_location` | Page, section, table, figure, appendix, abstract, or publisher-metadata location supporting the row. |
| `extracted_by_role` | Role accountable for the first extraction. |
| `extracted_by_id` | Stable team identifier for the extractor. |
| `extracted_at_utc` | Canonical UTC extraction timestamp. |
| `verified_by_role` | Role accountable for independent field verification. |
| `verified_by_id` | Stable identifier of a person distinct from the extractor. |
| `verified_at_utc` | Canonical UTC verification timestamp, not earlier than extraction. |
| `record_sha256` | Digest linking the row to the immutable screened record. |

The minimum user-facing fields requested by SLR-104 are present explicitly:
`citation`, `method`, `system`, `language`, `dataset`, `evidence_source`,
`metric`, `limitation`, `relevance`, and `claim_supported`. The remaining fields
provide identity, provenance, reviewer independence, and auditability.

## 3. DOI and URL rule

Every populated row must contain at least one verified persistent locator:

- a normalized DOI matching `10.<registrant>/<suffix>`; or
- a canonical HTTPS URL for the DOI, publisher version, or official repository.

If a publication has no DOI, record `NR` in `doi` and provide
`canonical_url`. If no canonical URL exists, record `NR` in `canonical_url`
and provide the DOI. Both fields cannot be `NR`, empty, or `NA`.

Database search-result URLs are discovery provenance and do not replace the
canonical publication URL. Database origins remain in `source_databases`.

## 4. Missing and inapplicable information

Missing values are never guessed:

- `NR` means the full text or authoritative metadata did not report the value.
- `NA:<reason>` means the field is structurally inapplicable and includes a
  short reason after the colon.

`NR` and `NA:<reason>` are allowed only for the publication-derived extraction
fields from `method` through `relevance`, plus DOI or URL under Section 3.
`claim_supported` uses `none` when no governed claim consumes the row. Identity,
source, SLR-RQ, reviewer, timestamp, location, and hash fields cannot use
missing-value tokens.

## 5. Audit and verification workflow

1. The extractor copies identity and provenance from the frozen canonical
   record and screening decision.
2. The extractor records each substantive value with an exact source location.
3. A second person verifies the publication, persistent locator, every
   extracted field, linked SLR-RQs, and claim mapping against the same full
   text.
4. The verifier records a UTC timestamp only after all conflicts are resolved.
5. The matrix validator checks schema, identifiers, locator semantics,
   controlled values, reviewer separation, timestamps, and hashes.
6. The later `literature-manifest.json` pins the final CSV digest together with
   the protocol, record set, screening, quality, and extraction artifacts.

The verifier cannot use the same `verified_by_id` as the extractor's
`extracted_by_id`. AI and deterministic tools may help propose or check fields,
but they cannot act as the named human verifier, replace the real publication,
or infer missing research data. Material AI assistance follows
`AI-EVIDENCE-POLICY.md` and is disclosed in the review note or governed field
available during execution.

## 6. Claim traceability

`claim_supported` is `none` when a publication is relevant but is not used to
support a paper claim. Otherwise it contains one or more governed claim IDs,
such as `C-001`, `P-001`, or a later `SLR-CLAIM-001`, separated by semicolons.
This field records intended claim use; it does not make the claim true by
itself. A literature-derived paper claim additionally requires a claim ledger
entry, the frozen SLR manifest, the underlying publication, and a verified
matrix row.

## 7. Population gate and task status

The SLR-104 schema is complete at version 0.2.0. Population remains blocked
until all of the following are true:

- SLR-101 is independently approved and frozen at 1.0.0;
- SLR-102 search execution and immutable exports are complete;
- SLR-103 criteria are frozen and dual screening has produced the final
  included-study set; and
- extraction is performed by one reviewer and verified by another.

Until those gates pass, `literature-matrix.csv` must contain exactly one row:
the header. No sentinel record, existing Related Work citation, placeholder,
mock paper, or expected result may be inserted to make the matrix look
complete.

## 8. Validation

Run:

```bash
node research/validate-literature-matrix.mjs
node --test research/validate-literature-matrix.test.mjs
```

The current expected result is a valid version 0.2.0 schema with zero extracted
records and population blocked by the governed upstream gates.

## 9. Version history

| Version | Date | Decision | Change |
| --- | --- | --- | --- |
| 0.2.0 | 2026-08-20 | D-016 | Replace Scopus and Web of Science controlled source values with OpenAlex and Semantic Scholar before population starts |
| 0.1.0 | 2026-08-18 | D-011 | Define the auditable publication matrix, persistent-locator rule, missing-value policy, reviewer separation, and zero-row population gate |
