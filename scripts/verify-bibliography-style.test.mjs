import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { expectedVariant, verifyBibliographyStyle } from "./verify-bibliography-style.mjs";

const original = await readFile(new URL("../vendor/IEEEtran.bst", import.meta.url), "utf8");
const variant = await readFile(new URL("../archsync-ieee.bst", import.meta.url), "utf8");
const quote = '"{\\textquotedbl}"';

test("pinned IEEE typography variant passes", () => {
  assert.equal(verifyBibliographyStyle(original, variant), true);
});
test("CRLF checkouts normalize without changing the pinned source", () => {
  const crlf = (value) => value.replace(/\r?\n/g, "\r\n");
  assert.equal(verifyBibliographyStyle(crlf(original), crlf(variant)), true);
});
test("a changed upstream file fails the pinned hash", () => {
  assert.throws(() => verifyBibliographyStyle(original.replace("Michael Shell", "Someone Else"), variant), /pinned LF-normalized source/);
});
test("restoring a curved quotation marker is rejected", () => {
  assert.ok(variant.includes(quote));
  assert.throws(() => verifyBibliographyStyle(original, variant.replace(quote, '"\x60\x60"')), /documented typography changes/);
});
test("changing bibliography ordering is rejected", () => {
  assert.ok(variant.includes("ITERATE {call.type$}"));
  assert.throws(() => verifyBibliographyStyle(original, variant.replace("ITERATE {call.type$}", "REVERSE {call.type$}")), /documented typography changes/);
});
test("removing the modified-style disclosure is rejected", () => {
  assert.throws(() => verifyBibliographyStyle(original, variant.replace("not an official IEEEtran release", "official IEEEtran release")), /documented typography changes/);
});
test("only three quotation strings and the repeated-name dash are replaced", () => {
  assert.equal(variant.replace(/\r\n/g, "\n"), expectedVariant(original));
  assert.equal(variant.split(quote).length - 1, 3);
  assert.ok(variant.includes('FUNCTION {repeated.name.dashes} { "-" }'));
});
