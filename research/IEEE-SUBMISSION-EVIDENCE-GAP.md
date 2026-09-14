# IEEE Submission Evidence Gap

Status: `NOT_READY_FOR_SUBMISSION`

Last reviewed: 2026-09-11

This file separates evidence that already supports the manuscript from work
that must exist before ArchSync can make external-validity, comparative, or
submission-readiness claims. A green build or a passing validator cannot replace
missing empirical data or human authorization.

## Current defensible study claim

The current manuscript is a controlled feasibility and regression study of the
TypeScript and Node.js prototype. It can claim agreement with the declared D1
and D2 oracles, deterministic replay, evidence localization on the controlled
cases, and equivalence between incremental and full-scan output on the D1 replay.
It cannot claim general accuracy, comparative superiority, production
effectiveness, or cross-language validity.

## Evidence already available

| Evidence area | Current evidence | Permitted use |
| --- | --- | --- |
| Expected architecture and rules | Versioned model, schema, semantic validation, and deterministic conformance engine | Explain the executable-contract design |
| D1 controlled benchmark | 20 executable patches, ground-truth manifest, integrity checks, raw and normalized results | Report controlled node, edge, classification, rule, and evidence-location agreement |
| D2 detector regression corpus | 20 annotated positive and 20 annotated hard-negative signals, frozen v0.1 and v0.2 results | Diagnose the targeted v0.1 errors and report regression behavior |
| Git-diff gate replay | 20 cold and 20 warm checks plus 20 full-head oracle scans | Report controlled decision, cache, scope, and incremental-equivalence observations |
| Reproducibility | Pinned commits, package hashes, dataset hashes, local verification, and recorded cross-platform functional CI | Support repeatability of the declared controlled protocol |
| Reference positioning | Ten audited references, with four pre-2022 works used only as foundational sources | Support scoped narrative positioning, not exhaustive literature coverage |

## Required before stronger scientific claims

| Required evidence | Minimum completion condition | Claim unlocked |
| --- | --- | --- |
| Independent real-world holdout D3 | Freeze multiple public TypeScript repositories and exact commits before running ArchSync; record licenses; define a common observable-relation scope; obtain independently created labels; adjudicate disagreements without changing original labels; retain raw predictions and provenance | Accuracy on the evaluated external sample, with confidence intervals where statistically justified |
| External comparator | Pin dependency-cruiser or another justified comparator version and configuration; define a capability-matched subset; retain tool-native raw output, failures, mapping decisions, and scoring code; run both tools on the same frozen D3 objects | Comparative results limited to the common capability subset |
| Real pull-request pilot | Define participant protocol, ethics or consent determination, recruitment, tasks, measures, exclusions, and immutable logs before data collection | Usability, review-effort, or governance-effectiveness observations |
| Completed literature protocol | Complete the governed calibration, freeze the protocol, execute searches, deduplicate, screen with the declared reviewer process, assess quality, and retain the synthesis matrix | Systematic-review coverage claims, if reported in this paper |
| Reference-quality acceptance | Human reviewers accept the exact ten current records and retain source and quality-ranking evidence where the policy requires it | Final human-approved reference set |
| Exact venue contract | Record the official venue URL, track, template version, page limit, anonymity rule, public-artifact rule, deadline, and conflict-of-interest requirements | Venue-specific formatting and submission-package preparation |
| Exact candidate review | Build named and anonymous PDFs from one source commit; retain their SHA-256 values; inspect redaction, metadata, figures, tables, references, accessibility, and supplementary files; obtain author release authorization | Submission-ready candidate status |

## Inputs required from the research team

The following facts cannot be inferred or fabricated by an implementation agent:

- The exact IEEE venue and track, official call-for-papers URL, deadline, page
  limit, template, and double-blind or single-blind policy.
- Whether the team will submit the current controlled feasibility paper or wait
  until D3 and the external comparison are complete.
- For D3, the chosen public TypeScript repository URLs, exact 40-character
  commits, licenses, inclusion rationale, and the identities and roles of the
  independent ground-truth reviewers.
- For a human pilot, the institutional ethics or consent decision and the real
  participant protocol.
- Human acceptance of the reference-quality records and final authorization for
  the exact submission candidate.

## IEEE authoring controls

The manuscript should be checked against the venue-specific instructions in
addition to the generic IEEE conference guidance:

- https://conferences.ieeeauthorcenter.ieee.org/write-your-paper/structure-your-paper/
- https://conferences.ieeeauthorcenter.ieee.org/write-your-paper/authoring-tools-and-templates/
- https://conferences.ieeeauthorcenter.ieee.org/write-your-paper/research-reproducibility/

The generic `IEEEtran` conference layout is a temporary format contract until
the exact venue template is supplied. The current named and anonymous builds are
technical review artifacts only. They do not change the readiness boundary in
`research/SUBMISSION-READINESS.md`.
