const TOP_LEVEL_KEYS = [
  "$schema",
  "analysis_plan",
  "dataset",
  "deviations",
  "figures",
  "generated_at",
  "limitations",
  "pipeline",
  "report",
  "schema_version",
  "status",
  "tables",
  "task_ids",
];
const PIPELINE_STAGES = ["raw", "validated", "normalized", "tables", "figures"];
const REQUIRED_HEADINGS = [
  "Holdout protocol and provenance",
  "Repository characteristics and exclusions",
  "Independent ground truth",
  "Run completeness, failures, and missingness",
  "Holdout metrics",
  "False-positive and false-negative analysis",
  "Limitations and threats to validity",
  "Evidence-to-paper mapping",
];
const REQUIRED_TOKENS = [
  "D3_DATASET_ID",
  "D3_MANIFEST_SHA256",
  "STATISTICAL_PLAN_VERSION",
  "PAPER_RESULT_MANIFEST_PATH",
  "FROZEN_PROTOCOL_AND_PROVENANCE",
  "REPOSITORY_CHARACTERISTICS_TABLE",
  "GROUND_TRUTH_AND_ADJUDICATION_SUMMARY",
  "FAILURE_AND_MISSINGNESS_TABLE",
  "METRICS_BY_REPOSITORY_TABLE",
  "POOLED_METRICS_WITH_N_AND_UNCERTAINTY",
  "FALSE_POSITIVE_TAXONOMY",
  "FALSE_NEGATIVE_TAXONOMY",
  "LIMITATIONS_AND_THREATS",
  "EVIDENCE_MAPPING_TABLE",
];
const SHA256 = /^[0-9a-f]{64}$/u;
const UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/u;

function exactKeys(value, keys) {
  return value && typeof value === "object" && !Array.isArray(value)
    && JSON.stringify(Object.keys(value).sort()) === JSON.stringify([...keys].sort());
}

function safeRelativePath(value) {
  return typeof value === "string" && value.length > 0 && !value.startsWith("/")
    && !value.split(/[\\/]/u).includes("..");
}

function validUtc(value) {
  return typeof value === "string" && UTC.test(value) && Number.isFinite(Date.parse(value));
}

function validArtifact(value) {
  return exactKeys(value, ["path", "sha256"]) && safeRelativePath(value.path) && SHA256.test(value.sha256);
}

function validDataset(value) {
  return exactKeys(value, ["frozen_at", "id", "repository_count", "sha256", "version"])
    && [value.id, value.version].every((item) => typeof item === "string" && item.length > 0)
    && validUtc(value.frozen_at) && SHA256.test(value.sha256)
    && Number.isInteger(value.repository_count) && value.repository_count > 0;
}

function validAnalysisPlan(value) {
  return exactKeys(value, ["frozen_at", "sha256", "version"])
    && typeof value.version === "string" && value.version.length > 0
    && validUtc(value.frozen_at) && SHA256.test(value.sha256);
}

export function validateHoldoutReportTemplate(text) {
  const issues = [];
  if (typeof text !== "string" || text.length === 0) return ["holdout report template is required"];
  if (!/^\| Task \| EVAL-111 \|$/mu.test(text)) issues.push("task must be EVAL-111");
  if (!/^\| Status \| TEMPLATE — NO RESULT \/ NOT EVIDENCE \|$/mu.test(text)) issues.push("template must remain explicitly non-evidence");
  if (!/^\| Blocking dependencies \| EVAL-107; EVAL-109; EVAL-110; STAT-101 \|$/mu.test(text)) issues.push("blocking dependencies must remain explicit");
  for (const heading of REQUIRED_HEADINGS) if (!text.includes(`## ${heading}`)) issues.push(`missing section: ${heading}`);
  for (const token of REQUIRED_TOKENS) {
    const matches = text.match(new RegExp(`\\{\\{${token}\\}\\}`, "gu")) ?? [];
    if (matches.length !== 1) issues.push(`placeholder ${token} must occur exactly once`);
  }
  if (!/D1\/D2\/P3 remain\s+separate from D3/iu.test(text)) issues.push("development and holdout datasets must remain separate");
  if (!/must not be used to tune the analyzer/iu.test(text)) issues.push("the no-tuning boundary is required");
  if (!/numerator, denominator, analyzed `n`/u.test(text)) issues.push("numerator, denominator and analyzed n reporting is required");
  if (!/Manual edits to\s+numbers or figures are prohibited/iu.test(text)) issues.push("manual result edits must be prohibited");
  return issues;
}

