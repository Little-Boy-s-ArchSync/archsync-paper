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
export const D021_PINNED_AT = "2026-08-28T15:45:37Z";
export const SEARCH_CUTOFF = "2026-08-16";

export const PRIMARY_SOURCES = Object.freeze([
  "IEEE Xplore",
  "ACM Digital Library",
  "OpenAlex",
  "Semantic Scholar",
]);

export const SENTINEL_QUERY_IDS = Object.freeze({
  "S-001": Object.freeze(["A3"]),
  "S-002": Object.freeze(["A2"]),
  "S-003": Object.freeze(["A2"]),
  "S-004": Object.freeze(["A1"]),
  "S-005": Object.freeze(["A2", "B1"]),
  "S-006": Object.freeze(["A1"]),
});

const QUERY_ID_TO_FAMILY = Object.freeze({
  INDEX: "Index-check",
  A1: "Search-A",
  A2: "Search-A",
  A3: "Search-A",
  B1: "Search-B",
  C1: "Search-C",
  C2: "Search-C",
});

function term(value, quoted = false) {
  return Object.freeze({ value, quoted });
}

const P = Object.freeze([
  term("software architecture", true),
  term("software architectural", true),
  term("architectural design", true),
  term("architecture model*", true),
]);
const L = Object.freeze([term("software"), term("architectur*")]);
const D = Object.freeze([
  term("detect*"), term("analy*"), term("check*"), term("monitor*"),
  term("govern*"), term("reconstruct*"), term("recover*"),
]);
const E = Object.freeze([
  term("source code", true), term("dependency graph*", true),
  term("version control", true), term("commit*"),
  term("pull request*", true), term("repository"),
]);
const K1 = Object.freeze([
  term("architecture drift", true), term("architectural drift", true),
  term("architecture erosion", true), term("architectural erosion", true),
  term("architecture decay", true), term("architectural decay", true),
  term("architecture divergence", true), term("architectural degradation", true),
]);
const K2 = Object.freeze([
  term("architecture conformance", true), term("architectural conformance", true),
  term("architecture compliance", true), term("architectural compliance", true),
  term("architecture violation*", true), term("architectural violation*", true),
  term("dependency constraint*", true),
]);
const K3 = Object.freeze([
  term("software architecture reconstruction", true),
  term("architecture reconstruction", true),
  term("architectural reconstruction", true),
  term("architecture recovery", true),
  term("architectural recovery", true),
  term("reflexion model*", true),
]);
const K4 = Object.freeze([
  term("continuous integration", true), term("continuous delivery", true),
  term("CI/CD", true), term("pull request*", true), term("merge gate*", true),
  term("quality gate*", true), term("architecture governance", true),
  term("continuous architecture", true),
]);
const K5 = Object.freeze([
  term("AI coding agent*", true), term("coding agent*", true),
  term("large language model*", true), term("LLM"), term("generative AI", true),
  term("AI-assisted development", true), term("AI assisted development", true),
  term("AI-generated code", true), term("code generation", true),
]);
const K6 = Object.freeze([
  term("evidence-grounded", true), term("evidence grounded", true),
  term("source evidence", true), term("evidence localization", true),
  term("explanation"), term("root cause", true), term("repair"),
  term("remediation"), term("repair verification", true),
  term("human approval", true),
]);
const GOVERNANCE_SCOPE = Object.freeze([
  term("architecture drift", true), term("architecture conformance", true),
  term("architectural violation*", true),
]);
const AI_SCOPE = Object.freeze([
  term("drift"), term("erosion"), term("conformance"), term("governance"),
  term("violation*"),
]);

const QUERY_BLOCKS = Object.freeze({
  A1: Object.freeze([P, K1, D]),
  A2: Object.freeze([L, K2]),
  A3: Object.freeze([L, K3]),
  B1: Object.freeze([P, GOVERNANCE_SCOPE, K4, E]),
  C1: Object.freeze([P, AI_SCOPE, K5]),
  C2: Object.freeze([P, AI_SCOPE, K6]),
});

const SPECIAL_IDENTITIES = Object.freeze({
  "ACM Digital Library|S-003": Object.freeze(["10.5555/1573951.1573954"]),
  "Semantic Scholar|S-005": Object.freeze([
    "931bc335706870d4a88317ceae6a934ed69d35f8",
  ]),
});

