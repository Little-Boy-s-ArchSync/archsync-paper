# Approved operational amendment: publication-date precision

| Field | Value |
| --- | --- |
| Amendment identifier | SLR-102-2026-09-13-DATE-PRECISION |
| Status | Approved; appended before execution |
| Governing protocol / query specification | 1.0.0, section 17 / 0.2.2 |
| Frozen accepted commit | `e34054760273a104f0db99c86a4ddd222e509254` |
| Frozen protocol SHA-256 | `030016958fc66ee6eef9ae03e4e1eac2022ba02dc802806dc53c4e3508a596da` |
| Reviewer | Tran Minh Hoang (`an1dee3301`) |
| Reviewer approval / effective UTC | 2026-09-13T08:07:09Z |
| Appended UTC | 2026-09-13T08:09:40Z |
| Proposal | [GitHub comment 5652100071](https://github.com/Little-Boy-s-ArchSync/archsync-paper/issues/24#issuecomment-5652100071) |
| Exact proposal body SHA-256 | `88c0e7d3b4cc1e00a0487ec393acd97b057dc869716d82eeaa651ce9dc67d7a8` |
| Reviewer approval | [GitHub comment 5652121685](https://github.com/Little-Boy-s-ArchSync/archsync-paper/issues/24#issuecomment-5652121685) |
| Affected jobs | IEEE-A1, IEEE-A2, IEEE-A3, IEEE-B1, IEEE-C1, IEEE-C2; ACM-A1, ACM-A2, ACM-A3, ACM-B1, ACM-C1, ACM-C2 |
| Official execution at approval | 0 of 24 jobs; no official records affected |
| Four-source rerun decision | No rerun required: no official jobs or dataset existed at approval |

## Reason and approved operation

The current native interfaces expose IEEE Publication Year separately from
Date Added day controls, and ACM publication filtering at month/year precision.
The reviewer approved the exact operational proposal retained in
[proposal-comment.md](proposal-comment.md). Its body hash is verified against
the approval, whose actual GitHub creation timestamp is the effective UTC above.
Retain the actual interface, query and filter serialization evidence for each
execution. This amendment does not claim that the official campaign has begun.

1. Retrieve IEEE Publication Year through **2026**, retaining all earlier
   available years and the existing journals/conferences filter. Retrieve the
   **ACM Guide through August 2026**, with all earlier dates. IEEE Date Added
   is not substituted as a universal publication-date filter.
2. Preserve every governed term, all three metadata fields and their exact
   unions, all four databases, reviewer roles, eligibility rules, required
   export fields and the seven-day collection window. Introduce no language,
   publisher or access filters.
3. Freeze all **24 raw exports** before opening individual official results,
   metadata repair or screening. Then apply the unchanged **2026-08-16
   inclusive** cutoff in a separate source-date ledger using verified
   publication dates and their original labels and precision. Remove from the
   screening input only records whose supported publication interval is wholly
   later. Retain missing, conflicting or cutoff-spanning dates as unresolved
   for existing metadata verification and I6/E06 screening. Never invent a day
   or discard raw records.
4. Keep native counts, IEEE field overlaps and union counts, exported entries,
   companion publications, cutoff removals and unresolved dates separately
   auditable. Recover available metadata omitted by an export in separate
   derived records with provenance; omission alone does not prove that the
   source reports none.

The separate [source-date ledger specification](source-date-ledger-spec.md)
and [empty template](source-date-ledger.template.csv) implement that accounting
without recording fabricated search or screening results. Mechanical cutoff
classification does not constitute study inclusion or reviewer screening.

## Integrity and execution boundary

This is an appended operational correction under frozen protocol section 17.
The protocol, original calibration, signed review and all pre-existing frozen
source files remain unchanged. Neither the cutoff nor the review scope changes.
OpenAlex and Semantic Scholar retain their governed retrieval procedures.
The existing four-source access gate still applies, and all 24 jobs share the
same seven-day collection window. The no-rerun decision is supported by the
reviewer's explicit zero-execution statement in the retained approval.

The actual execution manifest must reference this amendment, the approval,
its effective UTC and these artifact hashes. If later evidence contradicts the
zero-execution state at approval, stop and obtain an explicit four-source rerun
decision before continuing. Do not overwrite retained raw exports or prior
ledger versions when producing derived metadata or corrections.
