# Response to the five review comments — 4 November 2026

Manuscript: *ArchSync: Evidence-Backed Conformance Checking for TypeScript Service Architectures*.
Target: ICIIT 2027 (Ho Chi Minh City).

Guide follow-up, 5 November 2026: all five corrections below are retained. The
[current audit](FINAL-GUIDE-AUDIT-20261105.md) updates the official dates,
installs unmodified production `acmart` 2.21, restores native ACM Reference
Format, uses standard paragraph headings and adds both table descriptions.
The primary review candidate follows `manuscript,screen,review`; compact output
is a proceedings preview. The four authors with Hieu correspondence, 131-word
abstract, 17 citations and separate active 23-paper review are unchanged.
The five profiles build with pdfLaTeX/TeX Live 2024 at 10/5/10/5/4 pages;
37 venue tests and visual review of all 34 pages pass. Compact previews use the
documented `pbalance` option. The supplement now has its own four-author metadata,
abstract, CCS concepts, keywords and native ACM reference block. Archive verification
is recorded in `package-rebuild.json`.

| Review comment | Revision and location |
| --- | --- |
| 1. Reduce repeated self-disclaimers; state the contribution positively. | Rewrote the Abstract, Introduction and Conclusion around the executable integration and retained failure/repair evidence. Removed repeated accuracy/superiority exclusions from the results narrative and simplified the appendix. Section 6 consolidates the scientific limitations. |
| 2. Discuss real-project behavior and synthetic-only threats; keep D3 brief. | Section 6 now describes expected behavior for direct supported-client calls, wrappers and configuration-built endpoints, missed interactions causing false PASS or newly introduced false BLOCK, shared hosts, stale contracts and larger change scopes. It identifies the single synthetic topology, co-development, anticipated signal mix and clustered reuse as threats. D3 preparation remains a future exploratory step in the appendix, with its nonblind module-only scope and absent results stated once there. |
| 3. Explain the value of the combination alongside ArchLintor and CALint. | Sections 1–2 explain the connection from typed service interactions through source evidence to introduced-finding decisions. A changed fetch destination with unchanged module imports illustrates the service-level motivation. The contribution rests on that integration and its inspectable development evidence. |
| 4. Make language/focus differences explicit inside Table 1. | Added a dedicated **Language / focus** column distinguishing TypeScript module conformance, Python Clean Architecture, Java/Spring recovery and ArchSync's TypeScript service conformance at Git time. Retained the published-context/non-executed-comparison caption and the CALint abstract-only qualifier. |
| 5. Include a legible Figure 1 and a tiny Section 3 example. | Figure 1 is embedded directly in the shared manuscript source and its caption now states BLOCK/REVIEW/PASS precedence. Added a three-component contract example immediately after the rule definitions, contrasting a satisfied mixed-type path, a removed required path and a rule-compliant added edge. The separate D1 worked case remains. |

All historical numerical results, retained research evidence and 17 venue citations
are preserved. The scientific changes concern presentation and interpretation;
they add no repository experiment or comparative result.

On 4 November 2026 the user authorized merging [PR #60](https://github.com/Little-Boy-s-ArchSync/archsync-paper/pull/60) and incorporating it into this revision. The combined candidate retains all five corrections above and the 131-word abstract, with Vo Duc Hieu, Tran Minh Hoang, Le Van Kiet and Ha Hoang Bach as the four listed authors and Vo Duc Hieu as corresponding author. That integration also retained PR #60's native compact-column balancing and documented ACM publisher/address omission. The 5 November guide revision preserves native balancing but supersedes the omission by restoring the unmodified ACM reference block. Repository-integration authorization does not establish the removed individuals' consent, the listed authors' final acceptance or portal submission authorization.

Earlier build, figure/table inspection and exact-source package verification
are recorded in `validation.json`, `VISUAL-REVIEW.md`, `visual-inputs.json` and
`package-rebuild.json` for their original PDFs. The current audit links the 5 November
validation and visual receipts; archive verification is recorded in
`package-rebuild.json`. Normalized scientific wording matches merged commit
`586150ff30b618b5a6d8bb38a687530c3ef07b7c`.
