# ArchSync Reference Quality Audit

| Field | Value |
| --- | --- |
| Task | GOV-LIT-AUDIT-001 |
| Audit version | 0.1.0 |
| Audit date | 2026-08-20 |
| Scope | Every citation in `references.bib` and all six SLR sentinel DOI values |
| Prepared by | AI-assisted source audit authorized by Hieu |
| Human verifier | Hieu - pending exact-record verification |
| Status | Candidate decisions complete; human acceptance pending |
| Governing policy | `REFERENCE-QUALITY-POLICY.md` version 1.0.0 |

## 1. Outcome

The current bibliography contains 14 retained references after remediation:

- 5 satisfy the default recency and venue preference;
- 9 require a documented foundational or method exception;
- 0 retained references have a proposed `reject-as-reference` decision; and
- 1 arXiv-only preprint was rejected for the direct manuscript claim and
  replaced with a peer-reviewed ASE 2024 paper.

These are candidate decisions rather than a claim that Hieu has already
verified the exact source record. The owner must inspect this audit and replace
the pending verifier status with an accepted record before the populated
reference-quality ledger is treated as final evidence.

## 2. Audit method

- Publication identity was checked through DOI registration metadata and the
  canonical publisher or institutional record. Twelve retained DOI values are
  available through Crossref. The JUCS DOI is registered through DataCite and
  resolves to the publisher. The Kitchenham and Charters technical report has
  no DOI and uses its institutional EBSE record.
- Recency uses the frozen interval 2022--2026. Page et al. was published on
  2021-03-29, before the rolling cutoff, and therefore uses a method exception.
- Journal quality records the named 2024 system and category. A quartile from
  one system is not presented as if it came from another system.
- Conference quartile is `NA:conference`. Current ICORE venue rank is recorded
  when the series has a recognized entry.
- Rapid Journal Quality Check status is `not-supported` for this run. Its
  Google Scholar result page returned an unusual-traffic gate, so no extension
  value was retained or guessed. Direct ranking sources were used instead.

## 3. Six sentinel DOI audit

The sentinel set is a known-item recall calibration set. It is not a list of
the six newest or highest-ranked references. Recency and venue quality do not
justify silently replacing a frozen sentinel.

| ID | DOI registry and identity | Recency | Venue evidence | Candidate decision | Exception reason |
| --- | --- | --- | --- | --- | --- |
| S-001 | Crossref, `10.1145/222124.222136` | old | FSE, ICORE 2026 A*, `NA:conference` | `accept-exception` | Introduces the software reflexion model used as a foundation for model-to-code conformance. |
| S-002 | Crossref, `10.1109/WICSA.2007.1` | old | WICSA series continued as ICSA, ICORE 2026 A, `NA:conference` | `accept-exception` | Direct foundational comparison of static architecture compliance approaches. |
| S-003 | Crossref, `10.1002/spe.931` | old | SJR 2024, Software, Q2; Scopus CiteScore 2024, Software, Q1 | `accept-exception` | Introduces the dependency constraint language used by later architecture-conformance work. |
| S-004 | Crossref, `10.1016/j.jss.2011.07.036` | old | Scopus Journal Metrics 2024, Computer Science - Software, Q1 | `accept-exception` | Foundational survey that defines the architecture-erosion problem space. |
| S-005 | DataCite, `10.3217/jucs-023-08-0769` | old | Scopus CiteScore 2024, Computer Science - Software, Q3; publisher profile reports JCR Software Q4 | `accept-exception` | Directly demonstrates architecture conformance in continuous integration. The unique claim match justifies the low-quartile and age exception. |
| S-006 | Crossref, `10.1002/smr.2423` | current | Scopus Journal Metrics 2024, Computer Science - Software, Q2 | `accept` | Recent systematic mapping study directly covering software architecture erosion. |

`S-005` is not malformed. `https://doi.org/10.3217/jucs-023-08-0769`
returns a redirect to the JUCS publisher, and DataCite returns the title,
publisher, and 2017 publication year. A Crossref 404 for this DOI only means
that Crossref is not its registration agency.

## 4. Complete bibliography audit

