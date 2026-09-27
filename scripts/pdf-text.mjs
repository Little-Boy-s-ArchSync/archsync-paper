import { spawnSync } from "node:child_process";

// Poppler is the CI default. PYTHON_PDF is an explicit local alternative, not
// a pdftotext shim: preserve page separators for the same page/redaction gates.
export function extractPdfText(path) {
  const python = process.env.PYTHON_PDF;
  const command = python || "pdftotext";
  const args = python
    ? ["-c", "import sys; from pypdf import PdfReader; sys.stdout.reconfigure(encoding='utf-8'); print('\\f'.join((p.extract_text() or '') for p in PdfReader(sys.argv[1]).pages) + '\\f', end='')", path]
    : [path, "-"];
  const result = spawnSync(command, args, { encoding: "utf8", maxBuffer: 32 * 1024 * 1024, shell: false });
  if (result.status !== 0) throw new Error(`PDF text extraction failed (${python ? "pypdf" : "Poppler"}): ${result.error?.message ?? result.stderr}`);
  return result.stdout;
}
