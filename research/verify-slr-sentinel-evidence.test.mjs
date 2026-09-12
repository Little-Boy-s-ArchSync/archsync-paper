import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

import {
  PRIMARY_SOURCES,
  canonicalOpenAlexInputOql,
  verifySlrSentinelEvidence,
} from "./verify-slr-sentinel-evidence.mjs";
import {
  TEST_SENTINELS,
  createSentinelEvidenceFixture,
} from "./test-support/slr-sentinel-fixture.mjs";

const verificationNow = new Date("2026-08-28T16:03:00Z");

function digest(value) {
  return createHash("sha256").update(value).digest("hex");
}

function record(sentinelId = "S-001") {
  return {
    ...TEST_SENTINELS.find((entry) => entry.sentinel_id === sentinelId),
    classification: "retrieved",
  };
}

function artifact(sentinelId = "S-001") {
  const fixture = createSentinelEvidenceFixture();
  return JSON.parse(
    fixture.sentinelEvidenceArtifacts.get(
      `research/evidence/slr-sentinel/${sentinelId}.json`,
    ),
  );
}

function verify(value, ledger = record(value?.sentinel_id), now = verificationNow) {
  return verifySlrSentinelEvidence({
    artifactBytes: Buffer.from(`${JSON.stringify(value, null, 2)}\n`),
    ledgerRecord: ledger,
    now,
  });
}

function run(value, source, queryId) {
  return value.runs.find(
    (entry) => entry.source === source && entry.query_id === queryId,
  );
}

function acmLocator(query) {
  return `https://dl.acm.org/action/doSearch?AllField=${encodeURIComponent(query)}&expand=all&BeforeMonth=8&BeforeYear=2026`;
}

function setResponse(target, body, {
  status = target.http_status,
  outcome = target.outcome,
  contentType = target.response_content_type,
  securityVerification = target.security_verification,
} = {}) {
  const bytes = Buffer.from(
    typeof body === "string" ? body : JSON.stringify(body),
    "utf8",
  );
  target.http_status = status;
  target.outcome = outcome;
  target.response_content_type = contentType;
  target.security_verification = securityVerification;
  target.response_body_base64 = bytes.toString("base64");
  target.response_sha256 = digest(bytes);
}

function assertIssue(result, fragment) {
  assert.ok(
    result.issues.some((issue) => issue.includes(fragment)),
    `expected '${fragment}', received:\n${result.issues.join("\n")}`,
  );
}

test("accepts fresh, four-source, query-ID-bound schema-1.2.0 artifacts", () => {
  for (const baseRecord of TEST_SENTINELS) {
    const result = verify(artifact(baseRecord.sentinel_id), {
      ...baseRecord,
      classification: "retrieved",
    });
    assert.deepEqual(result.issues, [], baseRecord.sentinel_id);
  }
});

test("rejects pre-D-021 evidence, an omitted source check, and a missing family run", () => {
  const stale = artifact();
  stale.recorded_at = "2026-08-28T15:40:00Z";
  stale.runs[0].executed_at = "2026-08-28T15:40:01Z";
  let result = verify(stale);
  assertIssue(result, "recorded_at must follow the pinned D-021 merge");
  assertIssue(result, "executed_at must follow the pinned D-021 merge");

  const incomplete = artifact();
  incomplete.runs = incomplete.runs.filter(
    (entry) => !(entry.source === "Semantic Scholar" && entry.query_id === "INDEX") &&
      !(entry.source === "OpenAlex" && entry.query_id === "A3"),
  );
  result = verify(incomplete);
  assertIssue(result, "Semantic Scholar requires exactly one fresh Index-check execution; found 0");
  assertIssue(result, "indexed source OpenAlex requires one governed A3 run per required field scope");
});

test("binds query IDs to the predeclared sentinel family mapping", () => {
  const value = artifact();
  const acm = run(value, "ACM Digital Library", "A3");
  acm.query_id = "A2";
  const result = verify(value);
  assertIssue(result, "query_id is not predeclared for S-001");
  assertIssue(result, "indexed source ACM Digital Library requires one governed A3 run per required field scope");

  acm.query_family = "Search-B";
  assertIssue(verify(value), "query_id and query_family do not match the governed mapping");
});

