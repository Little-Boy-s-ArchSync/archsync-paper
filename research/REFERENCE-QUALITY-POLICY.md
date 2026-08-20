# ArchSync Reference Quality and Recency Policy

| Field | Value |
| --- | --- |
| Task | GOV-LIT-001 |
| Policy version | 1.0.0 |
| Status | Frozen |
| Effective date | 2026-08-20 |
| Owner | Hieu |
| Decision | D-014 |
| Applies to | New papers proposed for Background, Related Work, discussion, sentinel justification, and literature-search seeds |

## 1. Purpose and boundary

This policy governs how the team verifies and prioritizes papers proposed as
references. It prevents a convenient Google Scholar result, an AI-generated
citation, or an unexplained venue rank from being treated as sufficient
evidence of publication quality.

The policy does not replace topical relevance, the SLR eligibility criteria,
or the study-level QA1--QA6 assessment. Quartile and publication age must not be
used to silently remove a relevant record from the systematic-review result
set. They control citation priority and evidential weight after the governed
search and screening rules have been applied.

## 2. Mandatory reference-selection rules

Every new paper proposed for citation must pass the following checks before it
is used to support a manuscript claim:

- RQF-01 Identity: verify the exact title, ordered authors, publication date,
  venue, publication type, DOI or canonical publisher URL, and peer-review
  status against an authoritative source.
- RQF-02 Relevance: record the paper claim or research question the publication
  supports. Ranking never substitutes for direct relevance.
- RQF-03 Recency: prefer publications from the five publication years ending at
  the governed 2026 search cutoff, namely 2022--2026. A 2021 publication may be
  treated as within the rolling five-year interval only when its complete
  publication date is on or after 2021-08-16 and that date is retained.
- RQF-04 Foundational exception: an older publication may be selected only when
  it introduces a foundational term, method, model, benchmark, standard, or
  directly necessary historical result. The ledger must contain a factual
  justification and an evidence location. Age or citation count alone does not
  establish foundational status.
- RQF-05 Journal quality: for journal papers, Q1 is the preferred source class.
  Q1 and Q2 are treated as high-ranked. A Q3, Q4, discontinued, or unranked
  journal may support a claim only through a documented exception showing why
  no more appropriate Q1 or Q2 source supports the same point.
- RQF-06 Ranking context: every quartile must identify the ranking system,
  ranking year, and subject category. The team must not combine an SJR quartile
  and a Journal Citation Reports quartile without naming which value is used.
- RQF-07 Conference handling: journal quartiles do not apply to conference or
  workshop papers. Record `NA:conference` for quartile and verify the venue,
  peer-review status, indexing, recognized venue ranking when available, and
  relevance. A seminal conference paper may use the foundational exception.
- RQF-08 Evidence: retain the official ranking or indexing URL, check time,
  checker identity, and a source capture or export with its SHA-256 when the
  governed task requires an immutable artifact. Missing information is recorded
  as `NR`; it is never guessed.

## 3. Rapid Journal Quality Check workflow

Rapid Journal Quality Check is the required browser-extension support tool for
the initial journal-quality check when the extension recognizes the venue. The
checker records whether the extension was used and the ranking it displayed.
The governed tool locator is
https://chromewebstore.google.com/detail/rapid-journal-quality-che/mfkbhgdamgfcifnhcdebfahkgnbkagmo.

The extension display is a discovery aid, not the final evidence source. Before
accepting the paper, verify the displayed journal identity and quartile against
the named underlying ranking source, such as the Scopus source profile or SJR
for an SJR quartile, or the Web of Science Journal Citation Reports profile for
a JCR quartile. Record the ranking year and subject category because one journal
can have different quartiles across years, categories, and ranking systems.

Use one of these controlled extension statuses:

- `checked`: the extension recognized the journal and its displayed information
  was checked against the recorded ranking source;
- `not-supported`: the extension did not provide a usable result, so the venue
  was checked directly in an authoritative ranking source; or
- `not-applicable`: the publication is not a journal paper.

An extension screenshot without the underlying ranking source, year, and
category is not sufficient venue-quality evidence.

## 4. Selection decisions

The final reference decision uses one of three controlled values:

- `accept`: the publication is directly relevant and satisfies the default
  recency and venue-quality preference;
- `accept-exception`: the publication is directly relevant but is older than
  the default window or lacks Q1/Q2 journal status, and the governed exception
  fields contain a factual justification; or
- `reject-as-reference`: the publication is irrelevant, unverifiable, or a
  stronger and more appropriate source should be used for the proposed claim.

Q1 status does not make an irrelevant paper acceptable. Conversely, a relevant
record retrieved by the systematic search is not deleted merely because its
journal is not Q1 or because it is older than five years. Such records remain
in the review flow and receive their governed eligibility, QA, extraction, and
synthesis treatment.

## 5. Required record

`reference-quality-check.template.csv` defines the required fields. A populated
record must include publication identity, claim use, recency status,
foundational status and justification, Rapid Journal Quality Check status,
ranking system/year/category, quartile or conference rank, indexing status,
official evidence location, human checker, check time, and final decision.

No placeholder, expected quartile, search-result snippet, AI assertion, or
manually invented value may be entered as evidence. AI may operate the browser
and prepare the record under `AI-EVIDENCE-POLICY.md`, but the named member must
verify the real source and accept the final record.

## 6. Relationship to the systematic review

The official search continues to use the date and eligibility rules frozen in
`literature-protocol.md`. There is no lower publication-year exclusion and no
quartile exclusion in I1--I8 or E01--E10. This preserves older foundational
work and prevents venue-based selection bias.

After inclusion, publication age, indexing, and venue quality may be extracted
for description or sensitivity analysis. They cannot replace QA1--QA6, and the
team must not claim that Q1 alone establishes methodological rigor.

## 7. Version history

| Version | Date | Decision | Change |
| --- | --- | --- | --- |
| 1.0.0 | 2026-08-20 | D-014 | Require verified identity, Q1-first journal selection, five-year recency, documented foundational exceptions, extension-assisted checking, authoritative ranking evidence, and an explicit SLR non-exclusion boundary |
