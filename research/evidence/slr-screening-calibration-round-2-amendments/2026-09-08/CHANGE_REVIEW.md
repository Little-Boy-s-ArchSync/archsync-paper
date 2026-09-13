# Source review for the unaccepted metadata amendment

The proposed nine-record manifest is
`0dc44715da2113112eb51e7262073a7fefe5237f0e66f775705b5ba96d6943ae`.
Its mandatory delivered companion provenance is
`45ca6f35cd86406c7624423b6983fa1775c7bae46bea7747178bb2a8e9123861`.
Read this review with the [provenance](AMENDMENT-PROVENANCE.json) and
[delivery boundaries and verification instructions](README.md).

| Field | Correction | Primary source |
| --- | --- | --- |
| CAL-013 abstract | Replace publisher navigation and account text with the actual abstract of the 1995 FSE paper. | [First author's UBC publication page](https://www.cs.ubc.ca/~murphy/papers/rm/fse95.html) and its [linked paper](https://www.cs.ubc.ca/~murphy/papers/rm/reflexion_model_fse95.pdf). |
| CAL-018 publication_date | Replace the registry creation date `2020-04-07` with publication date `2017-08-28`. | [Official JUCS article](https://lib.jucs.org/article/23438), corroborated by [DataCite](https://api.datacite.org/dois/10.3217/jucs-023-08-0769). |

The retained 2026-09-08 preparation records link CAL-013 to the October 1995
FSE proceedings paper by Murphy, Notkin and Sullivan, pages 18–28, matching
[Crossref's proceedings record](https://api.crossref.org/works/10.1145/222124.222136).
The retained linked PDF was visually inspected during that preparation. This
delivery does not claim a new source retrieval or a new personal review. DOI
`10.1145/222124.222136` is unchanged; the 2001 design-and-implementation paper
was not substituted.

For CAL-018, the retained publisher page has three metadata fields and JSON-LD
that agree on `2017-08-28`; DataCite distinguishes publication year 2017 from
creation timestamp `2020-04-07T15:29:52.000Z`. CAL-018's abstract is unchanged
and matches the retained publisher metadata. Every other field and the other
seven records remain unchanged. The original API capture fields describe only
original snapshot lineage; corrected field provenance is in the companion.

The complete raw source captures and historical preparation checks remain in
the local archive identified by [RETAINED-ARCHIVE-SHA256SUMS](RETAINED-ARCHIVE-SHA256SUMS).
They are not committed here. The repository verifier checks exact delivered
bytes and recorded hashes; its explicit `--archive` option additionally checks
the complete retained archive and reruns its source extraction. Neither path
establishes a reviewer's personal acceptance or independence.

Residual source limits remain: CAL-013's exact day is unverified because the
sources establish October 1995; CAL-010/CAL-014/CAL-017 registries provide only
year/month, CAL-015 only year; CAL-016's `2022-12-20` may be online-first relative
to its January 2023 issue. Six other abstracts remain unverified at publisher
level; CAL-012 may be incomplete, but truncation is unconfirmed. No fields were
silently rewritten to resolve those uncertainties.

Hiếu and Tran Minh Hoang each still need to inspect the exact proposed records,
retained sources and delivered provenance, personally confirm independence,
and explicitly accept the same exact manifest, provenance and common selection.
Only afterward may governed calibration proceed. No acceptance of any prior
manifest or provenance carries over. SLR-REV-101 remains unfinished.
