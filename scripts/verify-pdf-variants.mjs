import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { assertPdfPageBudget } from "./pdf-page-budget.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const mainSource = await readFile(join(root, "main.tex"), "utf8");
const ieee = mainSource.includes("\\documentclass[conference]{IEEEtran}");
const acm = mainSource.includes("\\documentclass[sigconf,nonacm]{acmart}");
assert.ok(ieee || acm, "unsupported manuscript document class");
const namedPdf = join(root, "main.pdf");
const anonymousPdf = join(root, "main-anonymous.pdf");

for (const path of [namedPdf, anonymousPdf]) {
  const metadata = await stat(path);
  assert.ok(metadata.size > 50_000, `${path} is unexpectedly small`);
}

function extractedPdfText(path) {
  return execFileSync("pdftotext", [path, "-"], {
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  });
}

const namedRaw = extractedPdfText(namedPdf);
const anonymousRaw = extractedPdfText(anonymousPdf);
const named = namedRaw.replace(/\s+/g, " ").trim();
const anonymous = anonymousRaw.replace(/\s+/g, " ").trim();
const normalizedNamed = named.toLowerCase();
const normalizedAnonymous = anonymous.toLowerCase();
// The IEEE venue budget is not a budget for the ACM working drafts.
// Complete ACM 8/12-page deliverables are checked by validate-length-variants.mjs.
const pageBudget = ieee ? assertPdfPageBudget(anonymousRaw) : null;

function pdfAnchorPattern(anchor) {
  const words = anchor
    .toLowerCase()
    .trim()
    .split(/\s+/u)
    .map((word) =>
      [...word]
        .map((character) => character.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&"))
        .join("\\s*"),
    );
  return new RegExp(words.join("\\s+"), "u");
}

function containsPdfAnchor(text, anchor) {
  // IEEEtran renders section headings in spaced small caps. pdftotext may
  // therefore extract "Introduction" as "I NTRODUCTION". Match the same
  // lexical anchor while allowing extractor-inserted whitespace within words.
  return pdfAnchorPattern(anchor).test(text);
}

const sharedAnchors = [
  mainSource.match(/\\title\{([^}]+)\}/)?.[1] ?? assert.fail("missing manuscript title"),
  "Software teams can keep builds green while implementation relationships drift away from an approved architecture",
  "Introduction",
  "Background and Related Work",
  "Problem Definition",
  "Research Questions",
  "Proposed Approach",
  "System Architecture",
  "Implementation",
  "Controlled Verification Methodology",
  "Controlled Verification Results",
  "Discussion",
  "Threats to Validity",
  "Conclusion and Future Work",
  "References",
];
for (const anchor of sharedAnchors) {
  assert.ok(
    containsPdfAnchor(normalizedNamed, anchor),
    `named PDF is missing '${anchor}'`,
  );
  assert.ok(
    containsPdfAnchor(normalizedAnonymous, anchor),
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
  `VALID PDF VARIANTS (named ${named.length} text chars; anonymous ${anonymous.length}; identities redacted; ${pageBudget ? `IEEE anonymous main ${pageBudget.mainPageCount}/${pageBudget.mainPageLimit} pages; references ${pageBudget.referencePageCount}/${pageBudget.referencePageLimit} pages` : "ACM working draft; length deliverables checked separately"})`,
);
