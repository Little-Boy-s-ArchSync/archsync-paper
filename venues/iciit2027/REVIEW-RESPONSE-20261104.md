# Response to the five review comments — 4 November 2026

Manuscript: *ArchSync: Evidence-Backed Conformance Checking for TypeScript Service Architectures*.
Target: ICIIT 2027 (Ho Chi Minh City).

| Review comment | Revision and location |
| --- | --- |
| 1. Reduce repeated self-disclaimers; state the contribution positively. | Rewrote the Abstract, Introduction and Conclusion around the executable integration and retained failure/repair evidence. Removed repeated accuracy/superiority exclusions from the results narrative and simplified the appendix. Section 6 consolidates the scientific limitations. |
| 2. Discuss real-project behavior and synthetic-only threats; keep D3 brief. | Section 6 now describes expected behavior for direct supported-client calls, wrappers and configuration-built endpoints, missed interactions causing false PASS or newly introduced false BLOCK, shared hosts, stale contracts and larger change scopes. It identifies the single synthetic topology, co-development, anticipated signal mix and clustered reuse as threats. D3 preparation remains a future exploratory step in the appendix, with its nonblind module-only scope and absent results stated once there. |
| 3. Explain the value of the combination alongside ArchLintor and CALint. | Sections 1–2 explain the connection from typed service interactions through source evidence to introduced-finding decisions. A changed fetch destination with unchanged module imports illustrates the service-level motivation. The contribution rests on that integration and its inspectable development evidence. |
| 4. Make language/focus differences explicit inside Table 1. | Added a dedicated **Language / focus** column distinguishing TypeScript module conformance, Python Clean Architecture, Java/Spring recovery and ArchSync's TypeScript service conformance at Git time. Retained the published-context/non-executed-comparison caption and the CALint abstract-only qualifier. |
| 5. Include a legible Figure 1 and a tiny Section 3 example. | Figure 1 is embedded directly in the shared manuscript source and its caption now states BLOCK/REVIEW/PASS precedence. Added a three-component contract example immediately after the rule definitions, contrasting a satisfied mixed-type path, a removed required path and a rule-compliant added edge. The separate D1 worked case remains. |

All historical numerical results, retained research evidence, author records and
17 venue citations are preserved. The changes concern presentation and interpretation;
they add no repository experiment or comparative result.

Build, figure/table inspection and exact-source package verification are recorded
in `validation.json`, `VISUAL-REVIEW.md`, `visual-inputs.json` and
`package-rebuild.json` alongside the regenerated PDFs.