test("enforces the exact ACM Title/Abstract/Keyword union, identity, and carrier", () => {
  const correct = artifact();
  assert.deepEqual(verify(correct).issues, []);

  const invalidKeyword = artifact();
  const keywordRun = run(invalidKeyword, "ACM Digital Library", "A3");
  keywordRun.query = keywordRun.query.replace("Keyword:(", "Author Keyword:(");
  keywordRun.result_url = acmLocator(keywordRun.query);
  assertIssue(verify(invalidKeyword), "exact Title/Abstract/Keyword union");

  const divergent = artifact();
  const divergentRun = run(divergent, "ACM Digital Library", "A3");
  divergentRun.query = divergentRun.query.replace("Title:((software", "Title:((malware");
  divergentRun.result_url = acmLocator(divergentRun.query);
  assertIssue(verify(divergent), "identical governed Q");

  const broadTransport = artifact();
  const broadRun = run(broadTransport, "ACM Digital Library", "A3");
  broadRun.result_url += "&Anywhere=architecture";
  assertIssue(verify(broadTransport), "transport exactly the governed field union");

  const wrongIdentity = artifact();
  const wrongRun = run(wrongIdentity, "ACM Digital Library", "A3");
  wrongRun.query = wrongRun.query.replace(record().doi, "10.0000/wrong");
  wrongRun.result_url = acmLocator(wrongRun.query);
  const wrongResult = verify(wrongIdentity);
  assertIssue(wrongResult, "must contain a governed sentinel identity");
  assertIssue(wrongResult, "identity constraint");
});

test("requires three bounded IEEE field subruns and explicit ACM cutoff provenance", () => {
  const ieeeValue = artifact("S-002");
  const ieeeRuns = ieeeValue.runs.filter(
    (entry) => entry.source === "IEEE Xplore" && entry.query_id === "A2",
  );
  assert.deepEqual(
    ieeeRuns.map((entry) => entry.field_scope),
    ["Document Title", "Abstract", "Author Keywords"],
  );
  ieeeValue.runs = ieeeValue.runs.filter((entry) => entry !== ieeeRuns[2]);
  assertIssue(
    verify(ieeeValue, record("S-002")),
    "indexed source IEEE Xplore requires one governed A2 run per required field scope",
  );

  const acmValue = artifact();
  const acm = run(acmValue, "ACM Digital Library", "A3");
  delete acm.request_view_parameters.publication_cutoff;
  acm.result_url = acm.result_url.replace("BeforeMonth=8", "BeforeMonth=12");
  const result = verify(acmValue);
  assertIssue(result, "Guide collection, and cutoff month");
  assertIssue(result, "ACM view provenance must bind the Guide collection and exact post-export cutoff");
});

test("accepts either mapped family for S-005 and rejects no complete alternative", () => {
  const value = artifact("S-005");
  assert.deepEqual(verify(value, record("S-005")).issues, []);

  const b1Fixture = createSentinelEvidenceFixture({
    queryIdsBySentinel: { "S-005": ["B1"] },
  });
  const b1Value = JSON.parse(
    b1Fixture.sentinelEvidenceArtifacts.get("research/evidence/slr-sentinel/S-005.json"),
  );
  assert.deepEqual(verify(b1Value, record("S-005")).issues, []);

  value.runs = value.runs.filter(
    (entry) => entry.query_id === "INDEX" || entry.source !== "OpenAlex",
  );
  assertIssue(
    verify(value, record("S-005")),
    "indexed source OpenAlex requires a complete governed A2 or B1 family execution",
  );

  const duplicated = artifact("S-005");
  const semanticScholar = run(duplicated, "Semantic Scholar", "A2");
  duplicated.runs.push(structuredClone(semanticScholar));
  assertIssue(
    verify(duplicated, record("S-005")),
    "indexed source Semantic Scholar has an incomplete governed A2 family execution",
  );
});

test("enforces exact OpenAlex root POST, collision-free views, and pinned versions", () => {
  const value = artifact();
  const openAlex = run(value, "OpenAlex", "A3");
  assert.equal(openAlex.result_url, "https://api.openalex.org/");

  openAlex.result_url = "https://api.openalex.org/works";
  openAlex.request_view_parameters.oqo = { get_rows: "unrelated" };
  openAlex.translation_provenance.oql_version = "wrong";
  const result = verify(value);
  assertIssue(result, "exact root POST");
  assertIssue(result, "no OQO collision");
  assertIssue(result, "pin OQL 2.2 and OQO 1.4");
});

