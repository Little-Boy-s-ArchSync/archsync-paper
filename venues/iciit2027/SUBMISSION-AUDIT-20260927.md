# ICIIT 2027 submission suitability check

Checked: 2026-09-27. Target: the ACM proceedings route, not the alternative journals.
Verdict: plausible topical fit and mechanically validated candidate formats;
not a guarantee of acceptance and not final submission authorization.

## Official requirements and this paper

| Area | Finding | Disposition |
| --- | --- | --- |
| Scope | CFP group 5 explicitly includes Service-Oriented Computing and Intelligent Software Systems; group 2 includes information extraction/classification and decision support. | ArchSync's typed service observations and conformance gate are a reasonable fit. This is an assessment, not a program-chair decision. Do not claim the runtime tool uses an LLM merely to fit the title of the conference. |
| Publication route | ICIIT advertises ACM proceedings separately from JAIT and Optoelectronics Letters. | Use the ACM venue package, not the longer IEEE working PDFs. Publication/indexing statements on the site are not independent guarantees of acceptance or future indexing. |
| Template | The LaTeX archive linked from the submission page matches the retained class and bibliography bytes. Its sample prohibits margin, type-size, leading and manual vertical-spacing changes. | Removed the custom author renderer and author-row override. Standard ACM author macros render names in the confirmed order. Restored the ACM Reference Format block, with draft-target booktitle and no invented DOI/ISBN/rights. Existing emergency line-breaking reserve remains; no font, margin or leading is reduced. |
| Length | Minimum 8 single-column / 4 double-column pages, including figures, tables and references. Regular fee covers 10 / 5, not a published hard maximum. | Fresh named and anonymous review PDFs are 10 pages each; compact PDFs are 5 pages each. A separate 3-page supplement is not included in those totals and cannot be assumed uploadable or free of page counting. |
| Author contributions | No mandatory standalone per-author contribution section was found in the public ICIIT submission instructions, linked template or ACM authorship policy. | Omitted from typeset manuscripts at the owner's request. The venue body already omitted it; the IEEE variants now do too. Previous role declarations are preserved outside the paper in research/AUTHOR-CONTRIBUTIONS.md. |
| Author identities | Standard ACM manuscript mode prints names/affiliations but suppresses emails in its author renderer; compact mode prints the email records. | All six names, order, emails and four supplied ORCIDs remain validated in source and submission metadata. No fresh consent or missing identity is invented. |
| Research-use AI | ACM's 2026-05-14 policy requires detailed methods disclosure for AI used in conducting research, distinct from writing-only assistance. | Retained the methods paragraph describing Codex/delegated-agent assistance to code, oracle, tests and execution. Removing role lists does not remove this provenance. |
| Deadline | Official homepage/date page: full paper 30 September 2026; abstract-only 5 October. No cutoff time zone is stated. | A full paper, not merely an abstract, is needed for the publication route. Confirm the cutoff and submit before it once the actual candidate is approved. |
| Review identity/profile | Public submission instructions mention both lengths but do not explicitly select a mandatory review profile or state blind-review requirements. Public portal exposes login only. | Confirm single-column versus double-column and named versus anonymous in the logged-in portal or with the organizer. Absence of a public blind rule is not proof of single-blind review. |
| Research strength | D1/D2 are co-developed controlled data; P3 reuses D1. Finite oracle and regression/mutation counts are engineering verification, not independent field accuracy. | Suitable framing is a bounded prototype/reliability study. Independent real-repository holdout, executed external comparison and practitioner evidence remain missing. Do not call these risks eliminated or promise acceptance. |

## Outstanding information before upload

1. Portal instructions or an organizer reply confirming the exact initial review
   profile, anonymity, supplementary files/page counting and deadline time zone.
2. All six authors' agreement on the exact final candidate, order, substantial
   contributions/accountability, and submission. Confirm no conflicting
   simultaneous submission; disclose funding/conflicts where required.
3. Hoang Nguyen The and Minh Tam Phan's ORCIDs are not supplied. ACM requires all
   authors' valid ORCIDs before completion of eRights; this is not represented
   as an explicit ICIIT initial-upload prerequisite.
4. Registration, presenter and APC/waiver arrangements after acceptance. The
   venue has separate registration and APC rows; do not assume registration
   includes publication charges or that an institutional waiver applies.
5. Final independent manuscript review, exact PDF/package hashes and the
   repository's submission authorization process. CI or this audit cannot sign
   author declarations or remove the current NOT_READY governance boundary.

No portal upload, email, registration, payment, submission or public release
was performed by this check. Public Git history is not made anonymous by
generating an anonymous PDF.

## Sources and reproducibility

- [CFP](https://www.iciit.org/cfp.html)
- [Submission and official template link](https://www.iciit.org/sub.html)
- [Dates](https://www.iciit.org/date.html)
- [Registration/APC](https://www.iciit.org/reg.html)
- [Public submission portal](https://confsys.iconf.org/submission/iciit2027)
- [ACM authorship policy, updated 14 May 2026](https://www.acm.org/publications/policies/new-acm-policy-on-authorship)

Fresh Firecrawl extractions used maxAge=0 and are retained locally under
.firecrawl/iciit-20260927-*.json (ignored, not bundled as paper content).
The official template was downloaded directly again and checked at
2026-09-27T04:52:51Z:

- ZIP SHA-256: e0272aab662418d48c9b12df70d4815778eb1fb07f645ebbeacdcb7dded6ef44.
- acmart.cls SHA-256: c27fec209ad1e1be8af87ffc63295c3833ba83238e34f594d36c89a4e48fa48c.
- ACM-Reference-Format.bst SHA-256: 6225898340ce8ca3536ab1141cfd822e4d80049bd3a19c85bd6221072e2466d0.

These match the archived official assets. The raw-evidence archive and measured
research results are unchanged. See validation.json, visual-inputs.json and
package-rebuild.json for regenerated artifact checks.
