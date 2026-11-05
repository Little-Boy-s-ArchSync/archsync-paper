# Response to the five review comments — 4 November 2026

Manuscript: *ArchSync: Evidence-Backed Conformance Checking for TypeScript Service Architectures*.
Target: ICIIT 2027 (Ho Chi Minh City).

Template follow-up, 5 November 2026: all five corrections below are retained.
The [current audit](FINAL-GUIDE-AUDIT-20261105.md) now follows the user's supplied
local `LaTeX-Templates/` folder: exact unmodified `acmart` v1.90a files,
first-command `\documentclass`, review `manuscript,screen,review`, compact
plain `sigconf`, and native table fonts/spacing. The prior 2.21 choice is
superseded. Native reference text and semantic paragraph headings remain;
Figure 1 has the description required by the local sample, and both table
descriptions are retained additions. Four authors with Hieu correspondence,
the 131-word abstract, 17 citations and separate 23-paper scope remain.
All 40 venue tests and fresh validation pass. Five local-template profiles have
10/5/10/5/4 pages; all 34 rendered pages pass reading-size inspection. Archive
verification is recorded in `package-rebuild.json`.

The local reference copy contains 55 byte-identical supplied files. Its README/DTX
version 1.90 and class version 1.90a differ in the original ZIP; the class is
copied unchanged. Native-font build 1 produced 10/5/10/5/4 pages with horizontal
overflows. The local guide's §2.16 permits the seven scoped `sloppypar` remedies;
regular-sized table cells use `table*`. Its §2.20 documents the package-order
preload hook, which leaves supplied class bytes and first-command entries intact.
Final body overflows are zero. One native named-compact 4.18721 pt horizontal
output box and one anonymous-compact 1.152 pt vertical output box are retained
with complete, readable last pages; validation enforces exact profile, context,
size and count. No balancing-option override is retained.

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

On 4 November 2026 the user authorized merging [PR #60](https://github.com/Little-Boy-s-ArchSync/archsync-paper/pull/60) and incorporating it into this revision. The combined candidate retains all five corrections above and the 131-word abstract, with Vo Duc Hieu, Tran Minh Hoang, Le Van Kiet and Ha Hoang Bach as the four listed authors and Vo Duc Hieu as corresponding author. That integration also retained PR #60's native compact-column balancing and documented ACM publisher/address omission. The 5 November revision restores the native ACM reference block. The subsequent local-folder instruction also removes the added balancing option in favor of plain sample class options. Repository-integration authorization does not establish the removed individuals' consent, the listed authors' final acceptance or portal submission authorization.

Earlier build, figure/table inspection and source-package checks retain their
original byte scope. The superseded 2.21 candidate passed 37 venue tests and
visual review of 34 pages; those counts are historical. Current local-template
receipts bind the rebuilt PDFs in `validation.json` and `visual-inputs.json`;
archive verification is recorded in `package-rebuild.json`. Scientific wording
matches merged `586150ff30b618b5a6d8bb38a687530c3ef07b7c` under markup-only
normalization, recorded in the parent workspace at
`preparation/2026-11-05-template-folder/scientific-text-check.json`.
