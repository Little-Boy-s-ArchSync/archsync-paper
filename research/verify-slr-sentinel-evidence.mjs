export const SENTINEL_DOIS = Object.freeze([
  "10.1145/222124.222136",
  "10.1109/WICSA.2007.1",
  "10.1002/spe.931",
  "10.1016/j.jss.2011.07.036",
  "10.3217/jucs-023-08-0769",
  "10.1002/smr.2423",
]);

export const PRIMARY_SOURCES = Object.freeze([
  "IEEE Xplore",
  "ACM Digital Library",
  "Scopus",
  "Web of Science Core Collection",
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
  Scopus: ["scopus.com"],
  "Web of Science Core Collection": ["webofscience.com", "clarivate.com"],
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
]);

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
    issues.push(`${prefix}: artifact fields do not match schema 1.0.0`);
  }

  for (const [field, expected] of [
    ["schema_version", "1.0.0"],
    ["task", "SLR-101"],
    ["protocol_version", "0.1.0"],
    ["sentinel_id", ledgerRecord?.sentinel_id],
    ["doi", ledgerRecord?.doi],
    ["reviewer", "Member 3"],
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
  const foundSources = new Set();
  let latestExecution = Number.NEGATIVE_INFINITY;
  artifact.runs.forEach((run, index) => {
    const runPrefix = `${prefix}: runs[${index}]`;
    if (!isPlainObject(run)) {
      issues.push(`${runPrefix} must be an object`);
      return;
    }
    if (!exactFields(run, RUN_FIELDS)) {
      issues.push(`${runPrefix} fields do not match schema 1.0.0`);
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
      if (run.source) foundSources.add(run.source);
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
  if (!sameSet([...foundSources], expectedRetrieved)) {
    issues.push(
      `${prefix}: sources with sentinel_found=true must match retrieved_sources`,
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
      foundSources.size !== 0
    ) {
      issues.push(
        `${prefix}: not-indexed classification requires negative checks in all four sources`,
      );
    }
  }

  return { issues, artifact };
}
