# Rendered visual QA

Current integration review: see the final section below. Earlier candidate
hashes and layout descriptions are historical, not the current IEEE PDFs.

**Final candidate status: PASS for named 8-page and 12-page rendered layout.** All 20 final pages were freshly rendered and inspected after the rebuild; figure and table pages were additionally checked at 130 dpi, and the final bibliography page at 100 dpi. The former 9-page short-version issue, isolated-reference-only12th page, and both Fig-2 factual labels are resolved. This scope does not certify anonymous PDFs or external submission requirements.

Review performed on actual Poppler rasterizations, not source-only checks. Standalone vector figures were rendered at 110/130 dpi; every page of both named article PDFs was rendered at 65 dpi and visually inspected. Article pages containing figures and the dense table layout were additionally rendered and inspected at 160 dpi. Temporary review images are under `/tmp/archsync-visual-qa/`; they are not manuscript deliverables.

## Snapshot reviewed

The initial named “12-page” PDF had 12 pages; the initial “8-page” PDF had 9 pages. This report records those builds (initial article modification time 2026-09-15 02:12 local). If article/figure sources are subsequently rebuilt, the corresponding changed pages need another rendered check. No anonymous PDF was included in this bounded visual task.

## Findings from initial render (correction status below)

1. **Fig-2, D1 EVIDENCE box:** rendered text remains `TP/FP/FN + P/R/F1`, whereas revised D1 reporting explicitly uses matched/extra/missed counts. The figure needs to follow that revision; D2 rates should remain.
2. **Fig-2, P3 EVIDENCE box:** rendered text visibly reads `571189 files parsed`. Table 3 clearly reports `57/189`; the figure needs an unambiguous separator or wording such as “57 of 189 files parsed.” This is visible in both standalone and article rendering at high resolution, not merely OCR output.
3. **Initial 12-page article, page 12:** almost entirely blank, with only the tail of reference [25] split across the two columns. The reference list should fit/flow cleanly rather than leave an isolated fragment on an otherwise empty page.
4. **Initial 8-page article:** has 9 pages. Its final page contains references [15]–[25] and substantial blank space. Root is already revising its page count; this inspection does not certify an eight-page final version.

## Readability and placement

- Both figures retain intact rounded boxes, labels and arrowheads without visible clipping. Fig-1's arrows reach their intended boxes; no layout correction to the user's overall design is needed.
- Fig-1's small light-gray mathematical arrow labels (`M,R`, `G_b`, `G_h,P`) have low contrast and are hard to read at article size. Main stage and gate labels remain legible. Darkening these small labels would improve readability without changing the design.
- Fig-2's small text requires zoom at normal document overview size; high-resolution article rendering confirms crisp text rather than raster degradation. It is denser than body text. Larger labels/fewer audit details would help if space allows; preserving the vector asset supports zoomed reading.
- 12-page article figures occur on pages 6 and 8; 9-page short article figures occur on pages 5 and 7. Captions sit directly below their corresponding figures, fully inside the text width.
- Tables 1–3 share a page coherently (full-width Table 1 above side-by-side Tables 2 and 3). Table 4 is a full-width table on the following page. No visible clipping, overlapping rules, detached table headings, or numbers outside cells were observed.
- The PostgreSQL example remains inside its column. Equations and body text stay within the article margins. Running headings do not collide with figures/body text.
- The split of the end of Implementation across the Fig-1 page is readable but somewhat awkward; it is not a clipping defect.

## Files present when report was written

| File | SHA-256 | Local modification time |
|---|---|---|
| `figures/Fig-1.pdf` | `b5733121ebde2c78de21664f5cb6a49e1b5aef4ba4aa4c3835b724acfc48fbcd` | 2026-09-15T00:32:54.320703 |
| `figures/Fig-2.pdf` | `964e9d201afa5858ea78f354a1b1dd7c8c929a79e4c2ac84d7d33ca3a32734a1` | 2026-09-15T00:32:54.452430 |
| `archsync-12page.pdf` | `e63c110bbab19a1fd67a68f794480ca41f83e45300eeb5efd40774722cd5c997` | 2026-09-15T02:13:54.552803 |
| `archsync-8page.pdf` | `2e6130ac64084b8d40bfde01d4f5078daf348a3080cabc422b116a2e80737173` | 2026-09-15T02:13:46.041208 |

These identifiers help distinguish the reviewed snapshot from later builds; final layout approval depends on rechecking changed rendered pages. Visual QA initially added only this report; a subsequent authorized correction changed the two Fig-2 text strings and added single-figure selection to the existing export script.

## Corrected Figure 2 verification

The two factual Fig-2 text issues are resolved in the editable `figures/Fig-2.svg` and regenerated vector `figures/Fig-2.pdf`: D1 now says “Matched, extra, missed”; P3 now says “57 / 189 files parsed.” A fresh 130 dpi Poppler render was inspected: both lines fit inside their original boxes and geometry/arrows remain unchanged. Fig-1 was not modified. The original user files outside the manuscript directory were not touched.

Reproduction uses the existing `scripts/export-manuscript-figures.cjs`, which now accepts `2` to export only Fig-2. Run with Playwright available through NODE_PATH and CHROMIUM_PATH pointing to an installed Chromium executable. In this workspace the bundled Playwright packages and locally installed Chromium1208 were used. The exporter retains SVG dimensions and uses print-to-PDF vector output; the PDF page measures696.96×261.12pt, as before. No raster overlay was used.

Corrected figure SHA-256: `6f78f4a11ef64dbdeed492e9ae94d96ec4673876c91d0d9ee5ea92aca1006b4e`.

