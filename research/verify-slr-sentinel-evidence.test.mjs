import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

import {
  PRIMARY_SOURCES,
  verifySlrSentinelEvidence,
} from "./verify-slr-sentinel-evidence.mjs";

const ledgerRecord = {
  sentinel_id: "S-001",
  doi: "10.1145/222124.222136",
  indexed_sources: ["ACM Digital Library", "OpenAlex"],
  retrieved_sources: ["ACM Digital Library"],
  classification: "retrieved",
};

function artifact(overrides = {}) {
  const acmQuery = "Title(architecture conformance*) OR Abstract(architecture conformance*) OR Author Keyword(architecture conformance*)";
  const openAlexQuery = 'fulltext.search.exact:"software architecture" AND fulltext.search.exact:"architecture conformance"';
  const canonicalOqo = {
    and: [
      { field: "fulltext.search.exact", value: "software architecture" },
      { field: "fulltext.search.exact", value: "architecture conformance" },
    ],
  };
  const digest = (value) => createHash("sha256").update(value).digest("hex");
  return {
    schema_version: "1.2.0",
    task: "SLR-101",
    protocol_version: "0.2.2",
    sentinel_id: "S-001",
    doi: "10.1145/222124.222136",
    reviewer: "Independent SLR Reviewer",
    recorded_at: "2026-08-16T08:10:00Z",
    classification: "retrieved",
    indexed_sources: ["ACM Digital Library", "OpenAlex"],
    retrieved_sources: ["ACM Digital Library"],
    official_search_executed: false,
    candidate_results_screened: false,
    runs: [
      {
        source: "ACM Digital Library",
        query_family: "Index-check",
        query: "DOI lookup 10.1145/222124.222136 in ACM Digital Library",
        executed_at: "2026-08-16T07:55:00Z",
        result_count: 1,
        sentinel_found: true,
        result_url: "https://dl.acm.org/action/doSearch?AllField=10.1145%2F222124.222136",
        request_method: "GET",
        request_view_parameters: {},
        request_payload_sha256: "",
        response_sha256: digest("acm-index-response"),
        translation_provenance: null,
      },
      {
        source: "OpenAlex",
        query_family: "Index-check",
        query: "DOI lookup 10.1145/222124.222136 in OpenAlex",
        executed_at: "2026-08-16T07:56:00Z",
        result_count: 1,
        sentinel_found: true,
        result_url: "https://api.openalex.org/works/https://doi.org/10.1145/222124.222136",
        request_method: "GET",
        request_view_parameters: {},
        request_payload_sha256: "",
        response_sha256: digest("openalex-index-response"),
        translation_provenance: null,
      },
      {
        source: "ACM Digital Library",
        query_family: "Search-A",
        query: acmQuery,
        executed_at: "2026-08-16T08:00:00Z",
        result_count: 42,
        sentinel_found: true,
        result_url: `https://dl.acm.org/action/doSearch?AllField=${encodeURIComponent(acmQuery)}`,
        request_method: "GET",
        request_view_parameters: {},
        request_payload_sha256: "",
        response_sha256: digest("acm-family-response"),
        translation_provenance: null,
      },
      {
        source: "OpenAlex",
        query_family: "Search-A",
        query: openAlexQuery,
        executed_at: "2026-08-16T08:05:00Z",
        result_count: 37,
        sentinel_found: false,
        result_url: "https://api.openalex.org/?select=id",
        request_method: "POST",
        request_view_parameters: { per_page: 100, cursor: "*" },
        request_payload_sha256: digest(JSON.stringify({
          oqo: canonicalOqo,
          per_page: 100,
          cursor: "*",
        })),
        response_sha256: digest("openalex-family-response"),
        translation_provenance: {
          input_oql_sha256: digest(openAlexQuery),
          canonical_oql: openAlexQuery,
          canonical_oql_sha256: digest(openAlexQuery),
          canonical_oqo: canonicalOqo,
          canonical_oqo_sha256: digest(JSON.stringify(canonicalOqo)),
          validation_valid: true,
          translation_response_sha256: digest(JSON.stringify({ valid: true, canonicalOqo })),
          oxurl: null,
        },
      },
    ],
    rationale:
      "The fixed sentinel was retrieved by Search-A in ACM Digital Library.",
    ...overrides,
  };
}

function verify(value, record = ledgerRecord, now = undefined) {
  return verifySlrSentinelEvidence({
    artifactBytes: Buffer.from(`${JSON.stringify(value, null, 2)}\n`),
    ledgerRecord: record,
    now,
  });
}

function assertIssue(result, fragment) {
  assert.ok(
    result.issues.some((issue) => issue.includes(fragment)),
    `expected '${fragment}', received:\n${result.issues.join("\n")}`,
  );
}

