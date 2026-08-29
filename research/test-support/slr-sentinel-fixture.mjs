import { createHash } from "node:crypto";

import {
  PRIMARY_SOURCES,
  SENTINEL_QUERY_IDS,
  canonicalAcmQuery,
  canonicalIeeeQuery,
  canonicalLogicalQuery,
  canonicalOpenAlexInputOql,
  canonicalSemanticScholarQuery,
  expectedOpenAlexOqo,
  governedIdentities,
} from "../verify-slr-sentinel-evidence.mjs";

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function retainedResponse(source, body) {
  const bytes = Buffer.from(
    typeof body === "string" ? body : JSON.stringify(body),
    "utf8",
  );
  return {
    outcome: "success",
    http_status: 200,
    response_content_type:
      source === "OpenAlex" || source === "Semantic Scholar"
        ? "application/json"
        : "text/html; charset=utf-8",
    security_verification: false,
    response_body_base64: bytes.toString("base64"),
    response_sha256: sha256(bytes),
  };
}

function testEvidenceLocator(source, sentinelId, doi, sourceOrdinal) {
  if (source === "IEEE Xplore") {
    return `https://ieeexplore.ieee.org/search/searchresult.jsp?queryText=${encodeURIComponent(doi)}`;
  }
  if (source === "ACM Digital Library") {
    return `https://dl.acm.org/action/doSearch?AllField=${encodeURIComponent(doi)}&expand=all`;
  }
  if (source === "OpenAlex") {
    return `https://api.openalex.org/works/https://doi.org/${doi}`;
  }
  const identity = governedIdentities(source, sentinelId, doi).at(-1);
  return `https://api.semanticscholar.org/graph/v1/paper/${encodeURIComponent(identity)}?fields=paperId,externalIds`;
}

function queryFamily(queryId) {
  if (queryId.startsWith("A")) return "Search-A";
  if (queryId.startsWith("B")) return "Search-B";
  return "Search-C";
}

function executionTime(artifactOrdinal, runOrdinal) {
  const timestamp = Date.parse("2026-08-28T15:46:00Z") +
    artifactOrdinal * 60_000 + runOrdinal * 2_000;
  return new Date(timestamp).toISOString().replace(".000Z", "Z");
}

export const TEST_SENTINELS = Object.freeze([
  {
    sentinel_id: "S-001",
    doi: "10.1145/222124.222136",
    indexed_sources: ["ACM Digital Library", "OpenAlex"],
    retrieved_sources: ["ACM Digital Library"],
  },
  {
    sentinel_id: "S-002",
    doi: "10.1109/WICSA.2007.1",
    indexed_sources: ["IEEE Xplore", "OpenAlex"],
    retrieved_sources: ["IEEE Xplore"],
  },
  {
    sentinel_id: "S-003",
    doi: "10.1002/spe.931",
    indexed_sources: ["ACM Digital Library", "OpenAlex", "Semantic Scholar"],
    retrieved_sources: ["OpenAlex"],
  },
  {
    sentinel_id: "S-004",
    doi: "10.1016/j.jss.2011.07.036",
    indexed_sources: ["ACM Digital Library", "OpenAlex", "Semantic Scholar"],
    retrieved_sources: ["OpenAlex"],
  },
  {
    sentinel_id: "S-005",
    doi: "10.3217/jucs-023-08-0769",
    indexed_sources: ["OpenAlex", "Semantic Scholar"],
    retrieved_sources: ["OpenAlex"],
  },
  {
    sentinel_id: "S-006",
    doi: "10.1002/smr.2423",
    indexed_sources: ["ACM Digital Library", "OpenAlex", "Semantic Scholar"],
    retrieved_sources: ["OpenAlex"],
  },
]);

function indexResponse(source, record, found) {
  const identities = governedIdentities(source, record.sentinel_id, record.doi);
  const identity = identities.at(-1);
  if (source === "OpenAlex") {
    return found
      ? { id: `https://openalex.org/${record.sentinel_id}`, doi: `https://doi.org/${record.doi}` }
      : { error: "not indexed" };
  }
  if (source === "Semantic Scholar") {
    return found
      ? { paperId: identity, externalIds: { DOI: record.doi } }
      : { error: "not indexed" };
  }
  return found
    ? `<html><body>indexed sentinel ${identity}</body></html>`
    : "<html><body>no indexed sentinel</body></html>";
}

