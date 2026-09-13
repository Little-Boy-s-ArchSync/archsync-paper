**SLR-102: publication-date precision correction — reviewer approval requested**

The current native interfaces were checked on 2026-09-13. ACM Advanced Search provides month/year end controls without a day selector. IEEE offers Publication Year separately from day-level Date Added controls. Valid sentinel BibTeX downloads were retained from both sources. The official campaign remains **0/24 jobs**; no official records are affected.

Under [frozen protocol 1.0.0 §17](https://github.com/Little-Boy-s-ArchSync/archsync-paper/blob/e34054760273a104f0db99c86a4ddd222e509254/research/literature-protocol.md#L646-L659), please approve this operational correction for IEEE/ACM A1, A2, A3, B1, C1 and C2:

1. Retrieve IEEE Publication Year through **2026**, retaining all earlier available years and the existing **journals/conferences** filter. Retrieve the **ACM Guide through August 2026**, with all earlier dates. Retain the exact native query/filter serialization. IEEE Date Added is not substituted as a universal publication-date filter.
2. Preserve every governed term, all three metadata fields and their exact unions, all four databases, existing reviewer roles, eligibility rules, required export fields and the seven-day collection window. Add no language, publisher or access filters.
3. Freeze all **24 raw exports** before opening individual official results, metadata repair or screening. Then apply the unchanged **2026-08-16 inclusive** cutoff in a separate ledger using verified publication dates and their original labels/precision. Remove only records whose supported publication interval is wholly later. Retain missing, conflicting or cutoff-spanning dates as unresolved for existing metadata verification and I6/E06 screening; never invent a day or discard raw records.
4. Keep native counts, IEEE field overlaps/union counts, exported entries, companion publications, cutoff removals and unresolved dates separately auditable. Recover available metadata omitted by an export in separate derived records with provenance; omission alone is not proof that the source reports none.

**Rerun decision:** none is required because no official jobs have run. Recheck this when approval is recorded; if that state changes, an explicit four-source rerun decision is required before continuing.

Approval will be retained with its actual reference and effective UTC in an appended operational amendment. The frozen protocol and original calibration remain intact. This proposal has not been applied.

Retained diagnostic SHA-256 values:

- IEEE: `8db55e9910882b8190139974966f7780947902583f845ccb533d41db59ff279c` — one entry, including abstract and keywords.
- ACM: `5886be2c46f4d7e4c11e93ade5cf04980fdb87b04aa3571290ee415a76adf0de` — two exported publication entries for one observed hit; abstract/keywords omitted and requiring separate recovery or documented absence.
