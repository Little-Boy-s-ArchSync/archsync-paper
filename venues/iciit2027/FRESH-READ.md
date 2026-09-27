# Fresh coauthor read — 90 seconds

Historical reading packet for PR #50 commit `36cd4267df0b1bc319b8f5b11bc0a938ec4e503b`.
The abstract below is superseded. For a new coauthor read, use the current
iciit2027-compact.pdf and record its exact hash; do not record this packet as
verification of the current manuscript. No human read is asserted here.

Prepared for an uninvolved coauthor; not yet performed. Read only the abstract and introduction below for 90 seconds, then close the page and answer:

1. What problem does the tool solve?
2. What is the contribution beyond existing conformance tools?
3. What evidence supports the claim, and what has not been demonstrated?
4. Which first sentence or term slowed you down?

Record the reader, date, exact draft commit/hash and short answers separately. This is a first-impression check, not scientific approval or submission consent.

## Abstract

Service changes can introduce architectural drift while preserving functional behavior. ArchSync provides deterministic conformance checking for TypeScript service architectures through three integrated capabilities: a typed architectural contract, provenance-aware extraction of HTTP, PostgreSQL, Redis and AMQP relationships, and an evidence-backed Git gate that maps introduced findings to PASS, BLOCK or REVIEW. Evaluation covers 20 architecture patches and 40 annotated detector signals, with all 20 patch classifications matching their development labels and incremental execution matching full scans in all 20 replay cases. A separate reliability campaign checks 786,432 finite rule–graph combinations against a matrix oracle; the hardened implementation passes 126 Core and 315 Guardian regression tests. The resulting workflow connects pull-request decisions to explicit rules and inspectable evidence, supporting reproducible architecture checks. Results are limited to controlled, co-developed datasets and developer-authored reliability checks; broader validation is future work.

## Introduction

Service-oriented systems can preserve functional behavior while introducing a forbidden dependency, losing a required interaction, or adding infrastructure that needs a design decision. These changes concern different architectural judgments. A useful check must connect an observed interaction to the declared contract, identify supporting source evidence, and distinguish a violation from an evolution. ArchSync addresses this information-extraction and decision-support problem with deterministic rules and inspectable evidence.

Our contribution is an executable integration: (1) a typed expected/observed service graph with explicit constraints; (2) provenance-aware extraction of selected TypeScript interactions and evidence; and (3) a Git-diff gate that reports introduced violations separately from evolution. Building on established model comparison and dependency constraints, we contribute reproducible evaluation of the integrated workflow and failure-first hardening of its rule engine and extraction pipeline.

We ask whether the prototype reconstructs declared graph changes and detector signals (RQ1), classifies controlled changes correctly (RQ2), supplies the declared evidence locations (RQ3), and preserves results under replay and incremental execution (RQ4). These questions guide the controlled evaluation in Section 4 and the reliability extension in Section 5. For practitioners, the Git-scoped gate provides a concrete pull-request check: introduced findings carry rule identifiers and inspectable evidence, while evolution is routed for an explicit architecture decision. The decision path executes deterministic rules without an LLM inference service.