function sourceEvidenceUrl(source, index) {
  if (source === "IEEE Xplore") {
    return `https://ieeexplore.ieee.org/search/searchresult.jsp?queryText=sentinel-${index}`;
  }
  if (source === "ACM Digital Library") {
    return `https://dl.acm.org/action/doSearch?Title=sentinel-${index}&Abstract=sentinel-${index}&AuthorKeyword=sentinel-${index}`;
  }
  if (source === "OpenAlex") {
    return `https://api.openalex.org/?select=id&sentinel=${index}`;
  }
  return `https://api.semanticscholar.org/graph/v1/paper/search/bulk?query=sentinel-${index}`;
}

test("accepts an evidence-rich retrieved sentinel artifact", () => {
  const result = verify(artifact());
  assert.deepEqual(result.issues, []);
  assert.equal(result.artifact.sentinel_id, "S-001");
});

test("rejects stale ACM semantics and non-canonical OpenAlex execution under protocol 0.2.2", () => {
  const value = artifact();
  value.runs[2] = {
    ...value.runs[2],
    query: "AllField(architecture conformance*)",
    result_url: "https://dl.acm.org/action/doSearch?AllField=architecture",
  };
  value.runs[3] = {
    ...value.runs[3],
    query: 'fulltext.search.exact:"architecture model*"~1 AND drift',
    result_url:
      "https://api.openalex.org/works?search=architecture%20model*&api_key=secret",
    request_method: "GET",
    request_payload_sha256: "",
    translation_provenance: null,
  };
  const result = verify(value);
  for (const fragment of [
    "governed ACM query semantics must not use AllField",
    "governed ACM query must include Title",
    "governed ACM query must include Abstract",
    "governed ACM query must include Author Keyword",
    "must execute canonical OQO via POST",
    "translation_provenance fields do not match schema 1.2.0",
  ]) {
    assertIssue(result, fragment);
  }
});

test("binds OpenAlex POST payload, view parameters and retained response hash", () => {
  const value = artifact();
  value.runs[3].request_payload_sha256 = "c".repeat(64);
  value.runs[3].request_view_parameters = { api_key: "must-not-persist" };
  value.runs[3].response_sha256 = "not-a-hash";
  const result = verify(value);
  assertIssue(result, "request_payload_sha256 must bind canonical OQO");
  assertIssue(result, "request_view_parameters must be a credential-free object");
  assertIssue(result, "response_sha256 must be lowercase SHA-256");
});

test("rejects missing, invalid and non-object JSON artifacts", () => {
  assertIssue(
    verifySlrSentinelEvidence({ artifactBytes: null, ledgerRecord }),
    "missing or unreadable",
  );
  assertIssue(
    verifySlrSentinelEvidence({
      artifactBytes: Buffer.from("{broken"),
      ledgerRecord,
    }),
    "JSON is invalid",
  );
  assertIssue(verify([]), "must be a JSON object");
});

test("rejects schema drift and governed identity mutations", () => {
  const value = artifact({
    schema_version: "2.0.0",
    task: "OTHER",
    protocol_version: "1.0.0",
    sentinel_id: "S-999",
    doi: "10.invalid/example",
    reviewer: "Hiếu",
    recorded_at: "2026-02-30T08:00:00Z",
    classification: "unknown",
    official_search_executed: true,
    candidate_results_screened: true,
    rationale: "pending",
    unexpected: true,
  });
  const result = verify(value);
  for (const fragment of [
    "fields do not match",
    "schema_version must equal",
    "task must equal",
    "protocol_version must equal",
    "sentinel_id must equal",
    "doi must equal",
    "reviewer must equal",
    "recorded_at must be",
    "classification must equal",
    "official_search_executed must equal",
    "candidate_results_screened must equal",
    "rationale must contain",
  ]) {
    assertIssue(result, fragment);
  }
});

test("requires unique governed source arrays matching the ledger", () => {
  const result = verify(
    artifact({
      indexed_sources: ["Unknown source", "Unknown source"],
      retrieved_sources: "ACM Digital Library",
    }),
  );
  assertIssue(result, "indexed_sources must exactly match");
  assertIssue(result, "retrieved_sources must exactly match");
});

test("rejects missing and malformed query-run contracts", () => {
  assertIssue(verify(artifact({ runs: [] })), "at least one query execution");

  const malformed = artifact();
  malformed.runs = [
    null,
    {
      source: "Unknown",
      query_family: "Unknown",
      query: "pending",
      executed_at: "not-a-time",
      result_count: -1,
      sentinel_found: "yes",
      result_url: "http://insecure.example",
      unexpected: true,
    },
  ];
  const result = verify(malformed);
  for (const fragment of [
    "runs[0] must be an object",
    "fields do not match",
    ".source is not",
    ".query_family is invalid",
    ".query must contain",
    ".executed_at must be",
    ".result_count must be",
    ".sentinel_found must be boolean",
    ".result_url must be",
  ]) {
    assertIssue(result, fragment);
  }
});

