import { createHash } from "node:crypto";

export const SENTINEL_DOIS = Object.freeze([
  "10.1145/222124.222136",
  "10.1109/WICSA.2007.1",
  "10.1002/spe.931",
  "10.1016/j.jss.2011.07.036",
  "10.3217/jucs-023-08-0769",
  "10.1002/smr.2423",
]);

export const SENTINEL_REVIEWER_ROLE = "Independent SLR Reviewer";

export const PRIMARY_SOURCES = Object.freeze([
  "IEEE Xplore",
  "ACM Digital Library",
  "OpenAlex",
  "Semantic Scholar",
]);

const QUERY_FAMILIES = new Set([
  "Search-A",
  "Search-B",
  "Search-C",
  "Index-check",
]);
const SOURCE_EVIDENCE_DOMAINS = Object.freeze({
  "IEEE Xplore": ["ieeexplore.ieee.org"],
  "ACM Digital Library": ["dl.acm.org"],
  OpenAlex: ["api.openalex.org", "openalex.org"],
  "Semantic Scholar": ["api.semanticscholar.org", "semanticscholar.org"],
});
const ARTIFACT_FIELDS = Object.freeze([
  "schema_version",
  "task",
  "protocol_version",
  "sentinel_id",
  "doi",
  "reviewer",
  "recorded_at",
  "classification",
  "indexed_sources",
  "retrieved_sources",
  "official_search_executed",
  "candidate_results_screened",
  "runs",
  "rationale",
]);
const RUN_FIELDS = Object.freeze([
  "source",
  "query_family",
  "query",
  "executed_at",
  "result_count",
  "sentinel_found",
  "result_url",
  "request_method",
  "request_view_parameters",
  "request_payload_sha256",
  "response_sha256",
  "translation_provenance",
]);
const TRANSLATION_FIELDS = Object.freeze([
  "input_oql_sha256",
  "canonical_oql",
  "canonical_oql_sha256",
  "canonical_oqo",
  "canonical_oqo_sha256",
  "validation_valid",
  "translation_response_sha256",
  "oxurl",
]);
const SHA256_PATTERN = /^[0-9a-f]{64}$/;

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isCanonicalUtcSecond(value) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value ?? "")) {
    return false;
  }
  const timestamp = Date.parse(value);
  return (
    !Number.isNaN(timestamp) &&
    new Date(timestamp).toISOString().replace(".000Z", "Z") === value
  );
}

function exactFields(value, expected) {
  return (
    isPlainObject(value) &&
    Object.keys(value).sort().join("|") === [...expected].sort().join("|")
  );
}

function uniqueStrings(value) {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === "string" && item.length > 0) &&
    new Set(value).size === value.length
  );
}

function sameSet(actual, expected) {
  return (
    actual.length === expected.length &&
    actual.every((value) => expected.includes(value))
  );
}

function containsPlaceholder(value) {
  return (
    typeof value !== "string" ||
    /\b(?:pending|todo|tbd|placeholder|dummy)\b|\breplace(?:[-_\s]|$)/i.test(
      value,
    )
  );
}

function isOfficialEvidenceLocator(value, source) {
  if (typeof value !== "string" || containsPlaceholder(value)) return false;
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    return false;
  }
  const hostname = parsed.hostname.toLowerCase();
  const domains = SOURCE_EVIDENCE_DOMAINS[source] ?? [];
  return (
    parsed.protocol === "https:" &&
    parsed.username === "" &&
    parsed.password === "" &&
    domains.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
    ) &&
    (parsed.pathname !== "/" || parsed.search.length > 1)
  );
}

