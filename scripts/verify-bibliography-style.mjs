import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const originalSha256 = "314f0ece704568faf827011bac498650691b2b5ee06320720830e782416d5a5f";
export const variantHeader = "%% ArchSync IEEE bibliography typography variant, 2026-09-14.\n%% Derived from IEEEtran.bst 1.14 (2015/08/26), Michael Shell.\n%% Modifications: straight double quotation marks; single hyphen for repeated names.\n%% Citation ordering, fields, author formatting and other algorithms are unchanged.\n%% Maintainer/support for this modified file:\n%% https://github.com/Little-Boy-s-ArchSync/archsync-paper/issues\n%% This modified file is not an official IEEEtran release.\n%% Original contribution credits, license and notices follow unchanged.\n";

const lf = (text) => text.replace(/\r\n/g, "\n");
const sha = (text) => createHash("sha256").update(text).digest("hex");

export function expectedVariant(original) {
  return variantHeader + lf(original)
    .replaceAll('"\x60\x60"', String.raw`"{\textquotedbl}"`)
    .replaceAll('"\x27\x27"', String.raw`"{\textquotedbl}"`)
    .replace('FUNCTION {repeated.name.dashes} { "------" }',
             'FUNCTION {repeated.name.dashes} { "-" }');
}

export function verifyBibliographyStyle(original, variant) {
  assert.equal(sha(lf(original)), originalSha256,
    "vendored IEEEtran 1.14 does not match the pinned LF-normalized source");
  assert.equal(lf(variant), expectedVariant(original),
    "bibliography variant must contain only the documented typography changes");
  return true;
}

export async function verifyBibliographyStyleFromDisk() {
  const [original, variant] = await Promise.all([
    readFile(new URL("../vendor/IEEEtran.bst", import.meta.url), "utf8"),
    readFile(new URL("../archsync-ieee.bst", import.meta.url), "utf8"),
  ]);
  return verifyBibliographyStyle(original, variant);
}