test("uses the production OpenAlex OQL shape that round-trips through /query", () => {
  const input = canonicalOpenAlexInputOql("A2", record("S-003").doi);
  assert.equal(
    input,
    "works where full text has ((\"software\" or \"architectur*\") and (\"architecture conformance\" or \"architectural conformance\" or \"architecture compliance\" or \"architectural compliance\" or \"architecture violation*\" or \"architectural violation*\" or \"dependency constraint*\")) and DOI is (https://doi.org/10.1002/spe.931) and date <= (2026-08-16)",
  );
  assert.ok(!input.includes('DOI is ("'));
  assert.ok(!input.includes("full text has ((("));

  const value = artifact("S-003");
  const openAlex = run(value, "OpenAlex", "A2");
  const translated = JSON.parse(Buffer.from(
    openAlex.translation_provenance.translation_response_base64,
    "base64",
  ).toString("utf8"));
  assert.notEqual(
    translated.oql.replace(/\s+/g, " ").trim(),
    openAlex.query.replace(/\s+/g, " ").trim(),
  );
  assert.equal(translated.oql_oneline, openAlex.query);
  assert.equal(translated.oql_oneline, openAlex.translation_provenance.canonical_oql);
  assert.deepEqual(verify(value, record("S-003")).issues, []);
});

test("uses the governed Semantic Scholar family query and proves identity from retained results", () => {
  const value = artifact("S-003");
  const semanticScholar = run(value, "Semantic Scholar", "A2");
  assert.ok(!semanticScholar.query.includes(record("S-003").doi));
  assert.deepEqual(verify(value, record("S-003")).issues, []);

  const positive = artifact("S-003");
  const positiveRun = run(positive, "Semantic Scholar", "A2");
  positiveRun.result_count = 1;
  positiveRun.sentinel_found = true;
  setResponse(positiveRun, {
    total: 1,
    data: [{ paperId: "provider-id", externalIds: { DOI: record("S-003").doi } }],
  });
  positive.retrieved_sources.push("Semantic Scholar");
  const positiveLedger = record("S-003");
  positiveLedger.retrieved_sources = [...positiveLedger.retrieved_sources, "Semantic Scholar"];
  assert.deepEqual(verify(positive, positiveLedger).issues, []);

  semanticScholar.query += `+"${record("S-003").doi}"`;
  semanticScholar.result_url = semanticScholar.result_url.replace(
    /query=[^&]+/,
    `query=${encodeURIComponent(semanticScholar.query)}`,
  );
  let result = verify(value, record("S-003"));
  assertIssue(result, "exact governed title/abstract bulk translation");

  const locatorDrift = artifact("S-003");
  const locatorRun = run(locatorDrift, "Semantic Scholar", "A2");
  locatorRun.result_url = locatorRun.result_url.replace("year=-2026", "year=2026");
  result = verify(locatorDrift, record("S-003"));
  assertIssue(result, "bind the exact bulk query, year=-2026, and governed metadata fields");

  const unexhausted = artifact("S-003");
  const unexhaustedRun = run(unexhausted, "Semantic Scholar", "A2");
  setResponse(unexhaustedRun, { total: 10, data: [], token: "next-page" });
  unexhaustedRun.result_count = 10;
  assertIssue(
    verify(unexhausted, record("S-003")),
    "must exhaust continuation-token pagination",
  );
});

test("rejects malformed provider transport, HTTP metadata, and GET provenance", () => {
  const value = artifact("S-002");
  value.recorded_at = "2026-08-28 15:58:00";
  const index = run(value, "IEEE Xplore", "INDEX");
  index.field_scope = "Wrong";
  index.result_url = "not a URL";
  index.http_status = "200";
  index.response_content_type = "application/octet-stream";
  index.result_count = 0;
  index.sentinel_found = true;
  index.executed_at = "yesterday";
  index.request_method = "POST";
  index.request_view_parameters = { api_key: "redacted" };
  index.request_payload_sha256 = "d".repeat(64);
  index.translation_provenance = {};
  const result = verify(value, record("S-002"));
  for (const fragment of [
    "recorded_at must be a canonical UTC timestamp",
    "field_scope must equal Identity",
    "result_url must be an official HTTPS evidence locator",
    "http_status must be an integer HTTP status",
    "response_content_type must identify retained JSON or HTML bytes",
    "result_count must be positive when sentinel_found is true",
    "executed_at must be a canonical UTC timestamp",
    "request_view_parameters must be a credential-free object",
    "request_method must be GET",
    "request_payload_sha256 must be empty",
    "translation_provenance must be null",
  ]) assertIssue(result, fragment);

  const notFound = artifact();
  const negativeIndex = run(notFound, "IEEE Xplore", "INDEX");
  setResponse(negativeIndex, "<html><body>not found</body></html>", {
    status: 404,
    outcome: "not-found",
  });
  assert.ok(!verify(notFound).issues.some((issue) => issue.includes("HTTP/access outcome")));
});