test("rejects unfilled placeholders and cross-source or generic evidence URLs", () => {
  const value = artifact({
    rationale: "REPLACE-WITH-A-FACTUAL-CLASSIFICATION-RATIONALE",
  });
  value.runs[0] = {
    ...value.runs[0],
    query: "REPLACE-WITH-THE-EXACT-EXECUTED-QUERY",
    result_url: "https://example.test/search/result?id=1",
  };
  value.runs[1] = {
    ...value.runs[1],
    result_url: "https://dl.acm.org/action/doSearch?AllField=wrong-source",
  };
  const result = verify(value);
  assertIssue(result, "rationale must contain");
  assertIssue(result, "runs[0].query must contain");
  assertIssue(
    result,
    "runs[0].result_url must be an official HTTPS evidence locator",
  );
  assertIssue(
    result,
    "runs[1].result_url must be an official HTTPS evidence locator for OpenAlex",
  );
});

test("rejects a generic Semantic Scholar page as result evidence", () => {
  const record = {
    sentinel_id: "S-001",
    doi: "10.1145/222124.222136",
    indexed_sources: ["Semantic Scholar"],
    retrieved_sources: [],
    classification: "retrieved",
  };
  const value = artifact({
    indexed_sources: ["Semantic Scholar"],
    retrieved_sources: [],
    runs: [
      {
        source: "Semantic Scholar",
        query_family: "Index-check",
        query: "DOI lookup 10.1145/222124.222136",
        executed_at: "2026-08-16T08:00:00Z",
        result_count: 0,
        sentinel_found: false,
        result_url: "https://www.semanticscholar.org/",
        request_method: "GET",
        request_view_parameters: {},
        request_payload_sha256: "",
        response_sha256: "a".repeat(64),
        translation_provenance: null,
      },
    ],
  });
  const result = verify(value, record);
  assertIssue(
    result,
    "result_url must be an official HTTPS evidence locator for Semantic Scholar",
  );
});

test("rejects calibration timestamps materially ahead of the verification clock", () => {
  const value = artifact({ recorded_at: "2099-01-01T00:10:00Z" });
  value.runs[0] = {
    ...value.runs[0],
    executed_at: "2099-01-01T00:00:00Z",
  };
  const result = verify(
    value,
    ledgerRecord,
    new Date("2026-08-16T09:00:00Z"),
  );
  assertIssue(result, "recorded_at cannot be in the future");
  assertIssue(result, "runs[0].executed_at cannot be in the future");
});

test("binds query executions, timestamps and found sources to the ledger", () => {
  const duplicate = { ...artifact().runs[0] };
  const result = verify(
    artifact({
      recorded_at: "2026-08-16T07:00:00Z",
      runs: [
        { ...duplicate, result_count: 0 },
        { ...duplicate },
        {
          ...duplicate,
          source: "IEEE Xplore",
          query: "architecture conformance drift duplicate-control",
          result_url: "https://ieeexplore.ieee.org/search/searchresult.jsp",
        },
      ],
    }),
  );
  assertIssue(result, "result_count must be positive");
  assertIssue(result, "duplicates an earlier query execution");
  assertIssue(result, "recorded_at cannot predate");
  assertIssue(result, "missing query execution for indexed source OpenAlex");
  assertIssue(result, "positive Index-check runs must match indexed_sources");
  assertIssue(result, "positive candidate-family runs must match retrieved_sources");
});

test("accepts a documented not-indexed sentinel only after all four source checks", () => {
  const record = {
    sentinel_id: "S-001",
    doi: "10.1145/222124.222136",
    indexed_sources: [],
    retrieved_sources: [],
    classification: "not-indexed",
  };
  const runs = PRIMARY_SOURCES.map((source, index) => ({
    source,
    query_family: "Index-check",
    query: `DOI lookup for 10.1145/222124.222136 source ${index}`,
    executed_at: `2026-08-16T08:0${index}:00Z`,
    result_count: 0,
    sentinel_found: false,
    result_url: sourceEvidenceUrl(source, index),
    request_method: "GET",
    request_view_parameters: {},
    request_payload_sha256: "",
    response_sha256: "b".repeat(64),
    translation_provenance: null,
  }));
  const valid = verify(
    artifact({
      classification: "not-indexed",
      indexed_sources: [],
      retrieved_sources: [],
      runs,
      rationale:
        "Direct DOI checks found no indexed record in any governed primary source.",
    }),
    record,
  );
  assert.deepEqual(valid.issues, []);

  const incomplete = verify(
    artifact({
      classification: "not-indexed",
      indexed_sources: [],
      retrieved_sources: [],
      runs: runs.slice(0, 3),
    }),
    record,
  );
  assertIssue(incomplete, "negative checks in all four sources");
});

test("rejects a retrieved classification without indexed and retrieved sources", () => {
  const record = {
    sentinel_id: "S-001",
    doi: "10.1145/222124.222136",
    indexed_sources: [],
    retrieved_sources: [],
    classification: "retrieved",
  };
  const result = verify(
    artifact({
      indexed_sources: [],
      retrieved_sources: [],
      runs: [
        {
          ...artifact().runs[0],
          sentinel_found: false,
          result_count: 0,
        },
      ],
    }),
    record,
  );
  assertIssue(result, "requires indexed and retrieved sources");
});