function validateGovernedTranslation(run, prefix, issues) {
  if (run.query_family === "Index-check" || typeof run.query !== "string") {
    return;
  }
  if (run.source === "ACM Digital Library") {
    if (/\b(?:AllField|Anywhere)\s*[:(]/i.test(run.query)) {
      issues.push(`${prefix}: governed ACM query semantics must not use AllField or Anywhere`);
    }
    for (const field of ["Title", "Abstract", "Author Keyword"]) {
      if (!run.query.includes(field)) {
        issues.push(`${prefix}: governed ACM query must include ${field}`);
      }
    }
    try {
      const locator = new URL(run.result_url);
      const transported = locator.searchParams.get("AllField");
      if (transported !== null && transported.trim() !== run.query.trim()) {
        issues.push(
          `${prefix}: ACM AllField transport must decode to the exact governed Title/Abstract/Author Keyword union`,
        );
      }
    } catch {
      // The evidence-locator validator reports malformed URLs.
    }
  }
  if (run.source === "OpenAlex") {
    let locator;
    try {
      locator = new URL(run.result_url);
    } catch {
      return;
    }
    if (
      locator.searchParams.has("api_key") ||
      locator.searchParams.has("search") ||
      locator.searchParams.has("search.exact")
    ) {
      issues.push(`${prefix}: OpenAlex evidence URL must not persist credentials or deprecated search parameters`);
    }
    if (run.request_method !== "POST") {
      issues.push(`${prefix}: governed OpenAlex query must execute canonical OQO via POST`);
    }
    if (!SHA256_PATTERN.test(run.request_payload_sha256)) {
      issues.push(`${prefix}: OpenAlex request_payload_sha256 must be lowercase SHA-256`);
    }
    const provenance = run.translation_provenance;
    if (!exactFields(provenance, TRANSLATION_FIELDS)) {
      issues.push(`${prefix}: OpenAlex translation_provenance fields do not match schema 1.2.0`);
      return;
    }
    if (provenance.input_oql_sha256 !== sha256(run.query)) {
      issues.push(`${prefix}: input_oql_sha256 must bind the exact input OQL`);
    }
    if (
      typeof provenance.canonical_oql !== "string" ||
      !provenance.canonical_oql.includes("fulltext.search.exact") ||
      provenance.canonical_oql_sha256 !== sha256(provenance.canonical_oql)
    ) {
      issues.push(`${prefix}: canonical_oql and its hash must retain fulltext.search.exact leaves`);
    }
    if (
      !isPlainObject(provenance.canonical_oqo) ||
      provenance.canonical_oqo_sha256 !== sha256(JSON.stringify(provenance.canonical_oqo))
    ) {
      issues.push(`${prefix}: canonical_oqo and canonical_oqo_sha256 must match`);
    }
    const expectedPayload = JSON.stringify({
      oqo: provenance.canonical_oqo,
      ...run.request_view_parameters,
    });
    if (run.request_payload_sha256 !== sha256(expectedPayload)) {
      issues.push(`${prefix}: request_payload_sha256 must bind canonical OQO and credential-free view parameters`);
    }
    if (provenance.validation_valid !== true) {
      issues.push(`${prefix}: OpenAlex translation must record validation_valid=true`);
    }
    if (!SHA256_PATTERN.test(provenance.translation_response_sha256)) {
      issues.push(`${prefix}: translation_response_sha256 must be lowercase SHA-256`);
    }
    if (
      provenance.oxurl !== null &&
      (typeof provenance.oxurl !== "string" || /(?:api_key|mailto)=/i.test(provenance.oxurl))
    ) {
      issues.push(`${prefix}: oxurl must be null or a credential-free string`);
    }
    if (/(?:^|[\s(])(?:search|search\.exact)\s*[:=]/i.test(`${run.query} ${provenance.canonical_oql}`)) {
      issues.push(`${prefix}: governed OpenAlex query must not use deprecated monolithic search fields`);
    }
    if (/\*["']?~\d+/i.test(`${run.query} ${provenance.canonical_oql}`)) {
      issues.push(`${prefix}: governed OpenAlex wildcard phrase must not use a ~N suffix`);
    }
  }
}

export function verifySlrSentinelEvidence({
  artifactBytes,
  ledgerRecord,
  now = new Date(),
}) {
  const issues = [];
  const prefix = `sentinel evidence ${ledgerRecord?.sentinel_id ?? "unknown"}`;
  const latestAllowedTimestamp = now.getTime() + 5 * 60 * 1000;
  if (!Buffer.isBuffer(artifactBytes)) {
    return { issues: [`${prefix}: artifact is missing or unreadable`] };
  }

  let artifact;
  try {
    artifact = JSON.parse(artifactBytes.toString("utf8"));
  } catch (parseError) {
    return { issues: [`${prefix}: JSON is invalid: ${parseError.message}`] };
  }
  if (!isPlainObject(artifact)) {
    return { issues: [`${prefix}: artifact must be a JSON object`] };
  }
  if (!exactFields(artifact, ARTIFACT_FIELDS)) {
    issues.push(`${prefix}: artifact fields do not match schema 1.2.0`);
  }

  for (const [field, expected] of [
    ["schema_version", "1.2.0"],
    ["task", "SLR-101"],
    ["protocol_version", "0.2.2"],
    ["sentinel_id", ledgerRecord?.sentinel_id],
    ["doi", ledgerRecord?.doi],
    ["reviewer", SENTINEL_REVIEWER_ROLE],
    ["classification", ledgerRecord?.classification],
    ["official_search_executed", false],
    ["candidate_results_screened", false],
  ]) {
    if (artifact[field] !== expected) {
      issues.push(
        `${prefix}: ${field} must equal ${JSON.stringify(expected)}`,
      );
    }
  }
  if (!isCanonicalUtcSecond(artifact.recorded_at)) {
    issues.push(`${prefix}: recorded_at must be a canonical UTC timestamp`);
  } else if (Date.parse(artifact.recorded_at) > latestAllowedTimestamp) {
    issues.push(`${prefix}: recorded_at cannot be in the future`);
  }
  if (
    typeof artifact.rationale !== "string" ||
    artifact.rationale.trim().length < 20 ||
    containsPlaceholder(artifact.rationale)
  ) {
    issues.push(
      `${prefix}: rationale must contain at least 20 non-placeholder characters`,
    );
  }

  const expectedIndexed = ledgerRecord?.indexed_sources ?? [];
  const expectedRetrieved = ledgerRecord?.retrieved_sources ?? [];
  for (const [field, expected] of [
    ["indexed_sources", expectedIndexed],
    ["retrieved_sources", expectedRetrieved],
  ]) {
    const value = artifact[field];
    if (
      !uniqueStrings(value) ||
      value.some((source) => !PRIMARY_SOURCES.includes(source)) ||
      !sameSet(value, expected)
    ) {
      issues.push(`${prefix}: ${field} must exactly match the sentinel ledger`);
    }
  }

  if (!Array.isArray(artifact.runs) || artifact.runs.length === 0) {
    issues.push(`${prefix}: runs must contain at least one query execution`);
    return { issues, artifact };
  }

  const runIdentities = new Set();
  const runSources = new Set();
  const indexedFoundSources = new Set();
  const retrievedFoundSources = new Set();
  let latestExecution = Number.NEGATIVE_INFINITY;
  artifact.runs.forEach((run, index) => {
    const runPrefix = `${prefix}: runs[${index}]`;
    if (!isPlainObject(run)) {
      issues.push(`${runPrefix} must be an object`);
      return;
    }
    if (!exactFields(run, RUN_FIELDS)) {
      issues.push(`${runPrefix} fields do not match schema 1.2.0`);
    }
    if (!PRIMARY_SOURCES.includes(run.source)) {
      issues.push(`${runPrefix}.source is not a governed primary source`);
    } else {
      runSources.add(run.source);
    }
    if (!QUERY_FAMILIES.has(run.query_family)) {
      issues.push(`${runPrefix}.query_family is invalid`);
    }
    if (
      typeof run.query !== "string" ||
      run.query.trim().length < 10 ||
      containsPlaceholder(run.query)
    ) {
      issues.push(`${runPrefix}.query must contain the executed query`);
    }
    if (!isCanonicalUtcSecond(run.executed_at)) {
      issues.push(`${runPrefix}.executed_at must be a canonical UTC timestamp`);
    } else {
      const executionTimestamp = Date.parse(run.executed_at);
      latestExecution = Math.max(latestExecution, executionTimestamp);
      if (executionTimestamp > latestAllowedTimestamp) {
        issues.push(`${runPrefix}.executed_at cannot be in the future`);
      }
    }
    if (!Number.isSafeInteger(run.result_count) || run.result_count < 0) {
      issues.push(`${runPrefix}.result_count must be a non-negative integer`);
    }
    if (typeof run.sentinel_found !== "boolean") {
      issues.push(`${runPrefix}.sentinel_found must be boolean`);
    } else if (run.sentinel_found) {
      if (run.source && run.query_family === "Index-check") {
        indexedFoundSources.add(run.source);
      } else if (run.source) {
        retrievedFoundSources.add(run.source);
      }
      if (Number.isSafeInteger(run.result_count) && run.result_count < 1) {
        issues.push(
          `${runPrefix}.result_count must be positive when sentinel_found is true`,
        );
      }
    }
    if (!isOfficialEvidenceLocator(run.result_url, run.source)) {
      issues.push(
        `${runPrefix}.result_url must be an official HTTPS evidence locator for ${run.source ?? "the governed source"}`,
      );
    }
    if (
      !isPlainObject(run.request_view_parameters) ||
      /(?:api[_-]?key|authorization|mailto)/i.test(
        JSON.stringify(run.request_view_parameters),
      )
    ) {
      issues.push(`${runPrefix}.request_view_parameters must be a credential-free object`);
    }
    if (!SHA256_PATTERN.test(run.response_sha256)) {
      issues.push(`${runPrefix}.response_sha256 must be lowercase SHA-256 of retained response bytes`);
    }
    if (run.source !== "OpenAlex" || run.query_family === "Index-check") {
      if (run.request_method !== "GET") {
        issues.push(`${runPrefix}.request_method must be GET outside governed OpenAlex family runs`);
      }
      if (run.request_payload_sha256 !== "") {
        issues.push(`${runPrefix}.request_payload_sha256 must be empty for GET evidence`);
      }
      if (run.translation_provenance !== null) {
        issues.push(`${runPrefix}.translation_provenance must be null outside governed OpenAlex family runs`);
      }
    }
    validateGovernedTranslation(run, runPrefix, issues);
    const identity = `${run.source}|${run.query_family}|${run.query}`;
    if (runIdentities.has(identity)) {
      issues.push(`${runPrefix} duplicates an earlier query execution`);
    }
    runIdentities.add(identity);
  });

  if (
    isCanonicalUtcSecond(artifact.recorded_at) &&
    latestExecution !== Number.NEGATIVE_INFINITY &&
    Date.parse(artifact.recorded_at) < latestExecution
  ) {
    issues.push(`${prefix}: recorded_at cannot predate a query execution`);
  }
  for (const source of expectedIndexed) {
    if (!runSources.has(source)) {
      issues.push(`${prefix}: missing query execution for indexed source ${source}`);
    }
  }
  if (!sameSet([...indexedFoundSources], expectedIndexed)) {
    issues.push(
      `${prefix}: positive Index-check runs must match indexed_sources`,
    );
  }
  if (!sameSet([...retrievedFoundSources], expectedRetrieved)) {
    issues.push(
      `${prefix}: positive candidate-family runs must match retrieved_sources`,
    );
  }

  if (artifact.classification === "retrieved") {
    if (expectedIndexed.length === 0 || expectedRetrieved.length === 0) {
      issues.push(
        `${prefix}: retrieved classification requires indexed and retrieved sources`,
      );
    }
  } else if (artifact.classification === "not-indexed") {
    if (
      expectedIndexed.length !== 0 ||
      expectedRetrieved.length !== 0 ||
      PRIMARY_SOURCES.some((source) => !runSources.has(source)) ||
      indexedFoundSources.size !== 0 ||
      retrievedFoundSources.size !== 0
    ) {
      issues.push(
        `${prefix}: not-indexed classification requires negative checks in all four sources`,
      );
    }
  }

  return { issues, artifact };
}