function familyResponse(source, record, found) {
  const identity = governedIdentities(source, record.sentinel_id, record.doi).at(-1);
  if (source === "OpenAlex") {
    return {
      meta: { count: found ? 1 : 0 },
      results: found ? [{ doi: `https://doi.org/${record.doi}` }] : [],
    };
  }
  if (source === "Semantic Scholar") {
    return {
      total: found ? 1 : 0,
      data: found
        ? [{ paperId: identity, externalIds: { DOI: record.doi } }]
        : [],
    };
  }
  return found
    ? `<html><body>retrieved sentinel ${identity}</body></html>`
    : "<html><body>sentinel absent from result</body></html>";
}

function sourceQuery(source, queryId, fieldScope, record) {
  if (source === "IEEE Xplore") {
    return canonicalIeeeQuery(queryId, fieldScope, record.sentinel_id, record.doi);
  }
  if (source === "ACM Digital Library") {
    return canonicalAcmQuery(queryId, record.sentinel_id, record.doi);
  }
  if (source === "OpenAlex") {
    return canonicalOpenAlexInputOql(queryId, record.doi);
  }
  if (source === "Semantic Scholar") {
    return canonicalSemanticScholarQuery(queryId);
  }
  const identity = governedIdentities(source, record.sentinel_id, record.doi).at(-1);
  return `${canonicalLogicalQuery(queryId)} AND "${identity}"`;
}

function familyLocator(source, query, record) {
  if (source === "IEEE Xplore") {
    return `https://ieeexplore.ieee.org/search/searchresult.jsp?queryText=${encodeURIComponent(query)}`;
  }
  if (source === "ACM Digital Library") {
    return `https://dl.acm.org/action/doSearch?AllField=${encodeURIComponent(query)}&expand=all&BeforeMonth=8&BeforeYear=2026`;
  }
  if (source === "OpenAlex") return "https://api.openalex.org/";
  const fields = [
    "paperId", "externalIds", "title", "abstract", "authors", "year",
    "publicationDate", "venue", "publicationTypes", "url", "citationCount",
  ].join(",");
  return `https://api.semanticscholar.org/graph/v1/paper/search/bulk?query=${encodeURIComponent(query)}&year=-2026&fields=${encodeURIComponent(fields)}`;
}

function openAlexProvenance(query, queryId, doi) {
  const canonicalOqo = expectedOpenAlexOqo(queryId, doi);
  const canonicalOql = query.replace(/\s+/g, " ").trim();
  const prettyOql = query
    .replaceAll("(", "(\n  ")
    .replaceAll(")", "\n)");
  const oxurl = "/works?filter=fixture";
  const translationResponse = Buffer.from(JSON.stringify({
    oql: prettyOql,
    oql_oneline: canonicalOql,
    oqo: canonicalOqo,
    oxurl,
    validation: { valid: true, errors: [], warnings: [] },
  }), "utf8");
  return {
    oql_version: "2.2",
    oqo_version: "1.4",
    input_oql_sha256: sha256(query),
    canonical_oql: canonicalOql,
    canonical_oql_sha256: sha256(canonicalOql),
    canonical_oqo: canonicalOqo,
    canonical_oqo_sha256: sha256(JSON.stringify(canonicalOqo)),
    validation_valid: true,
    validation_errors: [],
    validation_warnings: [],
    translation_response_base64: translationResponse.toString("base64"),
    translation_response_sha256: sha256(translationResponse),
    oxurl,
  };
}