const SOURCE_EVIDENCE_DOMAINS = Object.freeze({
  "IEEE Xplore": ["ieeexplore.ieee.org"],
  "ACM Digital Library": ["dl.acm.org"],
  OpenAlex: ["api.openalex.org"],
  "Semantic Scholar": ["api.semanticscholar.org", "semanticscholar.org"],
});
const ARTIFACT_FIELDS = Object.freeze([
  "schema_version", "task", "protocol_version", "sentinel_id", "doi",
  "reviewer", "recorded_at", "classification", "indexed_sources",
  "retrieved_sources", "official_search_executed",
  "candidate_results_screened", "runs", "rationale",
]);
const RUN_FIELDS = Object.freeze([
  "source", "query_family", "query_id", "field_scope", "query", "executed_at",
  "outcome", "http_status", "response_content_type",
  "security_verification", "result_count", "sentinel_found", "result_url",
  "request_method", "request_view_parameters", "request_payload_sha256",
  "response_body_base64", "response_sha256", "translation_provenance",
]);
const TRANSLATION_FIELDS = Object.freeze([
  "oql_version", "oqo_version", "input_oql_sha256", "canonical_oql",
  "canonical_oql_sha256", "canonical_oqo", "canonical_oqo_sha256",
  "validation_valid", "validation_errors", "validation_warnings",
  "translation_response_base64", "translation_response_sha256", "oxurl",
]);
const OPENALEX_VIEW_FIELDS = Object.freeze(["per_page", "cursor"]);
const IEEE_FAMILY_SCOPES = Object.freeze([
  "Document Title", "Abstract", "Author Keywords",
]);
const ACM_FAMILY_SCOPE = "Title; Abstract; Author Keyword";
const OPENALEX_FAMILY_SCOPE = "Title; Abstract; Full text";
const SEMANTIC_SCHOLAR_FAMILY_SCOPE = "Title; Abstract";
const ACM_VIEW_FIELDS = Object.freeze([
  "collection", "publication_cutoff", "cutoff_handling",
]);
const SEMANTIC_SCHOLAR_FIELDS = Object.freeze([
  "paperId", "externalIds", "title", "abstract", "authors", "year",
  "publicationDate", "venue", "publicationTypes", "url", "citationCount",
]);
const SHA256_PATTERN = /^[0-9a-f]{64}$/;
const BASE64_PATTERN = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
const SECURITY_PAGE_PATTERN = /(?:<title[^>]*>\s*(?:just a moment|attention required|security verification)[^<]*<\/title>|(?:verify|confirm)\s+(?:that\s+)?you(?:'re| are)\s+(?:a\s+)?human|performing\s+security\s+verification|enable javascript and cookies to continue|id=["']challenge-form["']|class=["'][^"']*\bcf-error-details\b)/i;
const D021_PINNED_TIMESTAMP = Date.parse(D021_PINNED_AT);

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isCanonicalUtcSecond(value) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value ?? "")) return false;
  const timestamp = Date.parse(value);
  return !Number.isNaN(timestamp) &&
    new Date(timestamp).toISOString().replace(".000Z", "Z") === value;
}

function exactFields(value, expected) {
  return isPlainObject(value) &&
    Object.keys(value).sort().join("|") === [...expected].sort().join("|");
}

function uniqueStrings(value) {
  return Array.isArray(value) &&
    value.every((item) => typeof item === "string" && item.length > 0) &&
    new Set(value).size === value.length;
}

function sameSet(actual, expected) {
  return actual.length === expected.length &&
    actual.every((value) => expected.includes(value));
}

function containsPlaceholder(value) {
  return typeof value !== "string" ||
    /\b(?:pending|todo|tbd|placeholder|dummy)\b|\breplace(?:[-_\s]|$)/i.test(value);
}

function normalizeWhitespace(value) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

function renderTerm(item) {
  return item.quoted ? `"${item.value}"` : item.value;
}

export function canonicalLogicalQuery(queryId) {
  const blocks = QUERY_BLOCKS[queryId];
  if (!blocks) return null;
  return blocks
    .map((block) => `(${block.map(renderTerm).join(" OR ")})`)
    .join(" AND ");
}

export function canonicalSemanticScholarQuery(queryId) {
  const blocks = QUERY_BLOCKS[queryId];
  if (!blocks) return null;
  return blocks
    .map((block) => `(${block.map(renderTerm).join("|")})`)
    .join("+");
}

export function canonicalIeeeQuery(queryId, fieldScope, sentinelId, doi) {
  const logical = canonicalLogicalQuery(queryId);
  const identity = primaryGovernedIdentity("IEEE Xplore", sentinelId, doi);
  if (!logical || !IEEE_FAMILY_SCOPES.includes(fieldScope) || !identity) return null;
  return `("${fieldScope}":(${logical})) AND ("DOI":"${identity}")`;
}

export function governedIdentities(source, sentinelId, doi) {
  return Object.freeze([
    String(doi ?? "").toLowerCase(),
    ...(SPECIAL_IDENTITIES[`${source}|${sentinelId}`] ?? []),
  ].filter(Boolean));
}

function primaryGovernedIdentity(source, sentinelId, doi) {
  return SPECIAL_IDENTITIES[`${source}|${sentinelId}`]?.[0] ?? String(doi ?? "");
}