test("rejects malformed field translations and OpenAlex provenance internals", () => {
  const ieeeValue = artifact("S-002");
  const ieee = run(ieeeValue, "IEEE Xplore", "A2");
  ieee.field_scope = "Combined metadata";
  ieee.query = "invalid combined IEEE query 10.1109/WICSA.2007.1";
  ieee.result_url = "broken";
  ieee.request_view_parameters = {};
  let result = verify(ieeeValue, record("S-002"));
  assertIssue(result, "field_scope does not match the governed source search surface");
  assertIssue(result, "IEEE query must preserve the complete governed Q and identity");
  assertIssue(result, "IEEE field subrun must bind journals/conferences");

  const acmValue = artifact();
  const acm = run(acmValue, "ACM Digital Library", "A3");
  acm.query = `AllField:(${acm.query})`;
  acm.result_url = "broken";
  result = verify(acmValue);
  assertIssue(result, "must not use AllField, Anywhere, or full text");

  const missingProvenance = artifact();
  const missing = run(missingProvenance, "OpenAlex", "A3");
  missing.result_url = "broken";
  missing.translation_provenance = null;
  result = verify(missingProvenance);
  assertIssue(result, "translation_provenance fields do not match schema 1.2.0");

  const corrupt = artifact();
  const openAlex = run(corrupt, "OpenAlex", "A3");
  const provenance = openAlex.translation_provenance;
  provenance.input_oql_sha256 = "0".repeat(64);
  provenance.canonical_oql = "search.exact:legacy architecture*\"~3";
  provenance.canonical_oql_sha256 = "1".repeat(64);
  provenance.canonical_oqo = null;
  provenance.canonical_oqo_sha256 = "2".repeat(64);
  provenance.validation_valid = false;
  provenance.validation_errors = ["invalid"];
  provenance.translation_response_base64 = Buffer.from("{}").toString("base64");
  provenance.translation_response_sha256 = digest(Buffer.from("{}"));
  provenance.oxurl = "/works?api_key=redacted";
  result = verify(corrupt);
  for (const fragment of [
    "input_oql_sha256 must bind",
    "canonical_oql and canonical_oql_sha256 must match",
    "canonical_oqo and canonical_oqo_sha256 must match",
    "validation must be clean and warning-free",
    "retained /query response must bind",
    "oxurl must be null or a credential-free",
    "must not use deprecated monolithic search fields",
    "wildcard phrase must not use a ~N suffix",
  ]) assertIssue(result, fragment);
});

test("rejects malformed API responses, empty runs, unknown sources, and empty retrieval", () => {
  const badApi = artifact();
  const openAlex = run(badApi, "OpenAlex", "A3");
  setResponse(openAlex, "not json", { contentType: "text/html" });
  assertIssue(verify(badApi), "governed API evidence must retain a valid JSON response");

  const badSemanticScholar = artifact("S-003");
  const semanticScholar = run(badSemanticScholar, "Semantic Scholar", "A2");
  semanticScholar.result_url = "broken";
  semanticScholar.request_view_parameters = { token: "unexpected" };
  setResponse(semanticScholar, { total: "unknown", data: "not-an-array" });
  let result = verify(badSemanticScholar, record("S-003"));
  assertIssue(result, "Semantic Scholar GET view parameters must be empty");
  assertIssue(result, "retained Semantic Scholar response must bind result_count and data");

  const noRuns = artifact();
  noRuns.runs = [];
  assertIssue(verify(noRuns), "runs must contain at least one query execution");

  const unknown = artifact();
  unknown.runs[0].source = "Unknown source";
  assertIssue(verify(unknown), ".source is not a governed primary source");

  const empty = artifact();
  empty.indexed_sources = [];
  empty.retrieved_sources = [];
  const emptyLedger = { ...record(), indexed_sources: [], retrieved_sources: [] };
  result = verify(empty, emptyLedger);
  assertIssue(result, "retrieved classification requires indexed and retrieved sources");
});

