# ArchSync Literature Search Query Specification

| Field | Value |
| --- | --- |
| Task | SLR-102 |
| Query specification version | 0.2.1 |
| Protocol version | 0.2.1 |
| Status | Designed - execution blocked |
| Prepared date | 2026-08-18 |
| Search cutoff | 2026-08-16 inclusive |
| Owner | Hieu |
| Depends on | SLR-101 freeze 1.0.0 |
| Official search execution | Not started |
| Search results inspected | No |

This specification translates Section 6 of `literature-protocol.md` into six
versioned logical queries and database-specific execution forms. It defines the
queries but does not contain search results. No query may be executed as an
official search, and no result count may be recorded, until SLR-101 is reviewed
and frozen at version 1.0.0.

## 1. Integrity boundary

- The six logical queries below are the only governed SLR-102 search strings.
- IEEE Xplore, ACM Digital Library, OpenAlex, and Semantic Scholar
  are all required by the protocol. SLR-102 is not complete if one is omitted.
- A syntax check must not be used to inspect, screen, or tune against candidate
  results before the protocol freeze.
- Every executed query must create one row in
  `literature-search-log.csv` with its database, exact expanded query, UTC
  timestamp, fields, filters, result count, export path, export SHA-256, and
  operator.
- The template `literature-search-log.template.csv` is planning metadata, not
  execution evidence.

## 2. Versioned keyword groups

### K1: Architecture drift and erosion

```text
"architecture drift" OR "architectural drift" OR "architecture erosion"
OR "architectural erosion" OR "architecture decay" OR "architectural decay"
OR "architecture divergence" OR "architectural degradation"
```

### K2: Architecture conformance and compliance

```text
"architecture conformance" OR "architectural conformance"
OR "architecture compliance" OR "architectural compliance"
OR "architecture violation*" OR "architectural violation*"
OR "dependency constraint*"
```

### K3: Architecture reconstruction and recovery

```text
"software architecture reconstruction" OR "architecture reconstruction"
OR "architectural reconstruction" OR "architecture recovery"
OR "architectural recovery" OR "reflexion model*"
```

### K4: Continuous integration governance

```text
"continuous integration" OR "continuous delivery" OR "CI/CD"
OR "pull request*" OR "merge gate*" OR "quality gate*"
OR "architecture governance" OR "continuous architecture"
```

### K5: AI coding agents

```text
"AI coding agent*" OR "coding agent*" OR "large language model*" OR LLM
OR "generative AI" OR "AI-assisted development" OR "AI assisted development"
OR "AI-generated code" OR "code generation"
```

### K6: Evidence-grounded explanation and repair

```text
"evidence-grounded" OR "evidence grounded" OR "source evidence"
OR "evidence localization" OR explanation OR "root cause"
OR repair OR remediation OR "repair verification" OR "human approval"
```

## 3. Shared clauses

The population clause is:

```text
P = "software architecture" OR "software architectural"
    OR "architectural design" OR "architecture model*"
```

The deterministic-analysis clause is:

```text
D = detect* OR analy* OR check* OR monitor* OR govern*
    OR reconstruct* OR recover*
```

The repository-evidence clause is:

```text
E = "source code" OR "dependency graph*" OR "version control"
    OR commit* OR "pull request*" OR repository
```

## 4. Governed logical queries

The identifiers remain stable within version 0.2.1. Search-A is the union of
A1, A2, and A3; Search-B is B1; Search-C is the union of C1 and C2.

### A1: Search-A drift and erosion

```text
(P) AND (K1) AND (D)
```

### A2: Search-A conformance and compliance

```text
(P) AND (K2) AND (D)
```

### A3: Search-A reconstruction and recovery

```text
(P) AND (K3) AND (D)
```

### B1: Search-B CI governance and repository evidence

```text
(P)
AND ("architecture drift" OR "architecture conformance"
     OR "architectural violation*")
AND (K4)
AND (E)
```

### C1: Search-C AI coding agents

```text
(P)
AND (drift OR erosion OR conformance OR governance OR violation*)
AND (K5)
```

### C2: Search-C evidence-grounded repair

```text
(P)
AND (drift OR erosion OR conformance OR governance OR violation*)
AND (K6)
```

Before execution, the operator expands `P`, `D`, `E`, and `K1` through `K6`
verbatim. The expanded string, not the symbolic form, is written to the search
log. Splitting Search-A and Search-C preserves their Boolean union while keeping
each IEEE Xplore clause below its documented term limit.

## 5. Database-specific execution forms

### IEEE Xplore

- Interface: Advanced Search or Command Search.
- Fields: Document Title, Abstract, and Author Keywords.
- Form: execute the expanded A1, A2, A3, B1, C1, and C2 string once in each
  supported metadata field and union the three field result sets for the same
  query ID. If the interface serializes the field rows into one command string,
  store that exact serialized string in the log.
- Filters: journals and conferences; publication date no later than the fixed
  cutoff; no language filter; no subscribed-content-only filter.
- Execution guard: respect the documented 40-term total and 15-term per-clause
  limits. If the interface rejects an expanded query, stop and amend the
  candidate before viewing results.

### ACM Digital Library

- Interface: Advanced Search.
- Collection: The ACM Guide to Computing Literature, not only ACM full text.
- Fields: Title, Abstract, and Author Keyword.
- Form: execute the exact set union `Title(expanded query) OR Abstract(expanded
  query) OR Author Keyword(expanded query)`. The Boolean relationship inside
  each copy is unchanged. Prefer one Advanced Search expression and retain the
  exact View Query Syntax serialization. If the interface cannot serialize the
  union without changing its meaning, execute the three field-scoped clauses as
  documented subruns and union stable ACM record identifiers deterministically.
  `Anywhere`, `AllField`, and full-text forms are diagnostics only and cannot
  satisfy the governed query.
