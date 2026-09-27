# D3 governance amendment: nonblind module-only author review

Version: 0.1.0-proposed, 2026-09-28.
Status: proposed governance amendment recording settled design decisions; not accepted as a complete protocol, not frozen, and no official run authorized.

## Purpose and preserved history

The original [dataset-governance.md](../../dataset-governance.md) and [pre-experiment-proposal-manifest.json](../../pre-experiment-proposal-manifest.json) remain byte-identical. This amendment does not replace their hash-bound contents, satisfy their approval requirements, or change the manuscript's reported D1/D2/P3 evidence. The original governance SHA-256 is `57b6b532d45a9d9a14475ca855927148c214c47143294175f85e9800225f7cdb`; the original proposal-manifest SHA-256 is `9ab1b0c526076cf771c7d777ed1e439fbb3acb7b3a3c3dcc4838911c35139c98`.

The earlier proposal describes a future independent holdout, a pending TV3 custodian, and a firewall limiting developers' exposure. The settled D3 design below does **not** satisfy that independent-holdout firewall. A technical merge, separate account, separate chat, source hash, or two review files cannot establish independence or erase prior exposure. The earlier independent-validation goal remains unmet.

## Settled design recorded elsewhere

Benchmark's [Repository Lead decision update](https://github.com/Little-Boy-s-ArchSync/archsync-benchmark/blob/ed0280a8d88cbe3a391c1a682f529fcac94cbd17/holdout/d3-preflight/HIEU-DECISION-UPDATE-20260928.md) records Hiếu's direct reply relayed by Hoàng. It settles these narrow decisions; this document creates no new personal acceptance:

- The population is **56 primary cases plus four audit-context cases**, over HyperDX, Reactive Resume and Etherpad. Keep all 60 captured cases in the disposition record. Context-only cases are not scored cases or automatic no-impact labels.
- The comparison boundary is **module-only**. Source-module dependencies are not HTTP, database, cache or message-service interactions. This design cannot validate the whole service-level architecture-conformance claim.
- **Võ Đức Hiếu and Trần Minh Hoàng** are the two development-associated author reviewers. Neither review is blind. Their records must remain author-associated and nonblind, not external independent validation.
- Four study-defined architecture rules are accepted only conditionally on historical applicability to each relevant case and base/head revision. Their selection is not an upstream maintainer policy or a completed applicability review.

The [scope decision](https://github.com/Little-Boy-s-ArchSync/archsync-benchmark/blob/ed0280a8d88cbe3a391c1a682f529fcac94cbd17/holdout/D3-SCOPE-ACCEPTANCE-20260928.md) binds the scope proposal SHA-256 `85ddc693a8ff82064e58788ff491b90b8cf50eb03732e675ea17d0ea276d09f3` and selected review bundle SHA-256 `44cc064a3555c90cc20d2a38ab61d67c6af598c1825bf5290cca2269ec801d35`. The [module-unit decision](https://github.com/Little-Boy-s-ArchSync/archsync-benchmark/blob/ed0280a8d88cbe3a391c1a682f529fcac94cbd17/holdout/D3-EVALUATION-UNIT-DECISION-20260928.md) and [conditional rule decision](https://github.com/Little-Boy-s-ArchSync/archsync-benchmark/blob/ed0280a8d88cbe3a391c1a682f529fcac94cbd17/holdout/D3-RULE-DECISION-20260928.md) provide the detailed boundaries. These source records distinguish narrow decisions from acceptance of the full method.

## Exposure, assistance and record preservation

Disclose actual analyzer/rule development, prior source and prediction exposure, and AI assistance. Unknown details remain explicitly unknown; this amendment supplies no personal declaration, signature, retrospective timestamp, or assertion that a reviewer has checked a case. Each person must confirm their own factual record.

AI-assisted source reading, suggestions or prefilled material must retain input scope, output reference, human-verification extent and whether the suggestion was shared. Shared suggestions can make agreement dependent. Two author files are not two independent human judgments merely because they have different names. Preserve both original reviews and raw-byte hashes before reconciliation; do not overwrite initial decisions. None of these requirements asserts that review or reconciliation has happened.

## Remaining preparation and research boundaries

Historical applicability, the exact rubric and Unknown handling, truth unit and matching policy, source/resolver coverage, tool/package/configuration pins, descriptive analysis plan, review provenance, reconciliation and governed execution remain unresolved prerequisites. The proposed module-edge truth-inventory endpoint is not silently adopted by this record or by the existing four-label case form. Version and review the operational method before using it.

No source labels, applicability decisions, reviewer agreement, tool predictions, experiment metrics or D3 result are created by this amendment. No completed D3 label set or accepted result is established by the linked preparation records. The current manuscript results remain D1/D2/P3 only; the 56+4 counts describe a selected preparation population, not completed reviews or measured performance.

Before an eventual D3 result is reported, preserve its separate dataset identity, authors' development association and exposure, AI dependence, module-only scope, purposive selection, Unknowns, unsupported cases and attempted/scored denominators. Do not pool it with D1/D2/P3 or describe it as an untouched independent holdout. This amendment leaves all existing execution and publication gates closed.
