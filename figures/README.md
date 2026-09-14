# Manuscript figures

`Fig-1.svg` retains the supplied original. `Fig-2.svg` preserves the supplied
geometry with two factual label corrections: D1 matched/extra/missed counts,
and 57 / 189 parsed files. The
matching PDF exports are the print assets included by the LaTeX sections.
Captions, labels, cross-references and accessibility descriptions remain in
`sections/architecture.tex` and `sections/evaluation.tex`.

Export with Node.js, Playwright and Chromium:

```sh
node scripts/export-manuscript-figures.cjs
```

Set `CHROMIUM_PATH` if using an existing Chromium installation, and `NODE_PATH`
if Playwright is installed outside this repository. The exporter prints at the
SVG viewBox dimensions in light mode with zero margins, preserving SVG paths,
HTML labels and embedded font subsets. Ordinary manuscript builds use the
committed PDF assets and do not require Chromium. Poppler `pdfimages -list`
confirms both exports contain no raster image objects.