export function canonicalAcmQuery(queryId, sentinelId, doi) {
  const logical = canonicalLogicalQuery(queryId);
  const identity = primaryGovernedIdentity("ACM Digital Library", sentinelId, doi);
  if (!logical || !identity) return null;
  return `(Title:(${logical}) OR Abstract:(${logical}) OR Keyword:(${logical})) AND DOI:("${identity}")`;
}

export function canonicalOpenAlexInputOql(queryId, doi) {
  const blocks = QUERY_BLOCKS[queryId];
  if (!blocks || !doi) return null;
  const rendered = blocks
    .map((block) => `(${block.map((item) => `"${item.value}"`).join(" or ")})`)
    .join(" and ");
  return `works where full text has (${rendered}) and DOI is (https://doi.org/${String(doi).toLowerCase()}) and date <= (${SEARCH_CUTOFF})`;
}

export function expectedOpenAlexOqo(queryId, doi) {
  const blocks = QUERY_BLOCKS[queryId];
  if (!blocks || !doi) return null;
  return {
    get_rows: "works",
    filter_rows: [
      ...blocks.map((block) => ({
        join: "or",
        filters: block.map((item) => ({
          column_id: "fulltext.search.exact",
          value: renderTerm(item),
          operator: "has",
        })),
      })),
      { column_id: "doi", value: `https://doi.org/${String(doi).toLowerCase()}` },
      { column_id: "to_publication_date", value: SEARCH_CUTOFF },
    ],
  };
}

