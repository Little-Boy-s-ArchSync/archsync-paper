# ICIIT 2027 (Ho Chi Minh City): disclosure and submission check

Checked 27 September 2026 against the live submission page, its linked LaTeX
archive, ACM's authorship policy, and the visible submission portal.
Status: revised local candidate; submission-specific questions remain unresolved.

## AI disclosure

The [ACM authorship policy](https://www.acm.org/publications/policies/new-acm-policy-on-authorship),
updated 14 May 2026, applies to ICPS proceedings. It requires detailed disclosure
of research-related AI use in the methods. It no longer requires disclosure for
writing assistance alone. It does not prescribe a separate declaration section
or an AI checkbox. The policy was read directly in the browser after the text
retrieval service returned HTTP 403.

Section 5's paragraph is now explicitly headed “Methods and AI-use disclosure.”
It identifies OpenAI Codex and delegated coding agents, the finite oracle,
adversarial inputs, mutation harness, implementation changes, execution and output
inspection. Section 6 separately states the absence of independent human validation.
This addresses the published methods-location requirement for the described
reliability campaign; the authors must confirm the completeness of the disclosure
for any other research use. A generic acknowledgement would not replace it.

No additional AI declaration rule was found on the checked public
[conference submission page](https://www.iciit.org/sub.html).
The [portal](https://confsys.iconf.org/submission/iciit2027) showed “Session Expired”
and email/password login fields. Its submission form and any AI checkbox were
not accessible. No claim is made that a checkbox is absent behind login.

## Candidate, length and template

The intended working candidate for this pass is `iciit2027-compact.pdf`, five
pages in double columns including references. It has not been submitted or
selected in a portal. The single-column alternative is ten pages, not nine,
including its technical appendix. Neither supplement upload nor its page-count
exemption is confirmed.

The submission page specifies a minimum of four double-column/eight single-column
pages. Regular registration covers five/ten respectively; extra pages are charged.
These are not a published hard maximum. The compact candidate fits that allowance.
However, the supplied `sample-sigconf.tex` recommends `manuscript, screen, review`
for review. The public page does not resolve this profile ambiguity, so five-page
length compliance alone does not establish the required initial upload format.

A fresh official archive matches both retained `acmart.cls` and
`ACM-Reference-Format.bst` byte-for-byte. The source uses the official sigconf
option for compact profiles. The custom named-author renderer is an intentional
exception: the user deferred changing it during this check. It remains unchanged
and is not certified as an exact template match. The supplied sample prohibits
manual layout alterations. No font/margin reduction was made in this pass.
Fresh retrieval hashes are in `official/2026-09-27-compliance/retrieval.json`;
the downloaded originals are retained in the workspace preparation folder.

## Review anonymity and contributions

No explicit venue-specific double-blind requirement was found in the public
instructions. The generic template supports anonymous review but does not decide
this conference's policy. Review anonymity therefore remains unconfirmed. If the
actual instructions require it, use `iciit2027-compact-anonymous.pdf` for an allowed
compact profile, or the corresponding anonymous review profile. Anonymous PDFs
are checked for identifying text and metadata; prior public history still exists.

No mandatory standalone CRediT section was found in the checked public instructions
or ACM policy. Optional contribution prose remains outside the manuscript.
An authenticated portal check or organizer clarification is still needed for the
upload profile, anonymity and any submission-only declarations.

## Proofread changes

- Explicitly map Table 2 rows to RQ1–RQ4 at the start of the Results paragraph.
- Shorten the Related Work forward-reference and use resolved section labels.
- Add the missing textual reference to Figure 1.
- Label the existing detailed AI methods disclosure explicitly.
- Render two conference papers as proceedings entries so their existing booktitles
  appear; remove the duplicate series label from the ArchLintor reference.
  Publisher confirmation: [mapping paper](https://link.springer.com/chapter/10.1007/978-3-031-66326-0_1)
  and [IaC paper](https://link.springer.com/chapter/10.1007/978-3-031-16697-6_7).

No measured results, author identities/order, active literature selection or
original evidence bytes are changed. A separate 90-second coauthor reading sheet
is prepared in `FRESH-READ.md`; no fresh human review is claimed.

## Verification outcome

All five profiles rebuilt successfully: compact named/anonymous 5 pages each,
review named/anonymous 10 each, supplement 3. All 25 cited keys resolve; internal
section/figure/table labels are unique and resolved. No undefined citations,
references, missing glyphs, errors or overfull boxes occur in the retained build
logs. Tables are byte-identical to the preceding source, and evidence hashes pass.
All profiles were visually inspected, with the edited compact pages checked at
reading size. See validation.json and visual-inputs.json for exact artifact hashes.
