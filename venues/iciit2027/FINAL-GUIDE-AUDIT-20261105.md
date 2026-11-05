# Final guide and reviewer audit — 5 November 2026

Manuscript: *ArchSync: Evidence-Backed Conformance Checking for TypeScript Service Architectures*.
Target: **ICIIT 2027 (Ho Chi Minh City)**.

The five requested manuscript corrections remain in the source. The user's
later instruction makes the supplied local `LaTeX-Templates/` folder the
prevailing template authority: exact unmodified **`acmart` v1.90a**, DTX and
bibliography files. The earlier 2.21 production-template choice is superseded.
Each entry starts with `\documentclass`; review uses `manuscript,screen,review`
and compact proceedings preview plain `sigconf`. Tables use native fonts and
spacing. Native ACM Reference Format and semantic paragraph headings remain.
**The local-template build, all 40 venue tests, fresh validation and all 34
rendered-page inspections pass.** The five page counts are 10/5/10/5/4. Archive
identity/reconstruction is recorded in `package-manifest.json` and
`package-rebuild.json`; this audit carries no circular source ZIP hash.

The [local provenance receipt](official/2026-11-05/local-template-provenance.json)
binds all **55 supplied template files** to the original folder/ZIP. The supplied
README/DTX identify 1.90 while the supplied class identifies 1.90a; that difference
originates in the ZIP. The class is copied unchanged, rather than regenerated.

The initial native-font build exposed body line overflows. Seven scoped
`sloppypar` environments, permitted by the supplied `acmguide.pdf` §2.16 (p. 29),
and native-size `table*` cells resolve them. The final build has **zero body
overflows**. It retains one native output-routine diagnostic in each compact
profile: named 4.18721 pt horizontal box and anonymous 1.152 pt vertical box.
The complete last pages remain readable without overlap. Validation checks the
exact profile, context, size and count, rejecting other overflow variations.

The minimal `acmart-preload-hook.tex` resolves package loading order through the
local guide's documented mechanism (§2.20, pp. 30–31). Supplied class bytes and
first-command `\documentclass` entry points are preserved. Plain sample class
options remain, with no `pbalance` or `balance=false` override. All 40 venue tests,
fresh validation and visual review of all 34 pages pass. Archive verification
is recorded in `package-rebuild.json`.

## Five-comment review matrix

Source locations below use section titles, paragraph titles and TeX labels so
they remain identifiable after the formatting corrections. Earlier review
records retain their dated scopes.

| Requested correction | Status | Current source and evidence |
| --- | --- | --- |
| 1. Reduce repeated self-disclaimers and state the contribution positively. | **PASS** | [paper.tex](paper.tex), 131-word Abstract, Section 1 “Introduction” and Section 7 “Conclusion”: the executable combination and inspectable failure/repair evidence lead the narrative. Section 6 (`sec:validity`) consolidates limits. [appendix.tex](appendix.tex) retains reproducibility detail with shorter, positive explanations. |
| 2. Discuss expected real-project behavior and synthetic-data threats; keep D3 brief. | **PASS** | [paper.tex](paper.tex), Section 6, “Construct and internal validity,” “Expected behavior on real projects” and “External and comparative validity”: co-development, overfitting, anticipated signal balance, clustered reuse, wrappers/configuration, missed relations, false PASS/false BLOCK, host merging, contract staleness and repository scale are explicit. Expected behavior is identified as design-derived. [appendix.tex](appendix.tex), “Exploratory D3 and independent follow-up”: one paragraph states future exploratory, nonblind, module-only scope and absent results. |
| 3. Explain why the combination remains useful alongside ArchLintor and CALint. | **PASS** | [paper.tex](paper.tex), Section 1 contribution paragraph; [related-work.tex](related-work.tex), Section 2, “Closest conformance approaches” and “Published evidence and integration value”: a changed fetch destination can alter a service relationship while imports remain unchanged. Service observations connect to source evidence, explicit rules and base/head BLOCK/REVIEW decisions. Existing conformance concepts are attributed; no unique-capability or superiority result is asserted. |
| 4. Add explicit language/focus distinctions inside the comparison table. | **PASS** | [related-work.tex](related-work.tex), Table 1 (`tab:external`): “Language / focus” separates TypeScript module conformance, Python Clean Architecture, Java/Spring recovery and TypeScript service conformance at Git time. The published-context/non-executed-comparison caption and CALint abstract-only access qualifier remain. |
| 5. Include a legible Figure 1 and a tiny formal-definition example. | **PASS** | [paper.tex](paper.tex), Section 3 “Executable Contract and Change-Time Analysis,” “Tiny contract example,” and Figure 1 (`fig:workflow`): the three-component example uses `http`/`data` edges and contrasts satisfied path, removed required path (BLOCK) and an added rule-compliant edge (REVIEW). The Git gate figure is embedded directly in the shared source, with decision precedence in its caption and a text description. Figure 1 and the tiny example pass fresh reading-size visual inspection in the current profiles. |

