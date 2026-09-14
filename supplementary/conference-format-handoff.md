# Conference formatting handoff

Checked 15 September 2026 against official pages and downloaded templates. No venue has been selected by the user in this task. An 8-page and a 12-page master are not automatically submission-ready for every venue.

| Venue / track | Length and references | Template / paper size | Review anonymity | Official source |
|---|---|---|---|---|
| ICCTRDA 2026 full paper | 8–12 pages; base fee covers 8; pages 9–12 cost USD20 each. Whether references are excluded is unspecified: conservatively count everything. | Springer download actually contains `svmult`, sample `\\documentclass[graybox]{svmult}`. Submission page says A4. Downloads also contain IEEE files: do not use those accidentally. | Not specified. | https://www.icctrda.com/papersubmission ; https://www.icctrda.com/registrations ; https://www.icctrda.com/downloads |
| INISCOM 2027 regular / short | Regular 12–20; short 6–11. Explicitly excludes appendices, references and acknowledgments. Extra-page threshold and rate unclear. | Springer LNICST. Downloaded kit contains `llncs.cls`, `splncs04.bst`, sample `\\documentclass[runningheads]{llncs}`. Do not infer A4 from another conference; use supplied geometry. | Anonymized submission PDF required. | https://iniscom.eai-conferences.org/2027/call-for-papers/ |
| ICEIR 2026 full paper | 12–15; reference-counting unspecified: conservatively include everything. No 8-page full-paper option published. | Advertised LNNS, but template hyperlink points to Springer LNCS author instructions. Resolve template mismatch before final submission; LaTeX preferred. Paper size not independently specified. | Not specified. | https://iceir.nctu.edu.vn/ ; https://link.springer.com/series/558/information-for-authors-and-editors |
| ICIIT 2027 full paper | Minimum 8 single-column OR 4 double-column, including references/figures/tables. Base fee 10 single-column OR 5 double-column. Additional pages USD30 each; hard maximum unspecified. | Use supplied proceedings template; exact class not inspected. Single/double column both described. Do not infer ACM from previous editions. Paper size unspecified. | Not specified. | https://www.iciit.org/sub.html ; https://www.iciit.org/reg.html |
| SANER 2027 Research | 10 pages main incl. figures/appendices + up to 2 pages ONLY references. Thus 12 total is supported only with this allocation. | IEEE `\\documentclass[10pt,conference]{IEEEtran}`; omit compsoc/compsocconf. Use linked IEEE proceedings template; paper size not explicitly verified. | Double-anonymous. | https://conf.researchr.org/track/saner-2027/saner-2027-papers |
| ICSME 2027 Research | 10 main incl. figures/appendices + up to 2 reference-only pages. | IEEE proceedings; CFP explicitly says US Letter for Word. Inspect exact LaTeX instructions before building venue variant. | Not verified in this handoff. | https://conf.researchr.org/track/icsme-2027/icsme-2027-papers |
| SANER 2027 Tool Demo | 5 total including references. Neither 8 nor 12 supported. | IEEE proceedings. | Single-anonymous: names visible. | https://conf.researchr.org/track/saner-2027/saner-2027-tool-demo-track |
| ICSE 2027 Tool Demo | 4 total including references and all other material. Neither 8 nor 12 supported. | IEEE `\\documentclass[10pt,conference]{IEEEtran}`, no compsoc/compsocconf. | Single-anonymous. | https://conf.researchr.org/track/icse-2027/icse-2027-demonstrations |
| ICPC 2027 Tool Demo | 4 main +1 references; extra pages cannot be purchased. Neither 8 nor 12 supported. | IEEE `\\documentclass[10pt,conference]{IEEEtran}`, no compsoc/compsocconf. | Named paper and tool. | https://conf.researchr.org/track/icpc-2027/icpc-2027-tool-demonstration |
| ICSA 2027 Showcase | 4 main +1 references. Neither 8 nor 12 supported. | IEEE `\\documentclass[10pt,conference]{IEEEtran}`. | Single-anonymous. | https://conf.researchr.org/track/icsa-2027/icsa-2027-software-architecture-showcase |
| ICSA 2027 New and Emerging Ideas | 5 total including references, figures, appendices. Neither 8 nor 12 supported. | IEEE proceedings. | Double-anonymous. | https://conf.researchr.org/track/icsa-2027/icsa-2027-new-and-emerging-ideas |

## Practical decision for the requested two versions

- ICCTRDA is the clearest advertised single-venue 8/12-page pair, but references and Springer/A4 details need conservative handling or organizer clarification.
- INISCOM supports an 8-page **short-paper body** and a 12-page **regular-paper body**; references are additional. Exactly 12 PDF pages does not establish 12 qualifying body pages.
- ICEIR supports 12 pages but not 8; template mismatch unresolved.
- ICIIT supports an 8-page single-column submission. A 12-page single-column version exceeds included pages and needs maximum-length confirmation.
- SANER/ICSME research support 12 total only as at most 10 main plus2 reference-only pages. Tool tracks support neither requested length.
- Keep requested length variants separately labeled and preserve the full narrative review and empirical limitations. Do not silently claim submission compliance or choose a venue without the user's selection. Do not compress fonts/margins to meet counts.

## Template evidence inspected

ICCTRDA: https://www.icctrda.com/static/media/Springer%20LaTeX%20Template.e4fe0fa710887c3b82c4.zip — inspected archive and sample author.tex; `svmult`, `graybox`; bibliography package offers several styles without selecting one.

INISCOM: https://help.eai-conferences.org/wp-content/uploads/sites/88/2021/04/Springer_Latex_Template.zip — inspected samplepaper.tex; `llncs`, `runningheads`, `splncs04`; sample abstract150–250 words.

The user is exploring a Q1-journal goal. None of these conference formats establishes Q1-journal eligibility; preserve venue-neutral masters if no destination is selected. No manuscript files were edited by this handoff.
