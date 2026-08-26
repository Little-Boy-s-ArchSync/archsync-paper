# D3 independent holdout report

| Field | Value |
| --- | --- |
| Task | EVAL-111 |
| Status | TEMPLATE — NO RESULT / NOT EVIDENCE |
| Blocking dependencies | EVAL-107; EVAL-109; EVAL-110; STAT-101 |
| Dataset | `{{D3_DATASET_ID}}` |
| Frozen manifest SHA-256 | `{{D3_MANIFEST_SHA256}}` |
| Statistical plan | `{{STATISTICAL_PLAN_VERSION}}` |
| Paper result manifest | `{{PAPER_RESULT_MANIFEST_PATH}}` |

This file is a reporting scaffold only. It must not be cited as empirical
evidence, copied into the manuscript, or populated before D3 ground truth is
independently adjudicated and frozen. The development datasets D1/D2/P3 remain
separate from D3. D3 results must not be used to tune the analyzer, rules,
sampling frame, reviewer rubric, exclusions, primary estimand, or analysis
method before the result freeze.

## Holdout protocol and provenance

`{{FROZEN_PROTOCOL_AND_PROVENANCE}}`

Record the protocol version and hash, repository URL, permissive license,
pinned commit, retrieval time, scoped file-tree hash, Node/package-manager
environment, analyzer package hashes, and the two normalized-run hashes.

## Repository characteristics and exclusions

`{{REPOSITORY_CHARACTERISTICS_TABLE}}`

Report each repository separately before any pooled summary. Include size,
stack, supported and unsupported patterns, sampled scope, exclusion checks,
and every frozen exclusion. Do not silently remove failed or inconclusive rows.

## Independent ground truth

`{{GROUND_TRUTH_AND_ADJUDICATION_SUMMARY}}`

Identify the rubric and frozen truth versions, reviewer roles, agreement
measure, unresolved Unknown cases, adjudication provenance, and leakage check.
Do not overwrite original reviewer labels.

## Run completeness, failures, and missingness

`{{FAILURE_AND_MISSINGNESS_TABLE}}`

Report assigned and analyzed `n`, successful, failed, inconclusive and excluded
counts by repository. Every exclusion must point to its predeclared reason.

## Holdout metrics

`{{METRICS_BY_REPOSITORY_TABLE}}`

`{{POOLED_METRICS_WITH_N_AND_UNCERTAINTY}}`

For every node, edge, classification, rule-match and evidence-location metric,
report the unit, numerator, denominator, analyzed `n`, effect estimate and the
uncertainty method frozen in STAT-101. A pooled value never replaces the
per-repository results.

## False-positive and false-negative analysis

`{{FALSE_POSITIVE_TAXONOMY}}`

`{{FALSE_NEGATIVE_TAXONOMY}}`

Every error case must retain its evidence location and one governed disposition:
implementation defect, documented limitation, unsupported/out-of-scope, or
mapping ambiguity. Post-result fixes are separate follow-up evidence and do not
rewrite the frozen predictions.

## Limitations and threats to validity

`{{LIMITATIONS_AND_THREATS}}`

Cover repository selection, license and ecosystem scope, reviewer subjectivity,
unsupported syntax/libraries, analyzer failures, missingness, clustering,
multiplicity, transferability, and residual leakage risk.

## Evidence-to-paper mapping

`{{EVIDENCE_MAPPING_TABLE}}`

Map each future table, figure and statement ID to the generated result manifest,
source artifact, command, commit, environment and SHA-256. Manual edits to
numbers or figures are prohibited.