- Filters: publication date no later than the fixed cutoff; no publisher,
  content-access, or language filter.

### OpenAlex

- Interface: Works API advanced search at `https://api.openalex.org/works`.
- Search surface: the governed, globally unstemmed `search.exact` parameter over
  title, abstract, and full text as documented by OpenAlex. This field-scope
  expansion is predeclared; it does not change the Boolean concepts. OpenAlex
  keywords are retained as metadata when available but are not claimed as a
  separate searched field.
- Form: preserve uppercase Boolean operators, parentheses, quoted phrases, and
  trailing wildcards without semantic expansion. Do not append `~1` or another
  `~N` suffix to quoted wildcard phrases. Store the decoded expression and a
  canonical request URL with credentials removed.
- Filters: `to_publication_date:2026-08-16`; no language, open-access, venue, or
  work-type filter. Eligibility is applied after the immutable export.
- Pagination: request 100 records per page and follow the returned cursor until
  exhausted. Preserve every raw JSON response. `result_count` is the number of
  unique OpenAlex work IDs in the complete export; retain the first-response
  metadata count in `notes` for comparison.
- API guard: read a team-controlled key from a local secret store or environment
  variable and inject it as OpenAlex's required `api_key` query parameter only
  inside the HTTP client. Never persist the unredacted authenticated URL. Strip
  `api_key` before writing the search log, evidence locator, diagnostic output,
  screenshot, issue, commit, or export manifest.
- URL-length guard: calculate the fully encoded URL before execution. If it
  exceeds approximately 4 KB, split only OR alternatives, duplicate every
  unchanged conjunct and filter, execute every ordered subrequest, and union
  unique OpenAlex work IDs. Preserve each decoded subquery, canonical URL,
  response hash, and the union/deduplication manifest. Never truncate terms.
- Request pattern before runtime credential injection: `https://api.openalex.org/works?search.exact=<url-encoded-expanded-query>&filter=to_publication_date:2026-08-16&per_page=100&cursor=*`.

### Semantic Scholar

- Interface: Academic Graph bulk paper search at
  `https://api.semanticscholar.org/graph/v1/paper/search/bulk`.
- Search surface: title and abstract, as documented for the bulk endpoint.
- Form: translate Boolean `AND` to `+`, Boolean `OR` to `|`, retain quoted
  phrases, prefixes, and parentheses, and URL-encode the fully expanded query.
- Filters: `year=-2026`; no language, open-access, venue, field-of-study, or
  publication-type filter. Records dated after 2026-08-16 are removed
  deterministically after export and before screening, with the removal count
  retained in the manifest.
- Pagination: request the governed metadata fields and follow every returned
  continuation token. Preserve each raw JSON response. `result_count` is the
  number of unique Semantic Scholar paper IDs in the complete pre-cutoff export;
  retain the endpoint's reported total in `notes` because it may be estimated.
- API guard: a team-controlled free API key is required for governed execution
  and must be supplied through the `x-api-key` header or environment, never in
  a committed URL or artifact. Unauthenticated shared throttling is not an
  acceptable execution mode for the official search.
- Request pattern: `https://api.semanticscholar.org/graph/v1/paper/search/bulk?query=<url-encoded-expanded-query>&year=-2026&fields=paperId,externalIds,title,abstract,authors,year,publicationDate,venue,publicationTypes,url,citationCount`.

## 6. Execution record contract

The official log filename is `research/literature-search-log.csv`. Each of the
24 database-query pairs must have exactly one row. `executed_at_utc` uses
`YYYY-MM-DDTHH:MM:SSZ`; `result_count` is a non-negative integer copied before
opening individual records; `export_sha256` is lowercase SHA-256; and
`exact_query` contains the database-expanded string actually executed.

The current template keeps execution fields empty and status
`blocked-slr-101`. Replacing them is allowed only after SLR-101 is frozen. A
zero result count is valid evidence only when it was observed during a real
authorized execution; it must never be used as a placeholder.

## 7. Syntax authority

- IEEE Xplore search guide:
  https://ieeexplore.ieee.org/Xplorehelp/downloads/user-guides/IEEE_Xplore_Searching_and_Saving_Searches.pdf
- IEEE Xplore advanced search limits:
  https://ieeexplore.ieee.org/Xplorehelp/downloads/user-guides/IEEE_Xplore_Advanced_Search_Tips.pdf
- ACM Digital Library user guide:
  https://libraries.acm.org/binaries/content/assets/libraries/new_acm-digital-library-user-guide.pdf
- OpenAlex search and authentication documentation:
  https://help.openalex.org/api/searching/ and
  https://developers.openalex.org/api-reference/authentication
- Semantic Scholar Academic Graph API documentation:
  https://api.semanticscholar.org/api-docs/
- Semantic Scholar API key request:
  https://www.semanticscholar.org/product/api#api-key

These sources govern syntax only. They are not SLR search results and do not
authorize screening.

## 8. Version history

| Version | Date | Decision | Change |
| --- | --- | --- | --- |
| 0.2.1 | 2026-08-28 | D-019 | Use unstemmed OpenAlex `search.exact` without diagnostic proximity suffixes; constrain ACM to the Title/Abstract/Author Keyword union; keep official execution blocked |
| 0.2.0 | 2026-08-20 | D-016 | Replace inaccessible Scopus and Web of Science forms with credential-safe, paginated OpenAlex and Semantic Scholar API execution contracts; no official search executed |
| 0.1.0 | 2026-08-18 | D-009 | Define six keyword groups, six logical queries, four database translations, filters, and the blocked execution contract |
