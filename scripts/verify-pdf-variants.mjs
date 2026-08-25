import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const namedPdf = join(root, "main.pdf");
const anonymousPdf = join(root, "main-anonymous.pdf");

for (const path of [namedPdf, anonymousPdf]) {
  const metadata = await stat(path);
  assert.ok(metadata.size > 50_000, `${path} is unexpectedly small`);
}

function pdfText(path) {
  return execFileSync("pdftotext", [path, "-"], {
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  })
    .replace(/\s+/g, " ")
    .trim();
}

const named = pdfText(namedPdf);
const anonymous = pdfText(anonymousPdf);
const normalizedNamed = named.toLowerCase();
const normalizedAnonymous = anonymous.toLowerCase();

const sharedAnchors = [
  "ArchSync: Evidence-Backed Detection of Architecture Drift in TypeScript Systems",
  "Software architecture descriptions can diverge from the source code",
  "Introduction",
  "Background and Related Work",
  "Problem Definition",
  "Research Questions",
  "Proposed Approach",
  "System Architecture",
  "Implementation",
  "Evaluation Methodology",
  "Results",
  "Discussion",
  "Threats to Validity",
  "Conclusion and Future Work",
  "References",
];
for (const anchor of sharedAnchors) {
  assert.ok(
    normalizedNamed.includes(anchor.toLowerCase()),
    `named PDF is missing '${anchor}'`,
  );
  assert.ok(
    normalizedAnonymous.includes(anchor.toLowerCase()),
    `anonymous PDF is missing '${anchor}'`,
  );
}

const namedIdentities = [
  "Vo Duc Hieu",
  "Tran Minh Hoang",
  "Ha Hoang Bach",
  "Le Van Kiet",
  "FPT University",
  "VNUK Institute for Research and Executive Education",
];
for (const identity of namedIdentities) {
  assert.ok(
    normalizedNamed.includes(identity.toLowerCase()),
    `named PDF is missing '${identity}'`,
  );
}

// PDF text extractors may insert whitespace inside displayed e-mail addresses.
// The structure validator checks all four exact addresses in the TeX source;
// here we use stable local parts and the domain to detect anonymous-PDF leaks.
const anonymousForbidden = [
  ...namedIdentities,
  "voduchieu",
  "an1dee",
  "bachcp6",
  "levankiet1212.2004",
  "littleboys.biz",
];
for (const identity of anonymousForbidden) {
  assert.ok(
    !normalizedAnonymous.includes(identity.toLowerCase()),
    `anonymous PDF leaks '${identity}'`,
  );
}
assert.match(normalizedAnonymous, /anonymous author/);
assert.ok(
  !normalizedAnonymous.includes("author information and contributions"),
  "anonymous PDF includes the named contribution block",
);

for (const logName of ["main.log", "main-anonymous.log"]) {
  const log = await readFile(join(root, logName), "utf8");
  assert.doesNotMatch(log, /LaTeX Warning: (?:Citation|Reference).*undefined/i);
  assert.doesNotMatch(log, /There were undefined references/i);
}

console.log(
  `VALID PDF VARIANTS (named ${named.length} text chars; anonymous ${anonymous.length}; identities redacted)`,
);
