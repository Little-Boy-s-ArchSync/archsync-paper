import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const mainPath = join(root, "main.tex");
const anonymousPath = join(root, "main-anonymous.tex");
const sectionsDirectory = join(root, "sections");

const sectionFiles = [
  "abstract.tex",
  "introduction.tex",
  "related-work.tex",
  "approach.tex",
  "architecture.tex",
  "implementation.tex",
  "evaluation.tex",
  "results.tex",
  "discussion.tex",
  "threats-to-validity.tex",
  "conclusion.tex",
  "author-information.tex",
];

const expectedInputs = sectionFiles.map((file) =>
  `sections/${file.replace(/\.tex$/, "")}`,
);
const expectedHeadings = [
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
  "Author Information and Contributions",
];

const main = await readFile(mainPath, "utf8");
const anonymous = await readFile(anonymousPath, "utf8");
const actualFiles = (await readdir(sectionsDirectory))
  .filter((file) => file.endsWith(".tex"))
  .sort();

assert.deepEqual(
  actualFiles,
  [...sectionFiles].sort(),
  "sections/ must contain exactly the governed manuscript files",
);

const actualInputs = [...main.matchAll(/\\input\{([^}]+)\}/g)].map(
  (match) => match[1],
);
assert.deepEqual(
  actualInputs,
  expectedInputs,
  "main.tex must input every governed manuscript file exactly once and in order",
);

assert.match(main, /\\documentclass\[conference\]\{IEEEtran\}/);
assert.equal((main.match(/\\IEEEauthorrefmark\{[1-4]\}/g) ?? []).length, 8);
for (const identity of [
  "Vo Duc Hieu",
  "Tran Minh Hoang",
  "Ha Hoang Bach",
  "Le Van Kiet",
  "voduchieu@littleboys.biz",
  "an1dee@littleboys.biz",
  "bachcp6@littleboys.biz",
  "levankiet1212.2004@littleboys.biz",
]) assert.ok(main.includes(identity), `main.tex is missing '${identity}'`);
assert.doesNotMatch(
  main,
  /\\(?:section\*?|subsection|subsubsection)\{|\\begin\{abstract\}/,
  "manuscript content belongs in sections/, not main.tex",
);
assert.equal(
  anonymous,
  "% Double-blind submission wrapper. The named working draft remains main.tex.\n" +
    "\\def\\archsyncanonymousmode{1}\n" +
    "\\def\\archsyncanonymousauthor{Anonymous Author(s)}\n" +
    "\\input{main.tex}\n",
  "main-anonymous.tex must remain the minimal anonymous wrapper",
);

let expanded = main;
for (const [index, input] of actualInputs.entries()) {
  const path = join(root, `${input}.tex`);
  const source = await readFile(path, "utf8");
  assert.match(
    source,
    /^% !TeX root = \.\.\/main\.tex\r?\n/,
    `${relative(root, path)} must identify main.tex as its editor root`,
  );
  assert.doesNotMatch(
    source,
    /\\(?:documentclass|begin\{document\}|end\{document\})/,
    `${relative(root, path)} must remain an input fragment`,
  );
  expanded = expanded.replace(
    `\\input{${input}}`,
    source.replace(/^% !TeX root = \.\.\/main\.tex\r?\n/, ""),
  );
  assert.equal(
    expanded.includes(`\\input{${input}}`),
    false,
    `input ${index + 1} was not expanded`,
  );
}

const actualHeadings = [
  ...expanded.matchAll(/\\section(\*)?\{([^}]+)\}/g),
].map((match) => match[2]);
assert.deepEqual(
  actualHeadings,
  expectedHeadings,
  "top-level manuscript headings changed or moved out of order",
);

const labels = [...expanded.matchAll(/\\label\{([^}]+)\}/g)].map(
  (match) => match[1],
);
assert.equal(
  new Set(labels).size,
  labels.length,
  "LaTeX labels must be unique across section files",
);
assert.ok(
  (expanded.match(/\\cite\{[^}]+\}/g) ?? []).length > 0,
  "the expanded manuscript unexpectedly contains no citations",
);
assert.match(expanded, /\\bibliography\{references\}/);

console.log(
  `VALID PAPER STRUCTURE (${sectionFiles.length} inputs, ${actualHeadings.length} headings, ${labels.length} labels)`,
);