test("rejects OpenAlex Boolean, DOI, cutoff, payload, and retained translation drift", () => {
  const value = artifact();
  const openAlex = run(value, "OpenAlex", "A3");
  openAlex.translation_provenance.canonical_oqo.filter_rows[0].filters.pop();
  openAlex.translation_provenance.canonical_oqo_sha256 = digest(
    JSON.stringify(openAlex.translation_provenance.canonical_oqo),
  );
  openAlex.request_payload_sha256 = digest(JSON.stringify({
    oqo: openAlex.translation_provenance.canonical_oqo,
    per_page: 100,
    cursor: "*",
  }));
  openAlex.translation_provenance.translation_response_sha256 = "a".repeat(64);
  const result = verify(value);
  assertIssue(result, "exact governed Boolean blocks, DOI, and cutoff");
  assertIssue(result, "translation_response_sha256 must bind retained /query response bytes");

  openAlex.request_payload_sha256 = "b".repeat(64);
  assertIssue(verify(value), "request_payload_sha256 must bind the canonical OQO");
});

test("rejects HTTP 400/429 and security-verification pages as zero recall", () => {
  const rateLimited = artifact();
  const index = run(rateLimited, "IEEE Xplore", "INDEX");
  index.result_count = 0;
  index.sentinel_found = false;
  setResponse(index, "<html><title>Just a moment</title>Cloudflare security verification</html>", {
    status: 429,
    outcome: "access-failure",
    securityVerification: true,
  });
  const result = verify(rateLimited);
  assertIssue(result, "HTTP/access outcome cannot satisfy");
  assertIssue(result, "HTTP 429 is an access/query failure, never zero recall");
  assertIssue(result, "security-verification content is an access interruption");

  const badQuery = artifact();
  const openAlex = run(badQuery, "OpenAlex", "A3");
  openAlex.result_count = 0;
  openAlex.sentinel_found = false;
  setResponse(openAlex, { error: "invalid query" }, {
    status: 400,
    outcome: "access-failure",
  });
  assertIssue(verify(badQuery), "HTTP 400 is an access/query failure, never zero recall");

  const benignProviderScript = artifact();
  const acmIndex = run(benignProviderScript, "ACM Digital Library", "INDEX");
  setResponse(
    acmIndex,
    '<html><head><script src="https://challenges.cloudflare.com/turnstile/v0/api.js"></script></head><body>10.1145/222124.222136</body></html>',
  );
  assert.ok(
    !verify(benignProviderScript).issues.some((issue) =>
      issue.includes("security-verification content is an access interruption")),
    "a normal provider page must not fail merely because it references a Cloudflare script",
  );
});

test("binds retained response bytes, API counts, and identity findings", () => {
  const wrongHash = artifact();
  run(wrongHash, "OpenAlex", "A3").response_sha256 = "c".repeat(64);
  assertIssue(verify(wrongHash), "response_sha256 must bind the retained response bytes");

  const malformedBase64 = artifact();
  run(malformedBase64, "OpenAlex", "A3").response_body_base64 = "***";
  assertIssue(verify(malformedBase64), "must retain non-empty canonical base64");

  const wrongCount = artifact();
  const openAlex = run(wrongCount, "OpenAlex", "A3");
  setResponse(openAlex, {
    meta: { count: 99 },
    results: [{ doi: `https://doi.org/${record().doi}` }],
  });
  assertIssue(verify(wrongCount), "retained OpenAlex response must bind result_count");

  const wrongFound = artifact("S-003");
  const semanticScholar = run(wrongFound, "Semantic Scholar", "A2");
  semanticScholar.sentinel_found = true;
  semanticScholar.result_count = 1;
  setResponse(semanticScholar, { total: 1, data: [] });
  const foundResult = verify(wrongFound, record("S-003"));
  assertIssue(foundResult, "retained response bytes must contain the governed sentinel identity when found");
  assertIssue(foundResult, "retained Semantic Scholar response must bind sentinel_found");
});