function createArtifact(record, ordinal, queryIdsOverride) {
  let runOrdinal = 0;
  const indexRuns = PRIMARY_SOURCES.map((source, sourceOrdinal) => {
    const found = record.indexed_sources.includes(source);
    const response = indexResponse(source, record, found);
    return {
      source,
      query_family: "Index-check",
      query_id: "INDEX",
      field_scope: "Identity",
      query: `DOI or governed fallback lookup ${governedIdentities(source, record.sentinel_id, record.doi).at(-1)} in ${source}`,
      executed_at: executionTime(ordinal, runOrdinal++),
      ...retainedResponse(source, response),
      result_count: found ? 1 : 0,
      sentinel_found: found,
      result_url: testEvidenceLocator(source, record.sentinel_id, record.doi, sourceOrdinal),
      request_method: "GET",
      request_view_parameters: {},
      request_payload_sha256: "",
      translation_provenance: null,
    };
  });

  const expectedQueryIds = queryIdsOverride ?? (record.sentinel_id === "S-005"
    ? [SENTINEL_QUERY_IDS[record.sentinel_id][0]]
    : SENTINEL_QUERY_IDS[record.sentinel_id]);
  const familyRuns = record.indexed_sources.flatMap((source) =>
    expectedQueryIds.flatMap((queryId, queryOrdinal) => {
      const scopes = source === "IEEE Xplore"
        ? ["Document Title", "Abstract", "Author Keywords"]
        : [source === "ACM Digital Library"
            ? "Title; Abstract; Author Keyword"
            : source === "OpenAlex"
              ? "Title; Abstract; Full text"
              : "Title; Abstract"];
      return scopes.map((fieldScope, scopeOrdinal) => {
        const found = record.retrieved_sources.includes(source) &&
          queryOrdinal === 0 && scopeOrdinal === 0;
        const query = sourceQuery(source, queryId, fieldScope, record);
        const translationProvenance = source === "OpenAlex"
          ? openAlexProvenance(query, queryId, record.doi)
          : null;
        const view = source === "OpenAlex"
          ? { per_page: 100, cursor: "*" }
          : source === "ACM Digital Library"
            ? {
                collection: "ACM Guide to Computing Literature",
                publication_cutoff: "2026-08-16",
                cutoff_handling: "post-export",
              }
            : source === "IEEE Xplore"
              ? {
                  publication_cutoff: "2026-08-16",
                  content_types: ["Journals", "Conferences"],
                  cutoff_handling: "post-export",
                }
              : {};
        return {
          source,
          query_family: queryFamily(queryId),
          query_id: queryId,
          field_scope: fieldScope,
          query,
          executed_at: executionTime(ordinal, runOrdinal++),
          ...retainedResponse(source, familyResponse(source, record, found)),
          result_count: found ? 1 : 0,
          sentinel_found: found,
          result_url: familyLocator(source, query, record),
          request_method: source === "OpenAlex" ? "POST" : "GET",
          request_view_parameters: view,
          request_payload_sha256: source === "OpenAlex"
            ? sha256(JSON.stringify({
                oqo: translationProvenance.canonical_oqo,
                per_page: 100,
                cursor: "*",
              }))
            : "",
          translation_provenance: translationProvenance,
        };
      });
    }),
  );

  return {
    schema_version: "1.2.0",
    task: "SLR-101",
    protocol_version: "0.2.2",
    sentinel_id: record.sentinel_id,
    doi: record.doi,
    reviewer: "Independent SLR Reviewer",
    recorded_at: "2026-08-28T15:58:00Z",
    classification: record.classification,
    indexed_sources: record.indexed_sources,
    retrieved_sources: record.retrieved_sources,
    official_search_executed: false,
    candidate_results_screened: false,
    runs: [...indexRuns, ...familyRuns],
    rationale:
      "Synthetic test-only calibration record; it is never accepted as research evidence.",
  };
}

export function createSentinelEvidenceFixture({
  mutateArtifact,
  mutateRecord,
  queryIdsBySentinel = {},
} = {}) {
  const artifacts = new Map();
  const hashes = new Map();
  const rows = [];

  TEST_SENTINELS.forEach((baseRecord, ordinal) => {
    let record = { ...baseRecord, classification: "retrieved" };
    if (mutateRecord) record = mutateRecord(record, ordinal);
    const path = `research/evidence/slr-sentinel/${record.sentinel_id}.json`;
    let artifact = createArtifact(
      record,
      ordinal,
      queryIdsBySentinel[record.sentinel_id],
    );
    if (mutateArtifact) artifact = mutateArtifact(artifact, record, ordinal);
    const bytes = Buffer.from(`${JSON.stringify(artifact, null, 2)}\n`, "utf8");
    const digest = sha256(bytes);
    artifacts.set(path, bytes);
    hashes.set(path, digest);
    rows.push([
      record.sentinel_id,
      record.doi,
      record.indexed_sources.length ? record.indexed_sources.join(";") : "none",
      record.retrieved_sources.length ? record.retrieved_sources.join(";") : "none",
      record.classification,
      "Independent SLR Reviewer",
      `${path}#sha256=${digest}`,
    ].join(","));
  });

  return {
    sentinelRecall: `${[
      "sentinel_id,doi,indexed_sources,retrieved_sources,classification,reviewer,evidence",
      ...rows,
    ].join("\n")}\n`,
    sentinelEvidenceHashes: hashes,
    sentinelEvidenceArtifacts: artifacts,
  };
}