function decodeCanonicalBase64(value) {
  if (typeof value !== "string" || value.length === 0 ||
      !BASE64_PATTERN.test(value) || value.length % 4 !== 0) return null;
  const bytes = Buffer.from(value, "base64");
  return bytes.toString("base64") === value ? bytes : null;
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
  const officialHost = domains.some(
    (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
  );
  const openAlexRoot = source === "OpenAlex" &&
    hostname === "api.openalex.org" && parsed.pathname === "/";
  const hasCredentialParameter = [...parsed.searchParams.keys()].some(
    (name) => /^(?:api[_-]?key|x-api-key|authorization)$/i.test(name),
  );
  return parsed.protocol === "https:" && parsed.username === "" &&
    parsed.password === "" && officialHost && !hasCredentialParameter &&
    (openAlexRoot || parsed.pathname !== "/" || parsed.search.length > 1);
}

function queryContainsIdentity(run, ledgerRecord) {
  const query = String(run.query ?? "").toLowerCase();
  return governedIdentities(run.source, ledgerRecord?.sentinel_id, ledgerRecord?.doi)
    .some((identity) => query.includes(identity));
}

function candidateQueryRequiresIdentity(run) {
  return run.query_id === "INDEX" || run.source !== "Semantic Scholar";
}

function parseJsonBytes(bytes) {
  try {
    return JSON.parse(bytes.toString("utf8"));
  } catch {
    return null;
  }
}

function responseContainsIdentity(body, run, ledgerRecord) {
  const text = body.toString("utf8").toLowerCase();
  return governedIdentities(run.source, ledgerRecord?.sentinel_id, ledgerRecord?.doi)
    .some((identity) => text.includes(identity) ||
      text.includes(encodeURIComponent(identity).toLowerCase()));
}

function validateRetainedResponse(run, prefix, issues, ledgerRecord) {
  const responseBytes = decodeCanonicalBase64(run.response_body_base64);
  if (!responseBytes) {
    issues.push(`${prefix}.response_body_base64 must retain non-empty canonical base64 response bytes`);
    return null;
  }
  if (!SHA256_PATTERN.test(run.response_sha256) ||
      run.response_sha256 !== sha256(responseBytes)) {
    issues.push(`${prefix}.response_sha256 must bind the retained response bytes`);
  }
  if (!Number.isSafeInteger(run.http_status) || run.http_status < 100 || run.http_status > 599) {
    issues.push(`${prefix}.http_status must be an integer HTTP status`);
  }
  const successful = run.outcome === "success" &&
    Number.isSafeInteger(run.http_status) && run.http_status >= 200 && run.http_status < 300;
  const validNotFound = run.outcome === "not-found" && run.query_id === "INDEX" &&
    run.http_status === 404 && run.result_count === 0 && run.sentinel_found === false;
  if (!successful && !validNotFound) {
    issues.push(`${prefix}: HTTP/access outcome cannot satisfy governed sentinel evidence`);
  }
  if ([400, 429].includes(run.http_status)) {
    issues.push(`${prefix}: HTTP ${run.http_status} is an access/query failure, never zero recall`);
  }
  if (typeof run.response_content_type !== "string" ||
      !/^(?:application\/json|text\/html)(?:\s*;.*)?$/i.test(run.response_content_type)) {
    issues.push(`${prefix}.response_content_type must identify retained JSON or HTML bytes`);
  }
  if (run.security_verification !== false ||
      SECURITY_PAGE_PATTERN.test(responseBytes.toString("utf8"))) {
    issues.push(`${prefix}: security-verification content is an access interruption, never zero recall`);
  }
  if (["OpenAlex", "Semantic Scholar"].includes(run.source)) {
    if (!/^application\/json(?:\s*;.*)?$/i.test(run.response_content_type ?? "") ||
        parseJsonBytes(responseBytes) === null) {
      issues.push(`${prefix}: governed API evidence must retain a valid JSON response`);
    }
  }
  if (run.sentinel_found === true && !responseContainsIdentity(responseBytes, run, ledgerRecord)) {
    issues.push(`${prefix}: retained response bytes must contain the governed sentinel identity when found`);
  }
  return responseBytes;
}

function validateFieldScope(run, prefix, issues) {
  if (run.query_id === "INDEX") {
    if (run.field_scope !== "Identity") {
      issues.push(`${prefix}.field_scope must equal Identity for an Index-check`);
    }
    return;
  }
  const valid = run.source === "IEEE Xplore"
    ? IEEE_FAMILY_SCOPES.includes(run.field_scope)
    : run.source === "ACM Digital Library"
      ? run.field_scope === ACM_FAMILY_SCOPE
      : run.source === "OpenAlex"
        ? run.field_scope === OPENALEX_FAMILY_SCOPE
        : run.source === "Semantic Scholar"
          ? run.field_scope === SEMANTIC_SCHOLAR_FAMILY_SCOPE
          : false;
  if (!valid) {
    issues.push(`${prefix}.field_scope does not match the governed source search surface`);
  }
}

function validateIeeeTranslation(run, prefix, issues, ledgerRecord) {
  const expected = canonicalIeeeQuery(
    run.query_id,
    run.field_scope,
    ledgerRecord?.sentinel_id,
    ledgerRecord?.doi,
  );
  if (!expected || normalizeWhitespace(run.query) !== normalizeWhitespace(expected)) {
    issues.push(`${prefix}: IEEE query must preserve the complete governed Q and identity in one bounded field subrun`);
  }
  if (!exactFields(run.request_view_parameters, [
    "publication_cutoff", "content_types", "cutoff_handling",
  ]) || run.request_view_parameters.publication_cutoff !== SEARCH_CUTOFF ||
      !Array.isArray(run.request_view_parameters.content_types) ||
      !sameSet(run.request_view_parameters.content_types, ["Journals", "Conferences"]) ||
      run.request_view_parameters.cutoff_handling !== "post-export") {
    issues.push(`${prefix}: IEEE field subrun must bind journals/conferences and the exact post-export cutoff`);
  }
  let locator = null;
  try {
    locator = new URL(run.result_url);
  } catch {}
  if (!locator || locator.origin !== "https://ieeexplore.ieee.org" ||
      locator.pathname !== "/search/searchresult.jsp" ||
      locator.searchParams.getAll("queryText").length !== 1 ||
      normalizeWhitespace(locator.searchParams.get("queryText")) !== normalizeWhitespace(run.query) ||
      [...locator.searchParams.keys()].some(
        (name) => !["queryText", "newsearch", "matchBoolean", "ranges"].includes(name),
      )) {
    issues.push(`${prefix}: IEEE locator must bind the exact bounded field subrun in queryText`);
  }
}

function validateAcmTranslation(run, prefix, issues, ledgerRecord) {
  const normalized = normalizeWhitespace(run.query);
  const expected = normalizeWhitespace(
    canonicalAcmQuery(run.query_id, ledgerRecord?.sentinel_id, ledgerRecord?.doi),
  );
  if (!expected || normalized !== expected) {
    issues.push(`${prefix}: ACM query must be the exact Title/Abstract/Keyword union with identical governed Q and identity constraint`);
  }
  if (/\b(?:AllField|Anywhere|FullText)\s*[:(]/i.test(normalized)) {
    issues.push(`${prefix}: governed ACM query semantics must not use AllField, Anywhere, or full text`);
  }
  let locator = null;
  try {
    locator = new URL(run.result_url);
  } catch {}
  const parameterNames = locator ? [...locator.searchParams.keys()] : [];
  if (!locator || locator.hostname.toLowerCase() !== "dl.acm.org" ||
      locator.pathname !== "/action/doSearch" ||
      locator.searchParams.getAll("AllField").length !== 1 ||
      normalizeWhitespace(locator.searchParams.get("AllField")) !== normalized ||
      locator.searchParams.get("expand") !== "all" ||
      locator.searchParams.get("BeforeMonth") !== "8" ||
      locator.searchParams.get("BeforeYear") !== "2026" ||
      parameterNames.some((name) => ![
        "AllField", "expand", "BeforeMonth", "BeforeYear",
      ].includes(name))) {
    issues.push(`${prefix}: ACM locator must transport exactly the governed field union, Guide collection, and cutoff month`);
  }
  if (!exactFields(run.request_view_parameters, ACM_VIEW_FIELDS) ||
      run.request_view_parameters.collection !== "ACM Guide to Computing Literature" ||
      run.request_view_parameters.publication_cutoff !== SEARCH_CUTOFF ||
      run.request_view_parameters.cutoff_handling !== "post-export") {
    issues.push(`${prefix}: ACM view provenance must bind the Guide collection and exact post-export cutoff`);
  }
}

function validateOpenAlexTranslation(run, prefix, issues, ledgerRecord) {
  let locator = null;
  try {
    locator = new URL(run.result_url);
  } catch {}
  if (!locator || locator.toString() !== "https://api.openalex.org/" || run.request_method !== "POST") {
    issues.push(`${prefix}: governed OpenAlex query must execute canonical OQO via exact root POST`);
  }
  if (!exactFields(run.request_view_parameters, OPENALEX_VIEW_FIELDS) ||
      run.request_view_parameters.per_page !== 100 ||
      run.request_view_parameters.cursor !== "*") {
    issues.push(`${prefix}: OpenAlex view parameters must be exactly per_page=100 and cursor=* with no OQO collision`);
  }
  const provenance = run.translation_provenance;
  if (!exactFields(provenance, TRANSLATION_FIELDS)) {
    issues.push(`${prefix}: OpenAlex translation_provenance fields do not match schema 1.2.0`);
    return;
  }
  if (provenance.oql_version !== "2.2" || provenance.oqo_version !== "1.4") {
    issues.push(`${prefix}: OpenAlex provenance must pin OQL 2.2 and OQO 1.4`);
  }
  if (provenance.input_oql_sha256 !== sha256(run.query)) {
    issues.push(`${prefix}: input_oql_sha256 must bind the exact input OQL`);
  }
  if (typeof provenance.canonical_oql !== "string" ||
      provenance.canonical_oql_sha256 !== sha256(provenance.canonical_oql)) {
    issues.push(`${prefix}: canonical_oql and canonical_oql_sha256 must match`);
  }
  if (!isPlainObject(provenance.canonical_oqo) ||
      provenance.canonical_oqo_sha256 !== sha256(JSON.stringify(provenance.canonical_oqo))) {
    issues.push(`${prefix}: canonical_oqo and canonical_oqo_sha256 must match`);
  }
  const expectedOqo = expectedOpenAlexOqo(run.query_id, ledgerRecord?.doi);
  if (!expectedOqo || JSON.stringify(provenance.canonical_oqo) !== JSON.stringify(expectedOqo)) {
    issues.push(`${prefix}: canonical OQO must preserve the exact governed Boolean blocks, DOI, and cutoff for ${run.query_id}`);
  }
  const expectedPayload = JSON.stringify({
    oqo: provenance.canonical_oqo,
    per_page: 100,
    cursor: "*",
  });
  if (!SHA256_PATTERN.test(run.request_payload_sha256) ||
      run.request_payload_sha256 !== sha256(expectedPayload)) {
    issues.push(`${prefix}: request_payload_sha256 must bind the canonical OQO and collision-free view parameters`);
  }
  if (provenance.validation_valid !== true ||
      !Array.isArray(provenance.validation_errors) || provenance.validation_errors.length !== 0 ||
      !Array.isArray(provenance.validation_warnings) || provenance.validation_warnings.length !== 0) {
    issues.push(`${prefix}: OpenAlex translation validation must be clean and warning-free`);
  }
  const translationBytes = decodeCanonicalBase64(provenance.translation_response_base64);
  if (!translationBytes || !SHA256_PATTERN.test(provenance.translation_response_sha256) ||
      provenance.translation_response_sha256 !== sha256(translationBytes)) {
    issues.push(`${prefix}: translation_response_sha256 must bind retained /query response bytes`);
  } else {
    const translated = parseJsonBytes(translationBytes);
    if (!isPlainObject(translated) ||
        typeof translated.oql !== "string" || translated.oql.trim().length === 0 ||
        translated.oql_oneline !== run.query ||
        translated.oql_oneline !== provenance.canonical_oql ||
        JSON.stringify(translated.oqo) !== JSON.stringify(provenance.canonical_oqo) ||
        translated.validation?.valid !== true ||
        !Array.isArray(translated.validation?.errors) || translated.validation.errors.length !== 0 ||
        !Array.isArray(translated.validation?.warnings) || translated.validation.warnings.length !== 0 ||
        (translated.oxurl ?? null) !== provenance.oxurl) {
      issues.push(`${prefix}: retained /query response must bind input OQL, canonical OQL/OQO, clean validation, and oxurl`);
    }
  }
  if (provenance.oxurl !== null &&
      (typeof provenance.oxurl !== "string" || !provenance.oxurl.startsWith("/works?") ||
       /(?:api[_-]?key|authorization|mailto)=/i.test(provenance.oxurl))) {
    issues.push(`${prefix}: oxurl must be null or a credential-free diagnostic /works locator`);
  }
  if (/(?:^|[\s(])(?:search|search\.exact)\s*[:=]/i.test(`${run.query} ${provenance.canonical_oql}`)) {
    issues.push(`${prefix}: governed OpenAlex OQL must not use deprecated monolithic search fields`);
  }
  if (/\*["']?~\d+/i.test(`${run.query} ${provenance.canonical_oql}`)) {
    issues.push(`${prefix}: governed OpenAlex wildcard phrase must not use a ~N suffix`);
  }
}

function validateSemanticScholarTranslation(run, prefix, issues) {
  const expectedQuery = canonicalSemanticScholarQuery(run.query_id);
  if (!expectedQuery || normalizeWhitespace(run.query) !== normalizeWhitespace(expectedQuery)) {
    issues.push(`${prefix}: Semantic Scholar query must be the exact governed title/abstract bulk translation using + for AND and | for OR`);
  }

  let locator = null;
  try {
    locator = new URL(run.result_url);
  } catch {}
  const parameterNames = locator ? [...locator.searchParams.keys()] : [];
  if (!locator || locator.origin !== "https://api.semanticscholar.org" ||
      locator.pathname !== "/graph/v1/paper/search/bulk" ||
      locator.searchParams.getAll("query").length !== 1 ||
      locator.searchParams.get("query") !== expectedQuery ||
      locator.searchParams.get("year") !== "-2026" ||
      locator.searchParams.get("fields") !== SEMANTIC_SCHOLAR_FIELDS.join(",") ||
      parameterNames.some((name) => !["query", "year", "fields"].includes(name))) {
    issues.push(`${prefix}: Semantic Scholar locator must bind the exact bulk query, year=-2026, and governed metadata fields without credentials or pagination ambiguity`);
  }
  if (!exactFields(run.request_view_parameters, [])) {
    issues.push(`${prefix}: Semantic Scholar GET view parameters must be empty because every governed parameter is bound in the locator`);
  }
}

function validateStructuredApiResult(run, responseBytes, prefix, issues, ledgerRecord) {
  if (!responseBytes || run.query_id === "INDEX") return;
  const body = parseJsonBytes(responseBytes);
  if (!isPlainObject(body)) return;
  if (run.source === "OpenAlex") {
    if (!Number.isSafeInteger(body.meta?.count) || body.meta.count !== run.result_count ||
        !Array.isArray(body.results)) {
      issues.push(`${prefix}: retained OpenAlex response must bind result_count and results`);
    }
    const found = Array.isArray(body.results) && body.results.some((record) =>
      String(record?.doi ?? "").toLowerCase().replace("https://doi.org/", "") ===
        String(ledgerRecord?.doi ?? "").toLowerCase());
    if (found !== run.sentinel_found) {
      issues.push(`${prefix}: retained OpenAlex response must bind sentinel_found`);
    }
  }
  if (run.source === "Semantic Scholar") {
    if (!Number.isSafeInteger(body.total) || body.total !== run.result_count ||
        !Array.isArray(body.data)) {
      issues.push(`${prefix}: retained Semantic Scholar response must bind result_count and data`);
    }
    const identities = governedIdentities(run.source, ledgerRecord?.sentinel_id, ledgerRecord?.doi);
    const found = Array.isArray(body.data) && body.data.some((record) => {
      const values = [record?.paperId, record?.externalIds?.DOI]
        .map((value) => String(value ?? "").toLowerCase());
      return identities.some((identity) => values.includes(identity));
    });
    if (found !== run.sentinel_found) {
      issues.push(`${prefix}: retained Semantic Scholar response must bind sentinel_found`);
    }
    if (run.sentinel_found === false && body.token !== undefined && body.token !== null) {
      issues.push(`${prefix}: a negative Semantic Scholar family result must exhaust continuation-token pagination`);
    }
  }
}

function validateGovernedTranslation(run, prefix, issues, ledgerRecord) {
  if (run.query_id === "INDEX" || typeof run.query !== "string") return;
  if (candidateQueryRequiresIdentity(run) && !queryContainsIdentity(run, ledgerRecord)) {
    issues.push(`${prefix}: governed candidate query must retain the sentinel identity constraint`);
  }
  if (run.source === "ACM Digital Library") {
    validateAcmTranslation(run, prefix, issues, ledgerRecord);
  }
  if (run.source === "IEEE Xplore") {
    validateIeeeTranslation(run, prefix, issues, ledgerRecord);
  }
  if (run.source === "OpenAlex") {
    validateOpenAlexTranslation(run, prefix, issues, ledgerRecord);
  }
  if (run.source === "Semantic Scholar") {
    validateSemanticScholarTranslation(run, prefix, issues);
  }
}

export function verifySlrSentinelEvidence({ artifactBytes, ledgerRecord, now = new Date() }) {
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
  if (!isPlainObject(artifact)) return { issues: [`${prefix}: artifact must be a JSON object`] };
  if (!exactFields(artifact, ARTIFACT_FIELDS)) {
    issues.push(`${prefix}: artifact fields do not match schema 1.2.0`);
  }

  for (const [field, expected] of [
    ["schema_version", "1.2.0"], ["task", "SLR-101"],
    ["protocol_version", "0.2.2"], ["sentinel_id", ledgerRecord?.sentinel_id],
    ["doi", ledgerRecord?.doi], ["reviewer", SENTINEL_REVIEWER_ROLE],
    ["classification", ledgerRecord?.classification],
    ["official_search_executed", false], ["candidate_results_screened", false],
  ]) {
    if (artifact[field] !== expected) {
      issues.push(`${prefix}: ${field} must equal ${JSON.stringify(expected)}`);
    }
  }
  if (!isCanonicalUtcSecond(artifact.recorded_at)) {
    issues.push(`${prefix}: recorded_at must be a canonical UTC timestamp`);
  } else {
    const recordedTimestamp = Date.parse(artifact.recorded_at);
    if (recordedTimestamp < D021_PINNED_TIMESTAMP) {
      issues.push(`${prefix}: recorded_at must follow the pinned D-021 merge`);
    }
    if (recordedTimestamp > latestAllowedTimestamp) {
      issues.push(`${prefix}: recorded_at cannot be in the future`);
    }
  }
  if (typeof artifact.rationale !== "string" || artifact.rationale.trim().length < 20 ||
      containsPlaceholder(artifact.rationale)) {
    issues.push(`${prefix}: rationale must contain at least 20 non-placeholder characters`);
  }

  const expectedIndexed = ledgerRecord?.indexed_sources ?? [];
  const expectedRetrieved = ledgerRecord?.retrieved_sources ?? [];
  for (const [field, expected] of [
    ["indexed_sources", expectedIndexed], ["retrieved_sources", expectedRetrieved],
  ]) {
    const value = artifact[field];
    if (!uniqueStrings(value) || value.some((source) => !PRIMARY_SOURCES.includes(source)) ||
        !sameSet(value, expected)) {
      issues.push(`${prefix}: ${field} must exactly match the sentinel ledger`);
    }
  }

  if (!Array.isArray(artifact.runs) || artifact.runs.length === 0) {
    issues.push(`${prefix}: runs must contain at least one query execution`);
    return { issues, artifact };
  }

  const expectedQueryIds = SENTINEL_QUERY_IDS[ledgerRecord?.sentinel_id] ?? [];
  const runIdentities = new Set();
  const indexRunCounts = new Map();
  const candidateRunCounts = new Map();
  const indexedFoundSources = new Set();
  const retrievedFoundSources = new Set();
  let latestExecution = Number.NEGATIVE_INFINITY;

  artifact.runs.forEach((run, index) => {
    const runPrefix = `${prefix}: runs[${index}]`;
    if (!isPlainObject(run)) {
      issues.push(`${runPrefix} must be an object`);
      return;
    }
    if (!exactFields(run, RUN_FIELDS)) issues.push(`${runPrefix} fields do not match schema 1.2.0`);
    if (!PRIMARY_SOURCES.includes(run.source)) {
      issues.push(`${runPrefix}.source is not a governed primary source`);
    }
    const expectedFamily = QUERY_ID_TO_FAMILY[run.query_id];
    if (!expectedFamily || run.query_family !== expectedFamily) {
      issues.push(`${runPrefix}: query_id and query_family do not match the governed mapping`);
    }
    if (run.query_id !== "INDEX" && !expectedQueryIds.includes(run.query_id)) {
      issues.push(`${runPrefix}: query_id is not predeclared for ${ledgerRecord?.sentinel_id}`);
    }
    validateFieldScope(run, runPrefix, issues);
    if (typeof run.query !== "string" || run.query.trim().length < 10 || containsPlaceholder(run.query)) {
      issues.push(`${runPrefix}.query must contain the executed query`);
    } else if (candidateQueryRequiresIdentity(run) && !queryContainsIdentity(run, ledgerRecord)) {
      issues.push(`${runPrefix}.query must contain a governed sentinel identity`);
    }
    if (!isCanonicalUtcSecond(run.executed_at)) {
      issues.push(`${runPrefix}.executed_at must be a canonical UTC timestamp`);
    } else {
      const executionTimestamp = Date.parse(run.executed_at);
      latestExecution = Math.max(latestExecution, executionTimestamp);
      if (executionTimestamp < D021_PINNED_TIMESTAMP) {
        issues.push(`${runPrefix}.executed_at must follow the pinned D-021 merge`);
      }
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
      if (run.query_id === "INDEX") indexedFoundSources.add(run.source);
      else retrievedFoundSources.add(run.source);
      if (Number.isSafeInteger(run.result_count) && run.result_count < 1) {
        issues.push(`${runPrefix}.result_count must be positive when sentinel_found is true`);
      }
    }
    if (!isOfficialEvidenceLocator(run.result_url, run.source)) {
      issues.push(`${runPrefix}.result_url must be an official HTTPS evidence locator for ${run.source ?? "the governed source"}`);
    }
    if (!isPlainObject(run.request_view_parameters) ||
        /(?:api[_-]?key|authorization|mailto)/i.test(JSON.stringify(run.request_view_parameters))) {
      issues.push(`${runPrefix}.request_view_parameters must be a credential-free object`);
    }
    const responseBytes = validateRetainedResponse(run, runPrefix, issues, ledgerRecord);
    if (run.source !== "OpenAlex" || run.query_id === "INDEX") {
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
    validateGovernedTranslation(run, runPrefix, issues, ledgerRecord);
    validateStructuredApiResult(run, responseBytes, runPrefix, issues, ledgerRecord);

    if (run.query_id === "INDEX" && PRIMARY_SOURCES.includes(run.source)) {
      indexRunCounts.set(run.source, (indexRunCounts.get(run.source) ?? 0) + 1);
    } else if (PRIMARY_SOURCES.includes(run.source) && expectedQueryIds.includes(run.query_id)) {
      const key = `${run.source}|${run.query_id}|${run.field_scope}`;
      candidateRunCounts.set(key, (candidateRunCounts.get(key) ?? 0) + 1);
    }
    const identity = `${run.source}|${run.query_id}|${run.field_scope}|${run.query}`;
    if (runIdentities.has(identity)) issues.push(`${runPrefix} duplicates an earlier query execution`);
    runIdentities.add(identity);
  });

  if (isCanonicalUtcSecond(artifact.recorded_at) &&
      latestExecution !== Number.NEGATIVE_INFINITY &&
      Date.parse(artifact.recorded_at) < latestExecution) {
    issues.push(`${prefix}: recorded_at cannot predate a query execution`);
  }
  for (const source of PRIMARY_SOURCES) {
    const count = indexRunCounts.get(source) ?? 0;
    if (count !== 1) {
      issues.push(`${prefix}: governed source ${source} requires exactly one fresh Index-check execution; found ${count}`);
    }
  }
  function queryExecutionState(source, queryId) {
    const scopes = source === "IEEE Xplore"
      ? IEEE_FAMILY_SCOPES
      : [source === "ACM Digital Library"
          ? ACM_FAMILY_SCOPE
          : source === "OpenAlex"
            ? OPENALEX_FAMILY_SCOPE
            : SEMANTIC_SCHOLAR_FAMILY_SCOPE];
    const counts = scopes.map(
      (scope) => candidateRunCounts.get(`${source}|${queryId}|${scope}`) ?? 0,
    );
    return {
      complete: counts.every((count) => count === 1),
      present: counts.some((count) => count > 0),
      description: scopes.map((scope, index) => `${scope}=${counts[index]}`).join(", "),
    };
  }
  for (const source of expectedIndexed) {
    const states = expectedQueryIds.map((queryId) => ({
      queryId,
      ...queryExecutionState(source, queryId),
    }));
    if (ledgerRecord?.sentinel_id === "S-005") {
      if (!states.some((state) => state.complete)) {
        issues.push(`${prefix}: indexed source ${source} requires a complete governed A2 or B1 family execution`);
      }
      for (const state of states.filter((candidate) => candidate.present && !candidate.complete)) {
        issues.push(`${prefix}: indexed source ${source} has an incomplete governed ${state.queryId} family execution (${state.description})`);
      }
    } else {
      for (const state of states.filter((candidate) => !candidate.complete)) {
        issues.push(`${prefix}: indexed source ${source} requires one governed ${state.queryId} run per required field scope (${state.description})`);
      }
    }
  }
  if (!sameSet([...indexedFoundSources], expectedIndexed)) {
    issues.push(`${prefix}: positive Index-check runs must match indexed_sources`);
  }
  if (!sameSet([...retrievedFoundSources], expectedRetrieved)) {
    issues.push(`${prefix}: positive candidate-family runs must match retrieved_sources`);
  }

  if (artifact.classification === "retrieved") {
    if (expectedIndexed.length === 0 || expectedRetrieved.length === 0) {
      issues.push(`${prefix}: retrieved classification requires indexed and retrieved sources`);
    }
  } else if (artifact.classification === "not-indexed") {
    if (expectedIndexed.length !== 0 || expectedRetrieved.length !== 0 ||
        PRIMARY_SOURCES.some((source) => (indexRunCounts.get(source) ?? 0) !== 1) ||
        indexedFoundSources.size !== 0 || retrievedFoundSources.size !== 0) {
      issues.push(`${prefix}: not-indexed classification requires negative checks in all four sources`);
    }
  }

  return { issues, artifact };
}