test("keeps positive index checks separate from candidate retrieval", () => {
  const value = artifact();
  const acm = run(value, "ACM Digital Library", "A3");
  acm.sentinel_found = false;
  acm.result_count = 0;
  setResponse(acm, "<html><body>sentinel absent from result</body></html>");
  const result = verify(value);
  assertIssue(result, "positive candidate-family runs must match retrieved_sources");
  assert.ok(!result.issues.some((issue) =>
    issue.includes("positive Index-check runs must match indexed_sources")));
});

test("accepts not-indexed only after fresh negative checks in all four sources", () => {
  const fixture = createSentinelEvidenceFixture({
    mutateRecord: (value, ordinal) => ordinal === 0
      ? { ...value, indexed_sources: [], retrieved_sources: [], classification: "not-indexed" }
      : value,
  });
  const value = JSON.parse(
    fixture.sentinelEvidenceArtifacts.get("research/evidence/slr-sentinel/S-001.json"),
  );
  const notIndexedRecord = {
    sentinel_id: "S-001",
    doi: record().doi,
    indexed_sources: [],
    retrieved_sources: [],
    classification: "not-indexed",
  };
  assert.deepEqual(verify(value, notIndexedRecord).issues, []);

  value.runs = value.runs.filter((entry) => entry.source !== PRIMARY_SOURCES.at(-1));
  const incomplete = verify(value, notIndexedRecord);
  assertIssue(incomplete, "requires exactly one fresh Index-check execution; found 0");
  assertIssue(incomplete, "negative checks in all four sources");
});

test("rejects missing, invalid, non-object, and schema-drift artifacts", () => {
  assertIssue(
    verifySlrSentinelEvidence({ artifactBytes: null, ledgerRecord: record() }),
    "missing or unreadable",
  );
  assertIssue(
    verifySlrSentinelEvidence({ artifactBytes: Buffer.from("{broken"), ledgerRecord: record() }),
    "JSON is invalid",
  );
  assertIssue(
    verifySlrSentinelEvidence({ artifactBytes: Buffer.from("[]"), ledgerRecord: record() }),
    "must be a JSON object",
  );
  const drift = artifact();
  drift.schema_version = "2.0.0";
  drift.unexpected = true;
  const result = verify(drift);
  assertIssue(result, "fields do not match schema 1.2.0");
  assertIssue(result, "schema_version must equal");
});

test("rejects malformed runs, placeholders, wrong domains, and future timestamps", () => {
  const value = artifact();
  value.recorded_at = "2099-01-01T00:10:00Z";
  value.runs[0].executed_at = "2099-01-01T00:00:00Z";
  value.runs[0].query = "REPLACE-WITH-QUERY";
  value.runs[0].result_url = "https://example.test/result";
  value.runs.push(null);
  const result = verify(value);
  assertIssue(result, "recorded_at cannot be in the future");
  assertIssue(result, "executed_at cannot be in the future");
  assertIssue(result, ".query must contain the executed query");
  assertIssue(result, ".result_url must be an official HTTPS evidence locator");
  assertIssue(result, "must be an object");
});

test("rejects duplicate runs and malformed source/family/result contracts", () => {
  const value = artifact();
  const duplicate = structuredClone(value.runs[0]);
  value.runs.push(duplicate);
  value.runs[1].query_family = "Search-C";
  value.runs[2].result_count = -1;
  value.runs[2].sentinel_found = "yes";
  const result = verify(value);
  assertIssue(result, "duplicates an earlier query execution");
  assertIssue(result, "query_id and query_family do not match");
  assertIssue(result, ".result_count must be a non-negative integer");
  assertIssue(result, ".sentinel_found must be boolean");
});

test("requires exactly one fresh index check per governed source", () => {
  const value = artifact();
  const duplicate = structuredClone(run(value, "IEEE Xplore", "INDEX"));
  duplicate.query += " duplicate execution";
  duplicate.executed_at = "2026-08-28T15:57:59Z";
  value.runs.push(duplicate);
  assertIssue(
    verify(value),
    "IEEE Xplore requires exactly one fresh Index-check execution; found 2",
  );
});

test("requires ledger identity, governed sources, and a meaningful rationale", () => {
  const value = artifact();
  value.rationale = "pending";
  value.indexed_sources = ["Unknown", "Unknown"];
  value.retrieved_sources = [];
  const result = verify(value);
  assertIssue(result, "rationale must contain");
  assertIssue(result, "indexed_sources must exactly match");
  assertIssue(result, "retrieved_sources must exactly match");
});
