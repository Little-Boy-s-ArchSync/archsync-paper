import { readFile } from "node:fs/promises";

import {
  validateHoldoutReportTemplate,
  validatePaperResultsManifest,
  validateResultsManifestSchema,
} from "./validate-evaluation-report-scaffold.mjs";

const [report, manifestText, schemaText] = await Promise.all([
  readFile(new URL("holdout-report.template.md", import.meta.url), "utf8"),
  readFile(new URL("paper-results-manifest.template.json", import.meta.url), "utf8"),
  readFile(new URL("paper-results-manifest.schema.json", import.meta.url), "utf8"),
]);
const issues = [
  ...validateHoldoutReportTemplate(report),
  ...validatePaperResultsManifest(JSON.parse(manifestText)),
  ...validateResultsManifestSchema(JSON.parse(schemaText)),
];

if (issues.length > 0) {
  for (const issue of issues) console.error(`INVALID EVALUATION REPORT SCAFFOLD: ${issue}`);
  process.exitCode = 1;
} else {
  console.log("VALID EVALUATION REPORT SCAFFOLD (EVAL-111 and ANALYSIS-101; no result evidence)");
}