| Citation key | Date | Type and venue | Quality or rank | Claim role | Candidate decision |
| --- | --- | --- | --- | --- | --- |
| `murphy1995reflexion` | 1995-10 | FSE conference paper | ICORE 2026 A* | Foundation of model-to-code reflexion | `accept-exception` |
| `knodel2007comparison` | 2007-01 | WICSA conference paper | ICSA/WICSA series, ICORE 2026 A | Foundation and comparison of conformance techniques | `accept-exception` |
| `terra2009dcl` | 2009-06-08 | Software: Practice and Experience journal article | SJR 2024, Software, Q2; Scopus CiteScore 2024, Software, Q1 | Dependency constraint language foundation | `accept-exception` |
| `ducasse2009reconstruction` | 2009-07 | IEEE TSE journal article | SJR 2024, Software, Q1 | Architecture-reconstruction taxonomy | `accept-exception` |
| `desilva2012erosion` | 2012-01 | Journal of Systems and Software article | Scopus Journal Metrics 2024, Software, Q1 | Architecture-erosion survey | `accept-exception` |
| `pinto2017archci` | 2017 | Journal of Universal Computer Science article | Scopus CiteScore 2024, Software, Q3; publisher profile reports JCR Software Q4 | Direct CI conformance precedent | `accept-exception` |
| `li2022erosion` | 2022-02-09 | Journal of Software: Evolution and Process article | Scopus Journal Metrics 2024, Software, Q2 | Recent architecture-erosion mapping | `accept` |
| `konersmann2022replicability` | 2022-03 | ICSA conference paper | ICORE 2026 A | Replicability and evaluation design | `accept` |
| `abgaz2023decomposition` | 2023-08 | IEEE TSE journal article | SJR 2024, Software, Q1 | Recent architecture decomposition review | `accept` |
| `kaindlstorfer2024interrogation` | 2024-10-27 | ASE conference paper | ICORE 2026 A* | Peer-reviewed evidence for analyzer soundness and precision issues | `accept` |
| `kitchenham2007slr` | 2007 | EBSE technical report | `NA:technical-report` | Foundational software-engineering SLR guidance | `accept-exception` |
| `wohlin2014snowballing` | 2014-05-13 | EASE conference paper | ICORE 2026 A | Foundational snowballing method | `accept-exception` |
| `page2021prisma` | 2021-03-29 | BMJ journal article | SJR 2024, Medicine (miscellaneous), Q1 | Foundational PRISMA reporting guideline | `accept-exception` |
| `kitchenham2023segress` | 2023-03-01 | IEEE TSE journal article | SJR 2024, Software, Q1 | Current reporting guideline for secondary SE studies | `accept` |

The two non-journal method sources are retained only for their method role.
They are not represented as Q1 journal evidence. The older journal and
conference papers are also not represented as current empirical state of the
art.

## 5. Remediation record

The removed `cui2024static` entry is an arXiv/CoRR preprint whose author page
still labels it as under review. It therefore failed the default peer-review
requirement for a direct manuscript claim. It was replaced by
`kaindlstorfer2024interrogation`, DOI `10.1145/3691620.3695034`, a full ASE 2024
conference paper. The institutional record identifies it as a published full
paper, and the ASE 2024 research track used double-anonymous review.

The manuscript now states only the result supported by the replacement source:
eight mature analyzers, 24 unique issues, and 16 soundness issues. It no longer
attributes the preprint's 350 historical-issue dataset to a peer-reviewed
source.

## 6. Evidence catalog

- DOI identity: `https://api.crossref.org/works/{doi}` for the twelve Crossref
  DOI values retained in the bibliography.
- JUCS DOI identity: `https://api.datacite.org/dois/10.3217%2Fjucs-023-08-0769`
  and
  `https://www.jucs.org/jucs_23_8/introducing_an_architectural_conformance.html`.
- Software: Practice and Experience 2024 metrics:
  `https://www.scimagojr.com/journalsearch.php?q=20007&tip=sid&clean=0` and
  `https://library.wur.nl/WebQuery/utbrowser/6478`.
- Journal of Systems and Software 2024 metrics:
  `https://library.wur.nl/WebQuery/utbrowser?issn=1873-1228`.
- Journal of Software: Evolution and Process 2024 metrics:
  `https://library.wur.nl/WebQuery/utbrowser/7017`.
- Journal of Universal Computer Science 2024 metrics:
  `https://www.scimagojr.com/journalrank.php?country=AT&openaccess=true&ord=desc&order=tc&wos=true`,
  `https://library.wur.nl/WebQuery/utbrowser?issn=0948-6968`, and
  `https://profile.jucs.org/`.
- IEEE Transactions on Software Engineering 2024 SJR, Software category:
  `https://www.scimagojr.com/journalrank.php?category=1712&country=&ord=desc&order=rpd`.
- BMJ 2024 SJR:
  `https://www.scimagojr.com/journalrank.php?country=GB&openaccess=true&ord=desc&order=h&wos=true`.
- FSE rank: `https://portal.core.edu.au/conf-ranks/52/`.
- ICSA/WICSA rank: `https://portal.core.edu.au/conf-ranks/791/`.
- ASE rank: `https://portal.core.edu.au/conf-ranks/279/`.
- EASE rank:
  `https://portal.core.edu.au/conf-ranks/?by=all&page=1&search=Software+Engineering&sort=atitle&source=all`.
- ASE replacement publication identity:
  `https://repositum.tuwien.at/handle/20.500.12708/204589`.
- ASE 2024 review process:
  `https://conf.researchr.org/track/ase-2024/ase-2024-research`.
- Removed preprint status:
  `https://tingsu.github.io/files/publication.html` and
  `https://dblp.org/rec/journals/corr/abs-2408-13855`.

## 7. Human verification gate

Hieu must verify the exact DOI/title mapping, the named ranking system, year and
category, and each exception reason. After acceptance, create the populated
`reference-quality-check.csv` with the real verifier name, acceptance time,
retained source capture paths, and SHA-256 values. Do not copy the candidate
decisions into a final ledger without that check.