export function validatePaperResultsManifest(value) {
  const issues = [];
  if (!exactKeys(value, TOP_LEVEL_KEYS)) return ["manifest top-level fields must match schema 0.1.0 exactly"];
  if (value.$schema !== "./paper-results-manifest.schema.json") issues.push("manifest must reference the local schema");
  if (value.schema_version !== "0.1.0") issues.push("schema version must be 0.1.0");
  if (JSON.stringify(value.task_ids) !== JSON.stringify(["EVAL-111", "ANALYSIS-101"])) issues.push("task IDs must bind EVAL-111 and ANALYSIS-101");
  if (value.status === "template-not-evidence") {
    for (const field of ["generated_at", "dataset", "analysis_plan", "report", "deviations"]) if (value[field] !== null) issues.push(`template field ${field} must be null`);
    for (const field of ["pipeline", "tables", "figures", "limitations"]) if (!Array.isArray(value[field]) || value[field].length !== 0) issues.push(`template field ${field} must be an empty array`);
    return issues;
  }
  if (value.status !== "generated-evidence") return [...issues, "status must be template-not-evidence or generated-evidence"];
  if (!validUtc(value.generated_at)) issues.push("generated_at must be canonical UTC");
  if (!validDataset(value.dataset)) issues.push("dataset provenance is invalid");
  if (!validAnalysisPlan(value.analysis_plan)) issues.push("frozen analysis-plan provenance is invalid");
  if (!Array.isArray(value.pipeline) || value.pipeline.length !== PIPELINE_STAGES.length) issues.push("pipeline must contain five ordered stages");
  else value.pipeline.forEach((stage, index) => {
    if (!exactKeys(stage, ["command", "environment_sha256", "input_sha256", "output_sha256", "stage"])
      || stage.stage !== PIPELINE_STAGES[index] || typeof stage.command !== "string" || stage.command.length === 0
      || ![stage.environment_sha256, stage.input_sha256, stage.output_sha256].every((digest) => SHA256.test(digest))) {
      issues.push(`pipeline stage ${PIPELINE_STAGES[index]} is invalid`);
    }
  });
  const tableIds = new Set();
  if (!Array.isArray(value.tables) || value.tables.length === 0) issues.push("at least one generated table is required");
  else for (const table of value.tables) {
    const valid = exactKeys(table, ["id", "n", "path", "sha256", "uncertainty_method"])
      && typeof table.id === "string" && table.id.length > 0 && !tableIds.has(table.id)
      && safeRelativePath(table.path) && SHA256.test(table.sha256)
      && Number.isInteger(table.n) && table.n >= 0
      && typeof table.uncertainty_method === "string" && table.uncertainty_method.length > 0;
    if (!valid) issues.push("generated table metadata is invalid");
    else tableIds.add(table.id);
  }
  const figureIds = new Set();
  if (!Array.isArray(value.figures) || value.figures.length === 0) issues.push("at least one generated figure is required");
  else for (const figure of value.figures) {
    const valid = exactKeys(figure, ["id", "path", "sha256", "source_table_ids"])
      && typeof figure.id === "string" && figure.id.length > 0 && !figureIds.has(figure.id)
      && safeRelativePath(figure.path) && SHA256.test(figure.sha256)
      && Array.isArray(figure.source_table_ids) && figure.source_table_ids.length > 0
      && new Set(figure.source_table_ids).size === figure.source_table_ids.length
      && figure.source_table_ids.every((id) => tableIds.has(id));
    if (!valid) issues.push("generated figure metadata is invalid");
    else figureIds.add(figure.id);
  }
  if (!validArtifact(value.report)) issues.push("generated report provenance is invalid");
  if (!Array.isArray(value.limitations) || value.limitations.length === 0
    || value.limitations.some((item) => typeof item !== "string" || item.length === 0)
    || new Set(value.limitations).size !== value.limitations.length) issues.push("limitations must be non-empty and unique");
  if (value.deviations !== null && !validArtifact(value.deviations)) issues.push("deviation provenance must be null or a valid artifact");
  return issues;
}

export function validateResultsManifestSchema(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return ["JSON Schema document is required"];
  const issues = [];
  if (value.$schema !== "https://json-schema.org/draft/2020-12/schema") issues.push("JSON Schema draft must be 2020-12");
  if (value.$id !== "https://archsync.dev/schemas/paper-results-manifest-0.1.0.json") issues.push("JSON Schema ID must be versioned");
  if (!value.$defs?.template || !value.$defs?.generated || !value.$defs?.artifact || !value.$defs?.sha256) issues.push("JSON Schema definitions are incomplete");
  if (!Array.isArray(value.oneOf) || value.oneOf.length !== 2) issues.push("JSON Schema must distinguish template and generated evidence");
  return issues;
}
