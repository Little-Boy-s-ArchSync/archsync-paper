# Official search campaign: all 24 bundles frozen

This checkpoint replaces the earlier 12/24 and 20/24 operational totals with the completed mechanical freeze. It does **not** close SLR-102 or claim completed systematic review.

The campaign ran under the frozen protocol, query specification and approved operational amendments. All 24 required source/query jobs are accounted for exactly once in `campaign-index.json`. The exact verifier receipt, `all-24-raw-export-freeze.json`, pins 8,051 retained files totaling 777,323,200 bytes. Its SHA-256 is `cb2663208ddce0ee938469584dd1b59772fa9d0475e93589867f9278828bda25`.

| Source | Completed logical jobs |
| --- | ---: |
| ACM Digital Library | 6 |
| IEEE Xplore | 6 |
| OpenAlex | 6 |
| Semantic Scholar | 6 |

## What the receipt establishes

The receipt records byte inventories, source observations, query and filter checks, pagination accounting, retained attempts, source-order amendment evidence and the disclosed IEEE navigation incident disposition. The freeze occurred at 2026-09-14T03:08:22Z. The original cutoff remains 2026-08-16 and the campaign deadline remains 2026-09-20T08:18:29Z. Completed searches must not be rerun merely to reproduce this checkpoint.

The incident was accepted with corrective actions and all evidence retained; no rerun was required on account of that incident. This narrow disposition does not establish reviewer screening adoption or named verification of every source bundle.

The historical receipt's `screening_performed=false` describes the freeze stage. Subsequent AI preparation is reported separately below.

## Post-freeze preparation

| Output | Count |
| --- | ---: |
| Exported entry occurrences | 42,099 |
| Retained records after exact DOI deduplication | 35,540 |
| Duplicate occurrences logged | 6,559 |
| Unresolved title/year groups | 634 |
| Records in unresolved groups | 1,381 |
| Deterministic AI screening suggestions | 35,540 |
| Semantic AI recommendations in validated first batch | 50 |
| Final human screening decisions | 0 |

Ten companion export entries receive no extra search-hit credit. Title/year candidate groups have not been merged. The first semantic batch suggests 36 includes, 7 excludes and 7 uncertain; all remain unreviewed by named humans. These are preparation counts, not PRISMA screening or included-study outcomes.

The retained record snapshot SHA-256 is `2b280600b498de2dc55da4cb7fb9aeb5b6a164a945e9e9fcf3b0120300afbc9e`; its manifest SHA-256 is `49e92050308449edaa17008a78942d4e07c003dcf17593cd6bfad4d034cce59f`. The copied `import-integrity-verification.json` records the mechanical integrity check. The full corpus, reviewer workbench and private inputs remain in the operational workspace, not in this checkpoint.

## Evidence access and remaining closure conditions

The exact raw files remain under the operational `preparation/2026-09-13/source-access-handoff` directory. Every path in the seal's `input_inventory` is relative to that root. This commit contains the verifier receipt and index, **not** the 777 MB raw bundle. Machine-local references do not establish remote reviewer access.

Before closing [SLR-102 / issue #24](https://github.com/Little-Boy-s-ArchSync/archsync-paper/issues/24), provide the reviewer access to a hash-bound copy of the same raw bytes, verify the complete query/log/attempt evidence, obtain substantive named verification under protocol §15, pass local and hosted validation, and obtain eligible review and protected merge. An accessible controlled artifact transfer is sufficient; public publication is not a new requirement.

No final title/abstract decisions, full-text screening, quality assessment, extraction, reconciliation or final synthesis are asserted. The governed extraction matrix remains unpopulated until its required inputs are accepted.
