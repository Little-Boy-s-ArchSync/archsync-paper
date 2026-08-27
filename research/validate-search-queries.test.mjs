import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { main, validateSearchQueries } from "./validate-search-queries.mjs";

const repository = join(dirname(fileURLToPath(import.meta.url)), "..");
const research = join(repository, "research");
const [specification, logTemplate, protocol] = await Promise.all([
  readFile(join(research, "literature-search-queries.md"), "utf8"),
  readFile(join(research, "literature-search-log.template.csv"), "utf8"),
  readFile(join(research, "literature-protocol.md"), "utf8"),
]);

function validate(overrides = {}) {
  return validateSearchQueries({ specification, logTemplate, protocol, ...overrides });
}

function assertIssue(result, text) {
  assert.ok(result.issues.some((issue) => issue.includes(text)), result.issues.join("\n"));
}

test("accepts the governed SLR-102 query specification and 24 blocked runs", () => {
  const result = validate();
  assert.deepEqual(result.issues, []);
  assert.equal(result.runCount, 24);
});

test("rejects metadata drift, missing keyword groups and missing syntax evidence", () => {
  const result = validate({
    specification: specification
      .replace("| Task | SLR-102 |", "| Task | wrong |")
      .replace("### K6: Evidence-grounded explanation and repair", "### removed")
      .replace("new_acm-digital-library-user-guide.pdf", "missing-acm-source")
      .replace("Never persist the unredacted authenticated URL", "credential guard removed"),
  });
  assertIssue(result, "Task must be 'SLR-102'");
  assertIssue(result, "K6: Evidence-grounded explanation and repair");
  assertIssue(result, "new_acm-digital-library-user-guide.pdf");
  assertIssue(result, "Never persist the unredacted authenticated URL");
});

test("rejects a duplicate query heading and a missing database translation", () => {
  const result = validate({
    specification: specification
      .replace("### A1: Search-A drift and erosion", "### A1: first\n\n### A1: second")
      .replace("### OpenAlex", "### Removed OpenAlex"),
  });
  assertIssue(result, "query A1 must occur exactly once; found 2");
  assertIssue(result, "database OpenAlex must occur exactly once; found 0");
});

test("rejects malformed CSV and an incomplete run matrix", () => {
  const malformed = validate({ logTemplate: 'run_id,query_spec_version\n"unterminated' });
  assertIssue(malformed, "unterminated quoted CSV field");
  assert.equal(malformed.runCount, 0);

  const lines = logTemplate.trimEnd().split(/\r?\n/);
  const incomplete = validate({ logTemplate: `${lines.slice(0, -1).join("\n")}\n` });
  assertIssue(incomplete, "expected 24 rows; found 23");
  assertIssue(incomplete, "missing run_id S2-C2");
});

test("rejects premature execution evidence and stale blocked metadata", () => {
  const premature = logTemplate
    .replace("IEEE-A1,0.2.1,0.2.1,IEEE Xplore,A1,,,", "IEEE-A1,0.2.1,0.2.1,IEEE Xplore,A1,query,2026-08-18T00:00:00Z,")
    .replace(",,,,,blocked-slr-101,Awaiting SLR-101 freeze 1.0.0", ",7,export.csv,deadbeef,Hieu,executed,done");
  const result = validate({ logTemplate: premature });
  assertIssue(result, "IEEE-A1 status must be 'blocked-slr-101'");
  assertIssue(result, "IEEE-A1 exact_query must remain empty");
  assertIssue(result, "IEEE-A1 executed_at_utc must remain empty");
  assertIssue(result, "IEEE-A1 result_count must remain empty");
});

test("rejects row width, unknown and duplicate run identifiers", () => {
  const lines = logTemplate.trimEnd().split(/\r?\n/);
  lines[1] = `${lines[1]},extra`;
  lines[2] = lines[2].replace("IEEE-A2", "UNKNOWN-A2");
  lines[3] = lines[3].replace("IEEE-A3", "IEEE-B1");
  const result = validate({ logTemplate: `${lines.join("\n")}\n` });
  assertIssue(result, "row 2 has 16 fields");
  assertIssue(result, "unexpected run_id UNKNOWN-A2");
  assertIssue(result, "duplicate run_id IEEE-B1");
});

test("requires protocol linkage and non-empty field plans", () => {
  const result = validate({
    protocol: protocol.replace("`literature-search-queries.md` version 0.2.1", "missing query link"),
    logTemplate: logTemplate.replace('"Document Title; Abstract; Author Keywords"', ""),
  });
  assertIssue(result, "missing SLR-102 query specification linkage");
  assertIssue(result, "IEEE-A1 fields is required");
});

test("requires the D-019 source translations and exact planned field scopes", () => {
  const staleSpecification = specification
    .replace("search.exact=<url-encoded-expanded-query>", "search=<url-encoded-expanded-query>")
    .replace("Do not append `~1` or another", "Compatibility suffix may be appended")
    .replace("Title(expanded query) OR Abstract(expanded", "AllField(expanded");
  const staleLog = logTemplate.replace(
    '"Title; Abstract; Author Keyword"',
    '"Title; Abstract; Keywords"',
  );
  const result = validate({ specification: staleSpecification, logTemplate: staleLog });
  assertIssue(result, "search.exact=<url-encoded-expanded-query>");
  assertIssue(result, "Do not append `~1` or another");
  assertIssue(result, "Title(expanded query) OR Abstract(expanded");
  assertIssue(result, "ACM-A1 fields must be 'Title; Abstract; Author Keyword'");
});

test("CLI reports valid and invalid states deterministically", async () => {
  const output = [];
  let exitCode;
  const valid = await main({ repositoryDirectory: repository, output: (line) => output.push(line) });
  assert.equal(valid.issues.length, 0);
  assert.match(output[0], /^VALID SLR SEARCH QUERY SPEC 0\.2\.1/);

  const invalidOutput = [];
  const invalid = await main({
    repositoryDirectory: repository,
    read: async (path, encoding) => {
      const text = await readFile(path, encoding);
      return path.endsWith("literature-search-queries.md")
        ? text.replace("| Status | Designed - execution blocked |", "| Status | executed |")
        : text;
    },
    output: (line) => invalidOutput.push(line),
    setExitCode: (code) => {
      exitCode = code;
    },
  });
  assertIssue(invalid, "Status must be 'Designed - execution blocked'");
  assert.equal(invalidOutput[0], "INVALID SLR SEARCH QUERY SPEC");
  assert.equal(exitCode, 1);
});
