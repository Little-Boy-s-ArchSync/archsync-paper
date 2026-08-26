# ArchSync Reference Quality Audit

| Field | Value |
| --- | --- |
| Task | GOV-LIT-AUDIT-002 |
| Audit version | 0.2.0 |
| Audit date | 2026-08-27 |
| Scope | Every citation retained in `references.bib`, every citation removed from the manuscript, and all six SLR sentinel DOI values |
| Prepared by | AI-assisted source audit authorized by Hieu |
| Human verifier | Hieu - pending exact-record verification |
| Status | Candidate decisions complete; human acceptance pending |
| Governing policy | `REFERENCE-QUALITY-POLICY.md` version 1.0.0 |

## 1. Outcome

The manuscript bibliography now contains ten references:

- six publications are from 2022--2024;
- four older publications are retained only as direct foundations for reflexion
  models, conformance-rule comparison, dependency constraints, and architecture
  reconstruction;
- two current 2024 publications were added for industrial drift analysis and
  developer-centered drift evidence; and
- six non-current or manuscript-irrelevant entries were removed from the paper
  bibliography.

The bibliography is no longer used to report the unfinished SLR protocol. The
protocol keeps its method sources inside `research/literature-protocol.md`, where
they govern a future review rather than occupy Related Work or imply completed
search evidence.

These remain candidate decisions. Hieu must inspect the exact records and source
captures before a populated reference-quality ledger becomes final evidence.

## 2. Audit method

- Publication identity was checked through DOI registration metadata and a
  canonical publisher, proceedings, or institutional publication record.
- Recency uses the frozen 2022--2026 preference.
- Older work is retained only when the manuscript uses the publication for the
  method or model it introduced, not as current evidence of tool performance.
- Journal quality records a named ranking system, year, and category. Computer
  Standards & Interfaces is Q1 in the 2024 SJR Software category and Q2 in the
  2024 JCR Software Engineering category; the audit does not merge those values.
- Conference quartile is `NA:conference`; venue rank and peer-reviewed
  proceedings identity are used instead.
- Rapid Journal Quality Check is a discovery aid. No extension-only value is
  accepted as final evidence.

## 3. Current manuscript bibliography

| Citation key | Date | Type and venue | Quality or rank | Claim role | Candidate decision |
| --- | --- | --- | --- | --- | --- |
| `murphy1995reflexion` | 1995-10 | FSE conference paper | ICORE 2026 A* | Introduces Software Reflexion Models | `accept-exception` |
| `knodel2007comparison` | 2007-01 | WICSA conference paper | ICSA/WICSA series, ICORE 2026 A | Foundational comparison of static conformance approaches | `accept-exception` |
| `terra2009dcl` | 2009-06-08 | Software: Practice and Experience journal article | SJR 2024 Software Q2; Scopus CiteScore 2024 Software Q1 | Introduces Dependency Constraint Language | `accept-exception` |
| `ducasse2009reconstruction` | 2009-07 | IEEE TSE journal article | SJR 2024 Software Q1 | Foundational reconstruction taxonomy | `accept-exception` |
| `li2022erosion` | 2022-02-09 | Journal of Software: Evolution and Process article | Scopus Journal Metrics 2024 Software Q2 | Recent architecture-erosion mapping | `accept` |
| `konersmann2022replicability` | 2022-03 | ICSA conference paper | ICORE 2026 A | Evaluation and replicability evidence | `accept` |
| `abgaz2023decomposition` | 2023-08 | IEEE TSE journal article | SJR 2024 Software Q1 | Recent review of evaluation baselines and datasets | `accept` |
| `kaindlstorfer2024interrogation` | 2024-10-27 | ASE conference paper | ICORE 2026 A* | Peer-reviewed analyzer soundness and precision evidence | `accept` |
| `uzun2024drift` | 2024-01 | Computer Standards & Interfaces article | SJR 2024 Software Q1; JCR 2024 Software Engineering Q2 | Current industrial view-based drift analysis | `accept` |
| `anthony2024drifting` | 2024-06 | ICSA conference paper | ICORE 2026 A | Current developer-centered drift evidence | `accept` |

## 4. Removed manuscript entries

