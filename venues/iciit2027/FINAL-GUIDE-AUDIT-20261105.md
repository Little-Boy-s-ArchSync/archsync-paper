# Final guide and reviewer audit — 5 November 2026

Manuscript: *ArchSync: Evidence-Backed Conformance Checking for TypeScript Service Architectures*.
Target: **ICIIT 2027 (Ho Chi Minh City)**.

The five requested manuscript corrections pass the source and rendered audit.
The current revision restores native ACM citation presentation, uses standard
paragraph headings and describes both tables. All five profiles build with
pdfLaTeX/TeX Live 2024 at **10/5/10/5/4 pages**; **37 venue tests pass**, and
**all 34 rendered pages pass visual review**. The scientific wording, normalized
for these formatting changes, matches merged commit
`586150ff30b618b5a6d8bb38a687530c3ef07b7c`. Current artifact identities are bound by
`validation.json` and `visual-inputs.json`; archive verification is recorded in
`package-rebuild.json` and the source-archive identity in `package-manifest.json`.

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
| 5. Include a legible Figure 1 and a tiny formal-definition example. | **PASS** | [paper.tex](paper.tex), Section 3 “Executable Contract and Change-Time Analysis,” “Tiny contract example,” and Figure 1 (`fig:workflow`): the three-component example uses `http`/`data` edges and contrasts satisfied path, removed required path (BLOCK) and an added rule-compliant edge (REVIEW). The Git gate figure is embedded directly in the shared source, with decision precedence in its caption and a text description. The current five profiles were visually checked at reading size, including Figure 1 and the tiny example. |

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
The [venue template ZIP](https://www.iciit.org/LaTeX-Templates.zip) could not be
retrieved as raw bytes during this audit, and direct ACM production download
returned HTTP 403. The current **ACM production `acmart` 2.21** release (class
dated 1 November 2026) was obtained through
[CTAN](https://mirrors.ctan.org/macros/latex/contrib/acmart.zip). The class was
generated with the supplied `acmart.ins` installer against unchanged production
sources; the class and bibliography files have no local patches.
[Production provenance](official/2026-11-05/production-template-provenance.json)
retains the archive identity, generated-class method and per-file hashes.
[Raw retrieval records](official/2026-11-05/retrieval.json) retain individual
failures as failures. The current production release and native reference block
supersede the earlier package and publisher/address omission.

| Guide item | Current requirement or finding | Candidate disposition |
| --- | --- | --- |
| Full-paper submission deadline | **30 November 2026** on the current official dates page. | Supersedes the September deadline in dated preparation notes. Public cutoff timezone remains to be confirmed. |
| Abstract submission deadline | **5 December 2026** on the current official dates page. | Record separately from the full-paper deadline; do not interchange the two dates. |
| Notification | **20 December 2026**. | Planning date, not a decision on this manuscript. |
| Registration | **10 January 2027**. | Registration and payment remain separate author actions. |
| Conference dates and place | **4–7 March 2027, Ho Chi Minh City, Vietnam**. | Check source/metadata event fields against the current guide. |
| Proceedings template | ACM format using the official class and bibliography style. | Unmodified production class/BST verified against the CTAN provenance receipt. Native ACM publisher/address citation restored: **PASS**. Compact previews use documented `pbalance`. |
| Minimum manuscript length | **8 single-column pages or 4 double-column pages**, including references. | Review profiles have 10 pages and compact previews 5 pages, including references; the separate supplement has 4 pages. |
| Regular page allowance | **10 single-column pages or 5 double-column pages**; extra-page conditions are separate. | Main profiles fit the regular allowance with standard class fonts/margins. The allowance is not represented as an unconditional hard maximum. |
| Paragraph headings | Use semantic sectioning consistent with the official template. | Manual bold paragraph leads replaced with standard paragraph headings; source and rendered checks **PASS**. |
| Figures and tables | Include the cited material, legible labels/captions and appropriate text descriptions. | Figure 1 and both tables have text descriptions. The four-column comparison, tiny example and Figure 1 are legible at reading size: **PASS**. |
| Named/anonymous and initial review profile | Public pages do not settle every authenticated upload requirement. | The single-column `manuscript,screen,review` profile is the primary guide-aligned review candidate; compact output is a proceedings preview. Named/anonymous choice still follows portal/organizer instructions. |
| Supplementary appendix | Public confirmation of a separate supplementary upload and its page counting remains absent. | Review profiles include the appendix; compact readers have a 4-page supplement with four-author metadata, its own abstract, CCS concepts, keywords and native ACM reference block. Portal acceptance remains unconfirmed. |
| Author information | Four listed authors in order: Vo Duc Hieu, Tran Minh Hoang, Le Van Kiet, Ha Hoang Bach; Hieu is corresponding author. | Per-author affiliations, four emails and four ORCIDs match source/metadata; all four ORCID check digits are valid. Ignored legacy postal values are omitted. Repository integration was authorized; individual final acceptance and removed individuals' status remain separate. |
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

## Final verification receipts

| Verification | Result and retained record |
| --- | --- |
| Five-profile build | **PASS**, pdfLaTeX/TeX Live 2024. Named review 10 pages; named compact 5; anonymous review 10; anonymous compact 5; supplement 4. `validation.json` binds each PDF. |
| Venue regression checks | **37/37 PASS** in `test_validate.py`, covering template identity, metadata, native reference text, semantic headings, descriptions, redaction and retained package contracts. |
| Rendered inspection | **PASS**, all 34 pages. First pages, headings, Table 1, tiny example, Figure 1 and complete references were inspected at reading size. `visual-inputs.json` binds the inspected PDFs; `VISUAL-REVIEW.md` records scope. |
| Layout diagnostics | Named profiles and supplement have no recorded overflow. Anonymous compact retains a 1.1135 pt output-routine vertical-box warning; the rendered references remain complete and legible. The diagnostic is retained in validation/logs. |
| Scientific text preservation | **PASS**, normalized scientific wording matches merged `586150ff30b618b5a6d8bb38a687530c3ef07b7c`. The parent workspace retains `preparation/2026-11-05-final-guide-audit/scientific-text-check.json`. |
| Author/abstract checks | **PASS**, four authors in order, Hieu correspondence, per-author affiliations, four emails, four valid ORCID check digits and unchanged 131-word main abstract. Supplement metadata supplies the same four authors. |
| Production source identity | **PASS**, production `acmart` 2.21 generated by its supplied installer; unmodified DTX/BST/source identities in `official/2026-11-05/production-template-provenance.json`. |
| Exact-source archive reconstruction | Verification is recorded in `package-rebuild.json`; its archive identity must match `package-manifest.json`. The receipt requires successful reconstruction and identical page text for all five profiles. |

The source ZIP hash is recorded externally in `package-manifest.json` and
`package-rebuild.json`, avoiding a circular hash dependency because this audit
is itself included in the ZIP. Earlier technical approvals retain their original
commit scope; final submission declarations and the future empirical evidence
requirements above remain separate.
