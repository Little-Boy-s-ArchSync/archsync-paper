import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  validateHoldoutReportTemplate,
  validatePaperResultsManifest,
  validateResultsManifestSchema,
} from "./validate-evaluation-report-scaffold.mjs";

const digest = "a".repeat(64);
const artifact = (path) => ({ path, sha256: digest });
const validGeneratedManifest = () => ({
  $schema: "./paper-results-manifest.schema.json",
  schema_version: "0.1.0",
  status: "generated-evidence",
  task_ids: ["EVAL-111", "ANALYSIS-101"],
  generated_at: "2026-08-26T00:00:00Z",
  dataset: { id: "D3-v1", version: "1.0.0", frozen_at: "2026-08-25T00:00:00Z", sha256: digest, repository_count: 2 },
  analysis_plan: { version: "1.0.0", frozen_at: "2026-08-24T00:00:00Z", sha256: digest },
  pipeline: ["raw", "validated", "normalized", "tables", "figures"].map((stage) => ({
    stage,
    command: `node analysis/${stage}.mjs`,
    input_sha256: digest,
    output_sha256: digest,
    environment_sha256: digest,
  })),
  tables: [{ id: "T-D3-001", path: "generated/tables/d3.csv", sha256: digest, n: 0, uncertainty_method: "Wilson interval" }],
  figures: [{ id: "F-D3-001", path: "generated/figures/d3.pdf", sha256: digest, source_table_ids: ["T-D3-001"] }],
  report: artifact("sections/holdout-results.tex"),
  limitations: ["Repository scope is bounded."],
  deviations: null,
});

test("accepts the governed empty report and result-manifest templates", async () => {
  const report = await readFile(new URL("holdout-report.template.md", import.meta.url), "utf8");
  const manifest = JSON.parse(await readFile(new URL("paper-results-manifest.template.json", import.meta.url), "utf8"));
  const schema = JSON.parse(await readFile(new URL("paper-results-manifest.schema.json", import.meta.url), "utf8"));
  assert.deepEqual(validateHoldoutReportTemplate(report), []);
  assert.deepEqual(validatePaperResultsManifest(manifest), []);
  assert.deepEqual(validateResultsManifestSchema(schema), []);
});

test("holdout report validator preserves gates, sections, placeholders and no-tuning language", async () => {
  const report = await readFile(new URL("holdout-report.template.md", import.meta.url), "utf8");
  assert.deepEqual(validateHoldoutReportTemplate(""), ["holdout report template is required"]);
  for (const mutation of [
    report.replace("| Task | EVAL-111 |", "| Task | EVAL-110 |"),
    report.replace("TEMPLATE — NO RESULT / NOT EVIDENCE", "COMPLETE"),
    report.replace("EVAL-107; EVAL-109; EVAL-110; STAT-101", "EVAL-109"),
    report.replace("## Holdout metrics", "## Metrics"),
    report.replace("{{D3_DATASET_ID}}", "D3-v1"),
    report.replace("D1/D2/P3 remain\nseparate from D3", "Development data may overlap D3"),
    report.replace("must not be used to tune the analyzer", "may tune the analyzer"),
    report.replace("numerator, denominator, analyzed `n`", "summary value"),
    report.replace("Manual edits to\nnumbers or figures are prohibited", "Manual edits are allowed"),
  ]) assert.notDeepEqual(validateHoldoutReportTemplate(mutation), []);
  assert.match(validateHoldoutReportTemplate(`${report}\n{{D3_DATASET_ID}}`).join("\n"), /exactly once/u);
});

test("template manifest cannot contain generated evidence", async () => {
  const template = JSON.parse(await readFile(new URL("paper-results-manifest.template.json", import.meta.url), "utf8"));
  for (const [field, replacement] of [
    ["generated_at", "2026-08-26T00:00:00Z"],
    ["dataset", {}],
    ["analysis_plan", {}],
    ["report", {}],
    ["deviations", {}],
    ["pipeline", [{}]],
    ["tables", [{}]],
    ["figures", [{}]],
    ["limitations", ["invented"]],
  ]) assert.notDeepEqual(validatePaperResultsManifest({ ...template, [field]: replacement }), []);
});

test("accepts a complete generated-evidence provenance manifest", () => {
  assert.deepEqual(validatePaperResultsManifest(validGeneratedManifest()), []);
  assert.deepEqual(validatePaperResultsManifest({ ...validGeneratedManifest(), deviations: artifact("evidence/deviations.json") }), []);
});

test("generated manifest rejects identity, timestamp and provenance drift", () => {
  const base = validGeneratedManifest();
  for (const mutation of [
    null,
    { ...base, extra: true },
    { ...base, $schema: "remote.json" },
    { ...base, schema_version: "1.0.0" },
    { ...base, task_ids: ["ANALYSIS-101"] },
    { ...base, status: "approved" },
    { ...base, generated_at: "tomorrow" },
    { ...base, dataset: { ...base.dataset, repository_count: 0 } },
    { ...base, dataset: { ...base.dataset, frozen_at: "2026-99-99T00:00:00Z" } },
    { ...base, analysis_plan: { ...base.analysis_plan, sha256: "bad" } },
  ]) assert.notDeepEqual(validatePaperResultsManifest(mutation), []);
});

test("generated manifest enforces an ordered, hash-bound pipeline", () => {
  const base = validGeneratedManifest();
  for (const pipeline of [
    [],
    base.pipeline.map((row, index) => index === 0 ? { ...row, stage: "validated" } : row),
    base.pipeline.map((row, index) => index === 1 ? { ...row, command: "" } : row),
    base.pipeline.map((row, index) => index === 2 ? { ...row, output_sha256: "bad" } : row),
    base.pipeline.map((row, index) => index === 3 ? { ...row, extra: true } : row),
  ]) assert.notDeepEqual(validatePaperResultsManifest({ ...base, pipeline }), []);
});

test("generated manifest enforces table and figure traceability", () => {
  const base = validGeneratedManifest();
  for (const mutation of [
    { ...base, tables: [] },
    { ...base, tables: [{ ...base.tables[0], path: "../escape.csv" }] },
    { ...base, tables: [{ ...base.tables[0], n: -1 }] },
    { ...base, tables: [base.tables[0], base.tables[0]] },
    { ...base, figures: [] },
    { ...base, figures: [{ ...base.figures[0], source_table_ids: ["missing"] }] },
    { ...base, figures: [base.figures[0], base.figures[0]] },
    { ...base, report: artifact("/absolute.tex") },
    { ...base, limitations: [] },
    { ...base, limitations: ["same", "same"] },
    { ...base, deviations: artifact("../escape.json") },
  ]) assert.notDeepEqual(validatePaperResultsManifest(mutation), []);
});

test("schema validator binds the version and both evidence states", () => {
  const valid = {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: "https://archsync.dev/schemas/paper-results-manifest-0.1.0.json",
    oneOf: [{}, {}],
    $defs: { template: {}, generated: {}, artifact: {}, sha256: {} },
  };
  assert.deepEqual(validateResultsManifestSchema(valid), []);
  assert.deepEqual(validateResultsManifestSchema(null), ["JSON Schema document is required"]);
  for (const mutation of [
    { ...valid, $schema: "draft-07" },
    { ...valid, $id: "unversioned" },
    { ...valid, $defs: {} },
    { ...valid, oneOf: [{}] },
  ]) assert.notDeepEqual(validateResultsManifestSchema(mutation), []);
});