| Citation key | Removal reason | Disposition |
| --- | --- | --- |
| `desilva2012erosion` | An older survey was not needed for the current motivation once the 2022 mapping and 2024 field evidence were cited | Removed from manuscript; still eligible as a historical SLR record |
| `pinto2017archci` | Direct but older low-quartile CI study was not essential to the narrowed current claim | Removed from manuscript; remains sentinel S-005 and may enter the SLR through normal screening |
| `kitchenham2007slr` | Method source for an unfinished SLR, not Related Work evidence for ArchSync | Retained in `literature-protocol.md`, removed from manuscript bibliography |
| `wohlin2014snowballing` | Method source for an unfinished SLR | Retained in `literature-protocol.md`, removed from manuscript bibliography |
| `page2021prisma` | Reporting guideline for an unfinished SLR | Retained in `literature-protocol.md`, removed from manuscript bibliography |
| `kitchenham2023segress` | Reporting guideline for an unfinished SLR | Retained in `literature-protocol.md`, removed from manuscript bibliography |

The earlier `cui2024static` preprint remains rejected for a direct
peer-reviewed manuscript claim. It was replaced by
`kaindlstorfer2024interrogation`, DOI `10.1145/3691620.3695034`.

## 5. Six sentinel DOI audit

The sentinel set is a known-item recall calibration set. It is not a list of the
newest or highest-ranked references, and a sentinel does not have to remain in
the manuscript bibliography.

| ID | DOI registry and identity | Recency | Venue evidence | Candidate decision | Exception reason |
| --- | --- | --- | --- | --- | --- |
| S-001 | Crossref, `10.1145/222124.222136` | old | FSE, ICORE 2026 A*, `NA:conference` | `accept-exception` | Introduces the software reflexion model. |
| S-002 | Crossref, `10.1109/WICSA.2007.1` | old | WICSA/ICSA, ICORE 2026 A, `NA:conference` | `accept-exception` | Foundational comparison of static architecture compliance approaches. |
| S-003 | Crossref, `10.1002/spe.931` | old | SJR 2024 Software Q2; Scopus CiteScore 2024 Software Q1 | `accept-exception` | Introduces Dependency Constraint Language. |
| S-004 | Crossref, `10.1016/j.jss.2011.07.036` | old | Scopus Journal Metrics 2024 Software Q1 | `accept-exception` | Historical architecture-erosion survey. |
| S-005 | DataCite, `10.3217/jucs-023-08-0769` | old | Scopus CiteScore 2024 Software Q3; publisher profile reports JCR Software Q4 | `accept-exception` | Direct historical CI-conformance study; no longer used as a current manuscript reference. |
| S-006 | Crossref, `10.1002/smr.2423` | current | Scopus Journal Metrics 2024 Software Q2 | `accept` | Recent architecture-erosion mapping. |

`S-005` is not malformed. `https://doi.org/10.3217/jucs-023-08-0769`
resolves to the JUCS publisher, and DataCite supplies the publication identity.
A Crossref 404 for this DOI only means that Crossref is not its registration
agency.

## 6. Evidence catalog

- DOI identity: `https://api.crossref.org/works/{doi}` for Crossref records.
- JUCS DOI identity: `https://api.datacite.org/dois/10.3217%2Fjucs-023-08-0769`.
- Current industrial drift paper:
  `https://doi.org/10.1016/j.csi.2023.103774`.
- Current developer drift paper:
  `https://research.chalmers.se/publication/542432` and DOI
  `10.1109/ICSA59870.2024.00018`.
- Computer Standards & Interfaces 2024 metrics:
  `https://library.wur.nl/WebQuery/utbrowser/3931`.
- FSE rank: `https://portal.core.edu.au/conf-ranks/52/`.
- ICSA/WICSA rank: `https://portal.core.edu.au/conf-ranks/791/`.
- ASE rank: `https://portal.core.edu.au/conf-ranks/279/`.
- ASE replacement publication identity:
  `https://repositum.tuwien.at/handle/20.500.12708/204589`.

## 7. Human verification gate

Hieu must verify each DOI/title mapping, the named ranking system, year and
category, and every foundational exception. After acceptance, create the
populated `reference-quality-check.csv` with the real verifier name, acceptance
time, retained source capture paths, and SHA-256 values. Do not copy candidate
decisions into a final ledger without that check.
