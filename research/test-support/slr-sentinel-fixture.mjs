import { createHash } from "node:crypto";

const PRIMARY_SOURCES = Object.freeze([
  "IEEE Xplore",
  "ACM Digital Library",
  "Scopus",
  "Web of Science Core Collection",
]);

export const TEST_SENTINELS = Object.freeze([
  {
    sentinel_id: "S-001",
    doi: "10.1145/222124.222136",
    indexed_sources: ["ACM Digital Library", "Scopus"],
    retrieved_sources: ["ACM Digital Library"],
  },
  {
    sentinel_id: "S-002",
    doi: "10.1109/WICSA.2007.1",
    indexed_sources: ["IEEE Xplore", "Scopus"],
    retrieved_sources: ["IEEE Xplore"],
  },
  {
    sentinel_id: "S-003",
    doi: "10.1002/spe.931",
    indexed_sources: ["Scopus", "Web of Science Core Collection"],
    retrieved_sources: ["Scopus"],
  },
  {
    sentinel_id: "S-004",
    doi: "10.1016/j.jss.2011.07.036",
    indexed_sources: ["Scopus", "Web of Science Core Collection"],
    retrieved_sources: ["Scopus"],
  },
  {
    sentinel_id: "S-005",
    doi: "10.3217/jucs-023-08-0769",
    indexed_sources: ["Scopus"],
    retrieved_sources: ["Scopus"],
  },
  {
    sentinel_id: "S-006",
    doi: "10.1002/smr.2423",
    indexed_sources: ["Scopus", "Web of Science Core Collection"],
    retrieved_sources: ["Scopus"],
  },
]);

function createArtifact(record, ordinal) {
  const runSources =
    record.classification === "not-indexed"
      ? PRIMARY_SOURCES
      : record.indexed_sources;
  const runs = runSources.map((source, sourceOrdinal) => {
    const found = record.retrieved_sources.includes(source);
    return {
      source,
      query_family: "Index-check",
      query: `TEST FIXTURE DOI ${record.doi} source ${source}`,
      executed_at: `2026-08-16T07:${String(ordinal * 3 + sourceOrdinal).padStart(2, "0")}:00Z`,
      result_count: found ? 1 : 0,
      sentinel_found: found,
      result_url: `https://example.test/slr/${record.sentinel_id}/${sourceOrdinal}`,
    };
  });
  return {
    schema_version: "1.0.0",
    task: "SLR-101",
    protocol_version: "0.1.0",
    sentinel_id: record.sentinel_id,
    doi: record.doi,
    reviewer: "Member 3",
    recorded_at: `2026-08-16T08:${String(ordinal).padStart(2, "0")}:00Z`,
    classification: record.classification,
    indexed_sources: record.indexed_sources,
    retrieved_sources: record.retrieved_sources,
    official_search_executed: false,
    candidate_results_screened: false,
    runs,
    rationale:
      "Synthetic test-only calibration record; it is never accepted as research evidence.",
  };
}

export function createSentinelEvidenceFixture({
  mutateArtifact,
  mutateRecord,
} = {}) {
  const artifacts = new Map();
  const hashes = new Map();
  const rows = [];

  TEST_SENTINELS.forEach((baseRecord, ordinal) => {
    let record = { ...baseRecord, classification: "retrieved" };
    if (mutateRecord) record = mutateRecord(record, ordinal);
    const path = `research/evidence/slr-sentinel/${record.sentinel_id}.json`;
    let artifact = createArtifact(record, ordinal);
    if (mutateArtifact) artifact = mutateArtifact(artifact, record, ordinal);
    const bytes = Buffer.from(`${JSON.stringify(artifact, null, 2)}\n`, "utf8");
    const digest = createHash("sha256").update(bytes).digest("hex");
    artifacts.set(path, bytes);
    hashes.set(path, digest);
    rows.push(
      [
        record.sentinel_id,
        record.doi,
        record.indexed_sources.join(";"),
        record.retrieved_sources.join(";"),
        record.classification,
        "Member 3",
        `${path}#sha256=${digest}`,
      ].join(","),
    );
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
