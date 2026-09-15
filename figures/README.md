# Canonical paper diagrams

`Fig-1.svg` and `Fig-2.svg` are the author's canonical draw.io designs. Both
IEEE length variants embed the corresponding `Fig-1.pdf` and `Fig-2.pdf`.
Do not substitute the alternate TikZ drawings for these supplied designs.
`Fig-1.tex` and `Fig-2.tex` are retained as inactive historical alternatives only.

The author resupplied both SVGs with a six-author `archsync-12page.pdf` on
2026-09-15. `author-source-receipt.json` records the exact supplied hashes and
the SVG/PDF pair used by the manuscript. Fig-1 is byte-identical to the supplied
SVG. Fig-2 preserves the design, positions, colors and fonts, with two label
corrections to match the verified manuscript:

- `TP/FP/FN + P/R/F1` becomes `Matched/extra/missed` in the D1 evidence box.
- `571189 files parsed` becomes `57 / 189 files parsed` in the P3 evidence box.

The two corrected labels' embedded PNG fallbacks were also refreshed. The
editable SVGs use HTML foreignObject labels; use Chromium for conversion and
the PDFs for portable LaTeX inclusion. The PDFs preserve vector geometry and
text, rather than replacing the whole diagram with a screenshot.

Regenerate the PDFs with Playwright and Chromium available:

```text
node scripts/export-manuscript-figures.cjs
```

`CHROMIUM_PATH` can point to an installed Chromium executable. The exporter
disables page JavaScript and network access. To repeat the original import from
the two exact supplied SVGs, run `node scripts/import-manuscript-figures.cjs
<source-directory>` first. That importer verifies both supplied hashes, changes
only the documented labels and their fallbacks, and leaves the supplied files
untouched. After any intentional revision/export, update the receipt with the
actual file hashes, rebuild both manuscripts, and regenerate the length manifest.
