import assert from "node:assert/strict";
import test from "node:test";

import {
  analyzePdfPageBudget,
  assertPdfPageBudget,
  splitExtractedPdfPages,
} from "./pdf-page-budget.mjs";

const page = (text) => `${text}\f`;

test("accepts ten manuscript pages followed by one reference page", () => {
  const raw = `${Array.from({ length: 10 }, (_, index) => page(`Body ${index + 1}`)).join("")}${page("REFERENCES\n[1] Source")}`;
  assert.deepEqual(assertPdfPageBudget(raw), {
    totalPageCount: 11,
    referencesStartPage: 11,
    contentBeforeReferencesOnStartPage: false,
    mainPageCount: 10,
    mainPageLimit: 10,
    referencePageCount: 1,
    referencePageLimit: 2,
    valid: true,
  });
});

test("ignores repeated trailing form-feed delimiters", () => {
  const raw = `${page("Body")}${page("REFERENCES\n[1] Source")}\f\f`;
  const result = assertPdfPageBudget(raw);
  assert.equal(result.totalPageCount, 2);
  assert.equal(result.referencePageCount, 1);
});

test("accepts references starting after manuscript text on page ten", () => {
  const raw = `${Array.from({ length: 9 }, (_, index) => page(`Body ${index + 1}`)).join("")}${page("Final body\nR E F E R E N C E S\n[1] Source")}${page("[2] Source")}`;
  const result = assertPdfPageBudget(raw);
  assert.equal(result.referencesStartPage, 10);
  assert.equal(result.mainPageCount, 10);
  assert.equal(result.referencePageCount, 2);
  assert.equal(result.contentBeforeReferencesOnStartPage, true);
});

test("rejects manuscript text before References on page eleven", () => {
  const raw = `${Array.from({ length: 10 }, (_, index) => page(`Body ${index + 1}`)).join("")}${page("Overflow body\nREFERENCES\n[1] Source")}`;
  assert.throws(
    () => assertPdfPageBudget(raw),
    /main text uses 11 pages; limit is 10/u,
  );
});

test("rejects more than two reference pages", () => {
  const raw = `${page("Body")}${page("REFERENCES\n[1]")}${page("[2]")}${page("[3]")}`;
  assert.throws(
    () => assertPdfPageBudget(raw),
    /references use 3 pages; limit is 2/u,
  );
});

test("rejects missing headings, empty input, and invalid limits", () => {
  assert.throws(
    () => analyzePdfPageBudget(page("Body only")),
    /missing a standalone References heading/u,
  );
  assert.throws(() => splitExtractedPdfPages(""), /non-empty string/u);
  assert.throws(
    () => analyzePdfPageBudget(page("REFERENCES"), { mainPageLimit: 0, referencePageLimit: 2 }),
    /mainPageLimit must be a positive integer/u,
  );
  assert.throws(
    () => analyzePdfPageBudget(page("REFERENCES"), { mainPageLimit: 10, referencePageLimit: 1.5 }),
    /referencePageLimit must be a positive integer/u,
  );
});