The [4 November response](REVIEW-RESPONSE-20261104.md) maps the same five
requests. The [27 September audit](REVIEW-RESPONSE-20260927.md) is an earlier
scientific assessment, including evidence requirements that prose revisions
cannot fulfill.

## Current official-guide checklist

Official sources checked for this audit: [submission instructions](https://www.iciit.org/sub.html),
[important dates](https://www.iciit.org/date.html),
[registration](https://www.iciit.org/reg.html),
[conference page](https://www.iciit.org/) and the
[submission portal](https://confsys.iconf.org/submission/iciit2027).
The current template source is the user's existing workspace folder
`LaTeX-Templates/`, specifically its README, `samples/sample-manuscript.tex`,
`samples/sample-sigconf.tex`, `acmart.cls`, `acmart.dtx` and
`ACM-Reference-Format.bst`. The class declares **v1.90a, 11 June 2023**.
The [local provenance receipt](official/2026-11-05/local-template-provenance.json)
binds all copied template files to the user-supplied ZIP. Its local class SHA-256 is
`c27fec209ad1e1be8af87ffc63295c3833ba83238e34f594d36c89a4e48fa48c`;
its BST SHA-256 is
`6225898340ce8ca3536ab1141cfd822e4d80049bd3a19c85bd6221072e2466d0`.

Local sample instructions are explicit: `sample-manuscript.tex` lines 37–48
require a first-command class declaration and review options; lines 352–355
prohibit manual template alterations; lines 470–476 require standard sectioning;
lines 609–626 require figure descriptions. Table descriptions are retained
accessibility additions, rather than requirements asserted from this local
sample. The current revision removes explicit small table fonts, `pbalance`,
`emergencystretch` and reduced `tabcolsep` overrides.

The earlier production audit remains historically accurate: venue-ZIP raw
retrieval failed, direct ACM download returned HTTP 403, and unmodified CTAN
2.21 was acquired and tested. Its
[production provenance](official/2026-11-05/production-template-provenance.json)
is retained as a superseded template-selection record. It no longer establishes
which package the user requested for the current candidate.

| Guide item | Current requirement or finding | Candidate disposition |
| --- | --- | --- |
| Full-paper submission deadline | **30 November 2026** on the current official dates page. | Supersedes the September deadline in dated preparation notes. Public cutoff timezone remains to be confirmed. |
| Abstract submission deadline | **5 December 2026** on the current official dates page. | Record separately from the full-paper deadline; do not interchange the two dates. |
| Notification | **20 December 2026**. | Planning date, not a decision on this manuscript. |
| Registration | **10 January 2027**. | Registration and payment remain separate author actions. |
| Conference dates and place | **4–7 March 2027, Ho Chi Minh City, Vietnam**. | Check source/metadata event fields against the current guide. |
| Supplied template | The user's local v1.90a class/DTX/BST and README/samples prevail. | Exact local bytes; first-command `\documentclass`; plain sample class options; native citation and table typography. All 40 venue tests and fresh validation pass. |
| Minimum manuscript length | **8 single-column pages or 4 double-column pages**, including references. | Review profiles have 10 pages, compact previews 5 pages and the separate supplement 4 pages. |
| Regular page allowance | **10 single-column pages or 5 double-column pages**; extra-page conditions are separate. | Main profiles fit 10/5 pages at native local-template fonts/margins. The allowance is not represented as an unconditional hard maximum. |
| Paragraph headings | Local sample requires standard sectioning and prohibits simulated bold paragraph headings. | Semantic paragraph commands retained; source and current rendered checks pass. |
| Figures and tables | Local sample requires figure captions/descriptions, proper caption positions and booktabs table rules. | Figure 1 description retained; table descriptions are additional metadata. Manual small table fonts and reduced padding are removed. All 34 current pages pass reading-size visual inspection. |
| Named/anonymous and initial review profile | Public pages do not settle every authenticated upload requirement. | The single-column `manuscript,screen,review` profile is the primary guide-aligned review candidate; compact output is a proceedings preview. Named/anonymous choice still follows portal/organizer instructions. |
| Supplementary appendix | Separate-upload acceptance and page counting remain unconfirmed. | Review profiles include the appendix; the separate supplement retains four-author metadata, abstract, CCS concepts, keywords and native reference text. The separate supplement is 4 pages and visually inspected. |
| Author information | Four listed authors: Vo Duc Hieu, Tran Minh Hoang, Le Van Kiet, Ha Hoang Bach; Hieu is corresponding author. | Separate author/affiliation/email/ORCID metadata retained; the local class controls presentation. Individual final acceptance and removed individuals' status remain separate. |
| Research and AI-use disclosure | Preserve accurate methods, data scope, provenance and actual assistance. | Section 5 methods disclosure and Section 6 validity boundaries retained. No invented independent study or D3 result. |

## Remaining scientific evidence requirements

These are future study requirements retained from the September audit. They
are distinct from the five completed editorial requests and the guide-format
corrections.

| Requirement | Current boundary and exact location | What would close it |
| --- | --- | --- |
| Independent repository accuracy | [paper.tex](paper.tex), Section 6 “External and comparative validity”; [appendix.tex](appendix.tex), “Exploratory D3 and independent follow-up.” One small synthetic system and co-developed detector signals supply development agreement. | Frozen, lineage-separated real projects and independent full-scope relation labels, including misses, disagreements, unsupported cases and per-project coverage. |
| Executed external comparison | Table 1 is published context; D2 v0.1/v0.2 is within-tool development. Section 6 and the appendix keep these units distinct. | A nonempty matched observation unit, approved frozen tool/configuration/scoring choices and retained paired execution outputs. Module-import results cannot stand in for service-interaction accuracy. |
| Measured integration/developer benefit | [paper.tex](paper.tex), Section 6 “Conclusion validity and next steps”; September response, “Work that actually closes the main scientific gaps,” item 6. | An appropriate predeclared comparison/ablation and measurement of false blocks, review effort or practitioner outcomes. Present contribution remains descriptive. |
| Controlled speed and scalability | [paper.tex](paper.tex), Section 4 timing paragraph and Section 6 “Conclusion validity and next steps.” Historical timings combine multiple costs with missing environment controls. | Paired workloads and environments, controlled cache/timing conditions and retained failures. Repeated timings alone do not enlarge the independent project population. |
| Literature access/coverage | Table 1 records CALint as abstract-only; Section 6 describes purposive coverage and overlapping source projects. | Verified exact full texts and source-specific appraisal where obtainable. No exhaustive-SLR or ranking certification is inferred. |

The active literature review remains **23 chosen papers from 2022–2025**.
The **17 venue citations** are a separate manuscript set. This audit does not
restart the 35,540-record classifier, the older 302-record queue or historical
retrieval work. The prepared D3 packet remains future exploratory work and
supplies no new empirical result here.

## Recorded review scope

| Repository review | Observed state and exact commit | Scope of the recorded approval |
| --- | --- | --- |
| [PR #60](https://github.com/Little-Boy-s-ArchSync/archsync-paper/pull/60) | Account `teikv` approved `9655c7d31263aefbf3b923b03eb9d81dfe45009b` on 30 September 2026. PR subsequently merged. | Technical author/correspondence, template-exception and artifact checks. The review explicitly withheld claims about individual consent, organizer acceptance, independent D3 evidence and submission readiness. |
| [PR #61](https://github.com/Little-Boy-s-ArchSync/archsync-paper/pull/61) | Account `an1dee3301` approved `5ea8064fe3f50c001728b770ec4c5ec4f45c2bb2` on 5 November 2026. PR merged as `586150ff30b618b5a6d8bb38a687530c3ef07b7c`. | Repository integration and technical document checks, including preservation of the five fixes alongside the four-author update. Scientific study status and submission declarations remain as documented. |

No inline review comments were found on either PR at the audit snapshot.
PR #60's earlier comments describe successive heads and are interpreted at
those commits; its initial six-email description is historical. PR #61 had
no issue comments. These account records establish the recorded GitHub review
scope, rather than additional scientific results or blanket author approval.

## Current local-template verification

| Check | Final result and evidence |
| --- | --- |
| Exact supplied template | **PASS**: 55 files match the user-supplied folder/ZIP `e0272aab…`; class 1.90a and original README/DTX 1.90 labels are preserved without regeneration. `official/2026-11-05/local-template-provenance.json` binds the identities. |
| Build and page counts | **PASS**: named review 10, named compact 5, anonymous review 10, anonymous compact 5, supplement 4 pages. First-command class entries use plain local sample options. |
| Regression and fresh validation | **40/40 tests PASS**; `validate.py --fresh` passes. Template identity, metadata, native fonts, class options, preload hook, scoped paragraph wrapping, reference text, descriptions and redaction are checked. |
| Rendered inspection | **PASS**, all 34 pages. Reading-size checks cover first pages, native-size full-width tables, tiny example, Figure 1 and complete references. Letter geometry, embedded native fonts and PDF creator 1.90a are verified. Current hashes are in `visual-inputs.json`; scope is in `VISUAL-REVIEW.md`. |
| Body layout | **Zero body overflows** after seven local `sloppypar` scopes permitted by guide §2.16 and regular-size `table*` cells. No `pbalance`, `balance=false`, global font/margin/spacing changes or reduced table-padding override is retained. |
| Native output diagnostics | Exactly one named-compact 4.18721 pt horizontal output box and one anonymous-compact 1.152 pt vertical output box remain. The complete last pages are readable without overlap. Validation rejects any other profile, context, size or count. |
| Package-order compatibility | The minimal `acmart-preload-hook.tex` uses the supplied guide's §2.20 mechanism. It resolves package loading order while preserving byte-identical supplied class files and first-command class entries. |
| Scientific text and metadata | **PASS**, paper, related work and appendix match merged `586150ff30b618b5a6d8bb38a687530c3ef07b7c` under markup-only normalization. Proof is retained in the parent workspace at `preparation/2026-11-05-template-folder/scientific-text-check.json`. Four authors, Hieu correspondence, four emails/ORCIDs, 131-word main abstract, 17 venue citations and the separate 23-paper review remain. |
| Exact-source archive reconstruction | Archive identity and verification are recorded externally in `package-manifest.json` and `package-rebuild.json`. The rebuild receipt requires successful reconstruction and identical page text for all five profiles; this audit is itself included in that archive. |

## Superseded 2.21 verification snapshot

Before the later local-folder instruction, the unmodified production 2.21
candidate built with pdfLaTeX/TeX Live 2024 at 10/5/10/5/4 pages, passed 37
venue tests, and passed visual inspection of 34 pages. Its scientific wording
matched merged `586150ff30b618b5a6d8bb38a687530c3ef07b7c` after normalizing
heading markup and non-visible descriptions. Its exact source ZIP rebuilt
successfully. Those observations remain facts about that candidate; they are
not a test or page-count receipt for the new local-template revision.