Article page-flow findings were subsequently resolved and rechecked as recorded below; the earlier12/9page screenshots are retained only as historical QA notes.

## Final candidate recheck

The named PDFs created at 02:19:46 (8-page) and 02:19:55 (12-page) local time on 2026-09-15 were independently rendered with Poppler after the rebuild. Every page was inspected at 65 dpi; the corrected figure and changed table layout were also inspected at 130 dpi, and the last bibliography page at 100 dpi.

- `archsync-8page.pdf`: exactly 8 pages. Figures appear on pages 4 and 5. Tables 1–3 flow on page 6, with Tables 2 and 3 stacked in the left column; Table 4 is on page 7. All captions, table rows, code and equations remain inside the margins. Page 8 contains a substantive continuation of references, not the former ninth-page overflow.
- `archsync-12page.pdf`: exactly 12 pages. Figures appear on pages 6 and 8. Tables 1–3 flow on page 9; Table 4 is on page 10. The final page now contains references 11–25 plus continuation fragments of adjacent entries, rather than only the isolated end of reference 25. Normal whitespace remains below the reference list; no nearly-empty orphan page remains.
- The rebuilt articles visibly include corrected Fig-2 text: “Matched, extra, missed” and “57 / 189 files parsed.” No diagram boxes, arrows, or labels are clipped.
- No visible table overlap, margin overflow, body-text collision, or truncated equations were found in the final render. Small reference-entry continuations at column/page starts are normal bibliography flow and are not blocking defects.
- Remaining nonblocking readability note: Fig-1's small pale mathematical arrow annotations need zoom; its main stage/gate labels remain readable. Figure 2 is dense but sharp under zoom. Neither figure was rasterized to fit the paper.

### Final reviewed PDF identities

| File | SHA-256 |
|---|---|
| `archsync-8page.pdf` | `9c09c6f50d4d7ea41f37ebb45e509c74218d5003fa4b3b4d8d6536a60a48a57c` |
| `archsync-12page.pdf` | `1919f06e1f235153db5befdb0e42e2230b21e8109f91911d1c7fdfcfda654a06` |


## Superseding recheck after withdrawal of external-comparison claims

On 2026-09-15, the canonical sections and both complete length variants were rebuilt after removing the disputed external inventory from the reported evaluation. External comparison is explicitly future work, with no accepted comparator result or common label mapping. Original D1 replay and graph totals are unchanged. The prior candidate hashes above are historical and do not identify this revised candidate.

All 20 pages of the rebuilt 8-page and 12-page PDFs were rendered with Poppler at a 640-pixel page height and inspected as page overviews. The short version's Figure 2 page and the long version's changed methodology page were additionally rendered and inspected at 120 dpi; the long version's final bibliography page was checked at 100 dpi. Rendered files are local QA outputs in `/tmp/archsync-revised-qa/` and are not manuscript evidence.

- Both complete versions remain exactly 8 and 12 pages with 25 citations each, resolved references, and no overfull text columns. No geometry, font-size, margin, or figure-size changes were needed.
- Short version: Figures 1 and 2 remain on pages 4 and 5. Tables 1–3 are on page 6; Table 4 is on page 7. Page 8 contains a normal reference-list continuation.
- Long version: Figures 1 and 2 remain on pages 6 and 8. Tables 1–3 are on page 9; Table 4 is on page 10. Page 12 contains references 12–25 and a preceding entry continuation in two columns; the former orphan-only final page has not returned.
- Revised comparison-method text, equations, table captions, and final references fit within their columns without collision or clipping. Figure 2 retains “Matched, extra, missed” and “57 / 189 files parsed.” Figure designs are unchanged.
- Final visual disposition: PASS. The earlier nonblocking note about small Figure 1 mathematical annotations under normal-scale viewing remains applicable.
- Canonical named and anonymous PDFs were also rebuilt; source/structure and actual-PDF checks pass, including author redaction in the anonymous draft.

| Revised file | SHA-256 |
|---|---|
| `archsync-8page.pdf` | `b5be03a53bccdfc0f1a7130937291b20ef757a94ded22d9decf11d663730dde9` |
| `archsync-12page.pdf` | `6551871e9f1c84f044559e7dedc2bbd463062f662fe9cde2d87cc5780ae7acfd` |
| `main.pdf` | `3b759a11adbfc342808be2d274bcd5a44068adc3efda5c0ed3e001af8188c194` |
| `main-anonymous.pdf` | `e10b1628b2dfe8feb62b5f686abd46eaf4b718989d88eeac49e554bffbeae96c` |

## Superseding IEEE integration recheck - 2026-09-15

All 20 article pages were rasterized with Poppler at a 1400-pixel page height
and visually inspected. Changed diagram and bibliography pages were rerendered
and rechecked. The full Figure 1/table page was additionally inspected at
1600 pixels. Current PDF identities are in length-variant-validation.json.

The full version is 12 pages and the concise version is 8. Both keep IEEE
body fonts and margins, straight quotation marks, dash list markers and
short mathematical arrows. No clipped equations, code, table entries or
overlapping figures were observed. Figure 1 uses vector TikZ with a shortened
header and black mathematical labels; Figure 2 shows matched/extra/missed,
9 call sites versus 2 anchors, and 57 / 189 file instances distinctly.
The PostgreSQL example fits its column. The concise final bibliography is
balanced using IEEE's reference-break control. Remaining white space at the
end of a reference list is normal; no observation was added to fill a page.

This is a layout check, not an independent scientific review. Earlier claims
about ACM presentation and pale Figure 1 labels are superseded.
