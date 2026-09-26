# What is still required for stronger research claims

This integrated revision fixes reporting, formalization, source synchronization
and presentation. It cannot turn author-developed regression sets into an
independent experiment. Do not mark the following items complete from a PDF,
test count, DOI list or local scratch run.

| Missing evidence | Required input and work | Completion evidence |
| --- | --- | --- |
| Independent real-world holdout (D3) | Authors accept a versioned sampling and annotation protocol. Select eligible real repositories and immutable historical revisions without conditioning selection on ArchSync results. Separate tool tuning from labeling/evaluation. Preserve the team's governed independent review and disagreement rules. | Frozen repository/commit list, eligibility/exclusion log, actual labels with provenance, tool/configuration hashes, untouched raw predictions, failures, per-repository results and uncertainty appropriate to the sampling unit. |
| External baseline | Accept a named comparator version, configuration and common observable unit before running it. Establish a non-empty supported overlap; module imports cannot automatically substitute for service calls. Freeze any adapter separately. | Authorized protocol, independent common labels, both tools' raw runs under supported runtimes, exact commands/environment, supported-subset scores, unsupported/failed cases listed separately. |
| Literature full-text appraisal | Follow the workspace ACTIVE-LITERATURE-REVIEW.md: all 18 local PDFs have evidence cards (17 manuscript-relevant and one excluded context preprint); five chosen records lack full text. No local extraction remains pending. Review page-level support already available and retain access limitations if no further papers can be obtained. | Source identity/hash, page locator, exact supported claim, evidence card and accountable review. Missing full texts are not a prerequisite for technical validation; metadata or an abstract must not be relabeled full-text evidence. |
| Real developer/governance value | Decide whether a practitioner/PR study is part of this submission; obtain required ethics/privacy and participant authorization before activity. | Actual review outcomes, false-block burden, effort/comprehension measurements and an approved analysis plan. Otherwise retain this as future work. |
| Submission readiness | Authors select venue/track, resolve public-history anonymity, confirm contributions, funding/conflict statements and required AI-use disclosure. | Destination-specific checklist, accountable approvals and a compliant named/anonymous artifact. An IEEE layout or Q1 aspiration alone is not readiness. |

Immediate author handoff: review the consolidated manuscript and decide whether
to submit it as a controlled-feasibility study or fund/schedule the independent
holdout and baseline work first. For the latter, provide the proposed repository
population, available source access, accountable annotators/reviewers and the
accepted protocol references. The tool can then prepare adapters, validation,
execution and reporting within those boundaries.

No new repository population, invented labels, replacement approval or
manufactured perfect result is supplied by this document. Existing governance
and frozen evidence remain authoritative; these are required inputs, not a new
approved experimental protocol.

The 2026-09-26 [technical validity extension](../research/TECHNICAL-VALIDITY-EXTENSION.md) specifies immediate adversarial/metamorphic checks, implementation mutation testing, and an independent-repository and controlled-performance design. It complements the existing proposed study protocols; it reports no new experimental outcomes.
