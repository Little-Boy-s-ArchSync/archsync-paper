import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const PROPOSAL_STATUS =
  "PROPOSED — NOT APPROVED / NOT FROZEN / NO OFFICIAL RUN AUTHORIZED";

export const DOCUMENT_SPECS = [
  {
    task: "EXP-101",
    file: "experiment-protocol.md",
    versionField: "Protocol version",
    version: "0.1.0-proposed",
    hashField: "Protocol SHA-256",
    dependencyField: "Sheet dependency",
    dependency: "RQ-101 — completed governed input: `claim-evidence.csv` + `validate-claim-evidence.mjs`",
    owner: "Hiếu",
    headings: [
      "Research-question and evidence boundary",
      "Dataset roles",
      "Experimental modules and run order",
      "Tool and environment lock",
      "Outcomes and statistical contract",
      "Exclusions, failures, and missingness",
      "Randomization and counterbalancing",
      "Stop conditions",
      "Governed inputs and co-freeze candidate",
      "Future freeze and run authorization",
      "Version history",
    ],
    requirements: [
      [/D1, D2, or P3[\s\S]*does not create D3 holdout evidence/iu, "must preserve the controlled-development boundary"],
      [/D3[\s\S]*no tuning on D3/iu, "must prohibit D3 tuning"],
      [/RQ-101 and RQ-102 are distinct completed governed inputs/iu, "must distinguish the completed RQ-101 and RQ-102 governed inputs"],
      [/RQ-101 is the\s+claim-to-evidence contract implemented by `claim-evidence\.csv` and\s+`validate-claim-evidence\.mjs`/iu, "must bind RQ-101 to its ledger and validator"],
      [/RQ-102 is the research-question traceability\s+contract implemented by `RQ-TRACEABILITY\.md`, `rq-traceability\.csv`, and\s+`validate-rq-traceability\.mjs`/iu, "must bind RQ-102 to its traceability artifacts"],
      [/atomic\s+co-freeze of the exact STAT-101 and EXP-103 versions[\s\S]*proposal pending Hiếu's explicit human approval/iu, "must keep atomic co-freeze a candidate pending human approval"],
      [/AI-EVIDENCE-POLICY\.md/iu, "must bind the AI evidence policy"],
      [/statistical-analysis-plan\.md/iu, "must bind the statistical plan"],
      [/decision-log\.md/iu, "must require a governed decision"],
      [/No D3 repository, case, manifest,\s+label, or reviewer record currently exists/iu, "must not imply that D3 exists"],
      [/Approval must be supplied by the accountable humans/iu, "must preserve human approval"],
      [/joint success\s+rule[\s\S]*architecture-drift benefit criterion[\s\S]*productivity non-inferiority criterion[\s\S]*non-inferiority margin[\s\S]*unresolved/iu, "must keep the V-RQ4 joint criterion and margin unresolved"],
      [/`--official-run` is permanently a negative proposal guard/iu, "must make the proposal-only official-run guard permanent"],
      [/Proposal official-run guard \| PERMANENTLY BLOCKED — never authorizes a run/iu, "must expose the permanent proposal-only guard in metadata"],
    ],
  },
  {
    task: "EXP-102",
    file: "dataset-governance.md",
    versionField: "Document version",
    version: "0.1.0-proposed",
    hashField: "Governance SHA-256",
    dependencyField: "Dependency",
    dependency: "EXP-101",
    owner: "Hiếu",
    headings: [
      "Canonical dataset roles",
      "D3 stewardship and independence",
      "Contamination firewall",
      "Development and holdout manifests",
      "External baseline and common-capability subset",
      "Paper and result language gate",
      "Correction, release, and reuse",
      "Approval gate",
      "Version history",
    ],
    requirements: [
      [/\| D1 \| `controlled-development`/u, "must classify D1 as controlled-development"],
      [/\| D2 \| `controlled-development`/u, "must classify D2 as controlled-development"],
      [/\| P3 \| `controlled-development` plus `software-verification`/u, "must classify P3 correctly"],
      [/\| D3 \| `independent-holdout` only after freeze and execution/u, "must keep D3 conditional and independent"],
      [/D3 custody support \| Thành viên 3 \(TV3\) — proposed, pending acceptance/iu, "must keep TV3 D3 custody support pending acceptance"],
      [/changing source scope, truth, mapping, rule configuration, prompt, model,[\s\S]*because a D3 output is inconvenient/iu, "must prohibit outcome-guided D3 tuning"],
      [/No pooled number may combine development\s+and holdout units/iu, "must separate paper denominators"],
      [/D3 state \| NOT CREATED \/ NOT SELECTED \/ NOT FROZEN/iu, "must state that D3 does not yet exist"],
    ],
  },
  {
    task: "ETH-101",
    file: "ethics-privacy.md",
    versionField: "Protocol version",
    version: "0.1.0-proposed",
    hashField: "Protocol SHA-256",
    dependencyField: "Dependency",
    dependency: "RQ-102",
    owner: "Hiếu",
    headings: [
      "Governing principles and default deny",
      "Data classification and allowed provider data",
      "Provider assessment and preflight",
      "Secret, PII, prompt, and log handling",
      "Repository and dataset licensing",
      "Human participant gate",
      "Risk controls for the A--B--C--D study",
      "Incident response and stop switch",
      "Publication release gate",
      "Approval gate",
      "Version history",
    ],
    requirements: [
      [/Provider authorization \| NONE/iu, "must state that no provider is authorized"],
      [/Participant consent \| NOT OBTAINED/iu, "must state that consent is absent"],
      [/Until a provider-specific record is approved, external-provider egress is\s+denied/iu, "must default-deny provider egress"],
      [/redaction occurs before serialization/iu, "must redact before provider serialization"],
      [/Public accessibility alone is\s+not a license/iu, "must require a real license basis"],
      [/No recruitment, enrolment, pilot, observation, interview, survey, recording or\s+human A-condition run may begin/iu, "must block participant activity"],
      [/Participants may pause or withdraw without penalty/iu, "must preserve withdrawal"],
      [/Every public artifact must pass a release manifest/iu, "must gate safe publication"],
      [/Provider\/data support \| Thành viên 2 \(TV2\) — proposed, pending acceptance/iu, "must keep TV2 support pending acceptance"],
    ],
  },
  {
    task: "DATA-101",
    file: "data-management-plan.md",
    versionField: "Plan version",
    version: "0.1.0-proposed",
    hashField: "Plan SHA-256",
    dependencyField: "Dependency",
    dependency: "RQ-102",
    owner: "Hiếu",
    headings: [
      "Storage zones and immutable flow",
      "Identifier and file naming contract",
      "Schema and catalog contract",
      "Checksum and provenance chain",
      "Retention and deletion",
      "Backup, recovery, and integrity",
      "Access control and audit",
      "Anonymization and participant linkage",
      "Publication and sharing",
      "Corrections and version history",
      "Approval gate",
      "Version history",
    ],
    requirements: [
      [/source capture → raw → validated → normalized → analysis tables → figures\/report → publication package/u, "must define the immutable processing flow"],
      [/Every structured artifact declares a semantic schema version/iu, "must version schemas"],
      [/Each result must trace backward without a missing edge/iu, "must require end-to-end provenance"],
      [/SHA-256 is computed over exact stored bytes/iu, "must define checksum semantics"],
      [/Retention schedule \| UNRESOLVED — human approval required before freeze/iu, "must not invent retention approval"],
      [/Run and retain a restore test/iu, "must verify backup recovery"],
      [/Pseudonymization is not anonymization/iu, "must distinguish pseudonymization"],
      [/Public release \| NOT AUTHORIZED/iu, "must keep public release blocked"],
      [/Corrections are append-only/iu, "must preserve correction history"],
      [/D3 data-custody support \| Thành viên 3 \(TV3\) — proposed, pending acceptance/iu, "must keep TV3 data support pending acceptance"],
    ],
  },
  {
    task: "EXP-103",
    file: "measurement-study-protocol.md",
    versionField: "Protocol version",
    version: "0.1.0-proposed",
    hashField: "Protocol SHA-256",
    dependencyField: "Dependencies",
    dependency: "EXP-101; RQ-102; STAT-101",
    owner: "Hiếu",
    headings: [
      "Study objective and unit",
      "Treatment conditions",
      "Feature-task sequence and baselines",
      "Eligibility and configuration",
      "Assignment, randomization, and counterbalancing",
      "Sample size, precision, and stopping rule",
      "Execution procedure",
      "Capture schema",
      "Outcomes and analysis populations",
      "V-RQ4 joint decision criterion",
      "Blinding, review, and contamination checks",
      "Human and provider safety gates",
      "Freeze and change control",
      "Version history",
    ],
    requirements: [
      [/\| A — Human \|/u, "must define condition A"],
      [/\| B — AI \|/u, "must define condition B"],
      [/\| C — AI\+Context \|/u, "must define condition C"],
      [/\| D — AI\+ArchSync \|/u, "must define condition D"],
      [/Every condition starts from a fresh byte-identical baseline/iu, "must use identical baselines"],
      [/all conditions receive the same tasks in the same canonical\s+sequence/iu, "must preserve the same task order"],
      [/balanced Latin or\s+Williams design/iu, "must propose deterministic counterbalancing"],
      [/No sample size is asserted by this proposal/iu, "must not fabricate sample size"],
      [/The current proposal contains no seed or assignment list/iu, "must not imply randomization occurred"],
      [/No A run starts without a real ethics\/institutional determination/iu, "must block human runs"],
      [/No B\/C\/D run starts without provider approval/iu, "must block provider runs"],
      [/V-RQ1` and `V-RQ4` remain `planned-no-evidence/iu, "must preserve RQ evidence status"],
      [/Execution support \| Thành viên 2 \(TV2\) and Thành viên 3 \(TV3\) — proposed, pending acceptance/iu, "must keep TV2/TV3 execution support pending acceptance"],
      [/drift-benefit criterion[\s\S]*productivity non-inferiority criterion[\s\S]*non-inferiority margin[\s\S]*unresolved and pending human approval/iu, "must keep the V-RQ4 joint criterion and margin unresolved"],
      [/No numeric margin is\s+created by this proposal/iu, "must not invent a non-inferiority margin"],
      [/atomic STAT-101\/EXP-103 co-freeze[\s\S]*candidate remains pending Hiếu's human approval/iu, "must keep atomic co-freeze a candidate pending human approval"],
    ],
  },
];

export const MANIFEST_FILE = "pre-experiment-proposal-manifest.json";

export const GOVERNED_INPUT_SPECS = [
  {
    task: "RQ-101",
    artifacts: ["claim-evidence.csv", "validate-claim-evidence.mjs"],
  },
  {
    task: "RQ-102",
    artifacts: [
      "RQ-TRACEABILITY.md",
      "rq-traceability.csv",
      "validate-rq-traceability.mjs",
    ],
  },
];

export const UNRESOLVED_HUMAN_GATES = [
  "STAT-101/EXP-103 atomic co-freeze decision",
  "protocol and governance approvals",
  "ethics/institutional determination and participant consent",
  "provider and data-flow authorization",
  "retention and publication decisions",
  "task, sample-size, assignment, tool, and environment freeze",
  "V-RQ4 joint drift-benefit and productivity non-inferiority criterion and margin",
];

const PROPOSAL_MANIFEST_KEYS = [
  "approvals",
  "documents",
  "freeze_manifest",
  "governed_inputs",
  "official_runs_authorized",
  "results",
  "schema_version",
  "status",
  "unresolved_human_gates",
];
const DOCUMENT_MANIFEST_KEYS = ["path", "sha256", "status", "task_id", "version"];
const GOVERNED_INPUT_KEYS = ["artifacts", "status", "task_id"];
const GOVERNED_ARTIFACT_KEYS = ["path", "sha256"];
const GOVERNED_INPUT_REQUIREMENTS = new Map([
  ["claim-evidence.csv", [/^claim_id,rq,phase,claim,denominator_or_scope,status,evidence_artifact,verification,owner$/mu, "RQ-101 claim ledger schema is missing"]],
  ["validate-claim-evidence.mjs", [/export const GOVERNED_TASK_ID = "RQ-101";/u, "claim-evidence validator is not bound to RQ-101"]],
  ["RQ-TRACEABILITY.md", [/^\| Task \| RQ-102 \|$/mu, "RQ traceability narrative is not bound to RQ-102"]],
  ["rq-traceability.csv", [/^rq_id,family,research_question,disposition,phase,/u, "RQ-102 traceability matrix schema is missing"]],
  ["validate-rq-traceability.mjs", [/VALID RQ TRACEABILITY/u, "RQ-102 traceability validator identity is missing"]],
]);
const SHA256 = /^[0-9a-f]{64}$/u;

function exactKeys(value, expected) {
  return value && typeof value === "object" && !Array.isArray(value)
    && JSON.stringify(Object.keys(value).sort()) === JSON.stringify([...expected].sort());
}

function metadataRows(text, field) {
  const escaped = field.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const normalizedField = field.normalize("NFKC").trim().toLowerCase();
  const rows = [];
  for (const line of text.split(/\r?\n/u)) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|")) continue;
    const cells = trimmed
      .split("|")
      .slice(1, trimmed.endsWith("|") ? -1 : undefined)
      .map((cell) => cell.trim());
    if (cells[0]?.normalize("NFKC").toLowerCase() !== normalizedField) continue;
    rows.push({
      value: cells[1] ?? "",
      canonical: cells.length === 2 && new RegExp(`^\\| ${escaped} \\| .+ \\|$`, "u").test(trimmed),
    });
  }
  return rows;
}

function requireMetadata(issues, file, text, field, expected) {
  const rows = metadataRows(text, field);
  if (rows.length !== 1) {
    issues.push(`${file}: metadata '${field}' must occur exactly once`);
    return;
  }
  if (!rows[0].canonical) issues.push(`${file}: metadata '${field}' must use canonical two-cell syntax`);
  if (rows[0].value !== expected) issues.push(`${file}: metadata '${field}' must be '${expected}'`);
}

export function sha256(bytesOrText) {
  if (!(bytesOrText instanceof Uint8Array)) {
    throw new TypeError("SHA-256 input must be a raw byte array");
  }
  return createHash("sha256").update(bytesOrText).digest("hex");
}

export function decodeUtf8(bytes, file = "document") {
  if (!(bytes instanceof Uint8Array)) throw new TypeError(`${file}: raw bytes are required`);
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new Error(`${file}: invalid UTF-8 byte sequence`);
  }
}

export function validateProtocolDocument(text, specification) {
  const issues = [];
  const file = specification.file;
  if (typeof text !== "string" || text.length === 0) return [`${file}: document text is required`];

  requireMetadata(issues, file, text, "Task", specification.task);
  requireMetadata(issues, file, text, specification.versionField, specification.version);
  requireMetadata(issues, file, text, "Status", PROPOSAL_STATUS);
  requireMetadata(issues, file, text, specification.dependencyField, specification.dependency);
  requireMetadata(issues, file, text, "Owner", specification.owner);
  requireMetadata(issues, file, text, "Proposal manifest", `\`${MANIFEST_FILE}\``);
  requireMetadata(
    issues,
    file,
    text,
    specification.hashField,
    "NOT SET — proposal hash is not a freeze hash",
  );

  for (const heading of specification.headings) {
    const matches = text.match(new RegExp(`^## ${heading.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}$`, "gmu")) ?? [];
    if (matches.length !== 1) issues.push(`${file}: section '${heading}' must occur exactly once`);
  }
  for (const [pattern, message] of specification.requirements) {
    if (!pattern.test(text)) issues.push(`${file}: ${message}`);
  }

  if (/^\| Status \| (?:Frozen|Approved|Complete)/imu.test(text)) {
    issues.push(`${file}: must not claim a frozen, approved, or complete status`);
  }
  if (/^\| (?:Protocol|Governance|Plan) SHA-256 \| [0-9a-f]{64} \|$/imu.test(text)) {
    issues.push(`${file}: embedded proposal metadata must not claim a freeze hash`);
  }
  return issues;
}

export function validateProposalManifest(
  manifest,
  documents,
  documentBytes,
  governedInputBytes,
) {
  const issues = [];
  if (!exactKeys(manifest, PROPOSAL_MANIFEST_KEYS)) {
    return ["pre-experiment-proposal-manifest.json: top-level fields must match schema 0.1.0 exactly"];
  }
  if (manifest.schema_version !== "0.1.0") issues.push("pre-experiment-proposal-manifest.json: schema_version must be 0.1.0");
  if (manifest.status !== "proposed-not-authorized") issues.push("pre-experiment-proposal-manifest.json: status must be proposed-not-authorized");
  if (manifest.official_runs_authorized !== false) issues.push("pre-experiment-proposal-manifest.json: official_runs_authorized must be false");
  if (!Array.isArray(manifest.approvals) || manifest.approvals.length !== 0) issues.push("pre-experiment-proposal-manifest.json: approvals must remain empty");
  if (manifest.freeze_manifest !== null) issues.push("pre-experiment-proposal-manifest.json: freeze_manifest must remain null");
  if (!Array.isArray(manifest.results) || manifest.results.length !== 0) issues.push("pre-experiment-proposal-manifest.json: results must remain empty");
  if (JSON.stringify(manifest.unresolved_human_gates) !== JSON.stringify(UNRESOLVED_HUMAN_GATES)) {
    issues.push("pre-experiment-proposal-manifest.json: unresolved human gates must remain complete and ordered");
  }

  if (!Array.isArray(manifest.documents) || manifest.documents.length !== DOCUMENT_SPECS.length) {
    issues.push(`pre-experiment-proposal-manifest.json: documents must contain ${DOCUMENT_SPECS.length} entries`);
    return issues;
  }

  const seenTasks = new Set();
  const seenPaths = new Set();
  manifest.documents.forEach((entry, index) => {
    const expected = DOCUMENT_SPECS[index];
    if (!exactKeys(entry, DOCUMENT_MANIFEST_KEYS)) {
      issues.push(`pre-experiment-proposal-manifest.json: document entry ${index + 1} fields are invalid`);
      return;
    }
    if (entry.task_id !== expected.task) issues.push(`pre-experiment-proposal-manifest.json: entry ${index + 1} task_id must be ${expected.task}`);
    if (entry.path !== `research/${expected.file}`) issues.push(`pre-experiment-proposal-manifest.json: ${expected.task} path must be research/${expected.file}`);
    if (entry.version !== expected.version) issues.push(`pre-experiment-proposal-manifest.json: ${expected.task} version must be ${expected.version}`);
    if (entry.status !== "proposed") issues.push(`pre-experiment-proposal-manifest.json: ${expected.task} status must be proposed`);
    if (!SHA256.test(entry.sha256)) issues.push(`pre-experiment-proposal-manifest.json: ${expected.task} sha256 is invalid`);
    const text = documents?.[expected.file];
    const bytes = documentBytes?.[expected.file];
    if (typeof text !== "string") issues.push(`pre-experiment-proposal-manifest.json: ${expected.file} text is unavailable`);
    if (!(bytes instanceof Uint8Array)) {
      issues.push(`pre-experiment-proposal-manifest.json: ${expected.file} raw bytes are unavailable`);
    } else {
      try {
        const decoded = decodeUtf8(bytes, expected.file);
        if (decoded !== text) issues.push(`pre-experiment-proposal-manifest.json: ${expected.file} text does not match its raw bytes`);
        if (entry.sha256 !== sha256(bytes)) issues.push(`pre-experiment-proposal-manifest.json: ${expected.task} sha256 does not match exact raw file bytes`);
      } catch (cause) {
        issues.push(`pre-experiment-proposal-manifest.json: ${cause.message}`);
      }
    }
    if (seenTasks.has(entry.task_id)) issues.push(`pre-experiment-proposal-manifest.json: duplicate task_id ${entry.task_id}`);
    if (seenPaths.has(entry.path)) issues.push(`pre-experiment-proposal-manifest.json: duplicate path ${entry.path}`);
    seenTasks.add(entry.task_id);
    seenPaths.add(entry.path);
  });

  if (!Array.isArray(manifest.governed_inputs)
      || manifest.governed_inputs.length !== GOVERNED_INPUT_SPECS.length) {
    issues.push(`pre-experiment-proposal-manifest.json: governed_inputs must contain ${GOVERNED_INPUT_SPECS.length} entries`);
    return issues;
  }
  manifest.governed_inputs.forEach((entry, inputIndex) => {
    const expected = GOVERNED_INPUT_SPECS[inputIndex];
    if (!exactKeys(entry, GOVERNED_INPUT_KEYS)) {
      issues.push(`pre-experiment-proposal-manifest.json: governed input ${inputIndex + 1} fields are invalid`);
      return;
    }
    if (entry.task_id !== expected.task) issues.push(`pre-experiment-proposal-manifest.json: governed input ${inputIndex + 1} must be ${expected.task}`);
    if (entry.status !== "completed-governed-input") issues.push(`pre-experiment-proposal-manifest.json: ${expected.task} must be completed-governed-input`);
    if (!Array.isArray(entry.artifacts) || entry.artifacts.length !== expected.artifacts.length) {
      issues.push(`pre-experiment-proposal-manifest.json: ${expected.task} artifact list is incomplete`);
      return;
    }
    entry.artifacts.forEach((artifact, artifactIndex) => {
      const expectedFile = expected.artifacts[artifactIndex];
      if (!exactKeys(artifact, GOVERNED_ARTIFACT_KEYS)) {
        issues.push(`pre-experiment-proposal-manifest.json: ${expected.task} artifact ${artifactIndex + 1} fields are invalid`);
        return;
      }
      if (artifact.path !== `research/${expectedFile}`) issues.push(`pre-experiment-proposal-manifest.json: ${expected.task} artifact ${artifactIndex + 1} path must be research/${expectedFile}`);
      if (!SHA256.test(artifact.sha256)) issues.push(`pre-experiment-proposal-manifest.json: ${expected.task} ${expectedFile} sha256 is invalid`);
      const bytes = governedInputBytes?.[expectedFile];
      if (!(bytes instanceof Uint8Array)) {
        issues.push(`pre-experiment-proposal-manifest.json: governed input ${expectedFile} raw bytes are unavailable`);
        return;
      }
      try {
        const text = decodeUtf8(bytes, expectedFile);
        const [pattern, message] = GOVERNED_INPUT_REQUIREMENTS.get(expectedFile) ?? [];
        if (pattern && !pattern.test(text)) issues.push(`pre-experiment-proposal-manifest.json: ${message}`);
        if (artifact.sha256 !== sha256(bytes)) issues.push(`pre-experiment-proposal-manifest.json: ${expected.task} ${expectedFile} sha256 does not match exact raw file bytes`);
      } catch (cause) {
        issues.push(`pre-experiment-proposal-manifest.json: ${cause.message}`);
      }
    });
  });
  return issues;
}

export function validateProposalPacket({
  documents,
  documentBytes,
  governedInputBytes,
  manifest,
}) {
  const issues = [];
  for (const specification of DOCUMENT_SPECS) {
    issues.push(...validateProtocolDocument(documents?.[specification.file], specification));
  }
  issues.push(...validateProposalManifest(
    manifest,
    documents,
    documentBytes,
    governedInputBytes,
  ));
  return issues;
}

export function officialRunBlockers(packet) {
  const invalid = validateProposalPacket(packet);
  if (invalid.length > 0) return ["the proposed protocol packet is invalid"];
  return [
    "--official-run is a permanent proposal-only negative guard and can never authorize a study run",
    "a separate future human-reviewed freeze/readiness validator is required",
    "the proposal manifest authorizes zero official runs and contains zero approvals",
    "the STAT-101/EXP-103 atomic co-freeze candidate is pending human approval",
    "the V-RQ4 joint drift-benefit and productivity non-inferiority criterion and margin are unresolved",
    "ethics, consent, provider, retention, publication, sample-size, assignment, tool, and environment gates require the future validator",
  ];
}

export async function loadProposalPacket(repositoryDirectory) {
  const researchDirectory = join(repositoryDirectory, "research");
  const documentEntries = await Promise.all(
    DOCUMENT_SPECS.map(async ({ file }) => {
      const bytes = await readFile(join(researchDirectory, file));
      return [file, bytes, decodeUtf8(bytes, file)];
    }),
  );
  const governedFiles = GOVERNED_INPUT_SPECS.flatMap(({ artifacts }) => artifacts);
  const governedEntries = await Promise.all(
    governedFiles.map(async (file) => {
      const bytes = await readFile(join(researchDirectory, file));
      decodeUtf8(bytes, file);
      return [file, bytes];
    }),
  );
  const manifestBytes = await readFile(join(researchDirectory, MANIFEST_FILE));
  const manifest = JSON.parse(decodeUtf8(manifestBytes, MANIFEST_FILE));
  return {
    documents: Object.fromEntries(documentEntries.map(([file, , text]) => [file, text])),
    documentBytes: Object.fromEntries(documentEntries.map(([file, bytes]) => [file, bytes])),
    governedInputBytes: Object.fromEntries(governedEntries),
    manifest,
  };
}

export async function main({
  repositoryDirectory = join(dirname(fileURLToPath(import.meta.url)), ".."),
  args = process.argv.slice(2),
  log = console.log,
  error = console.error,
  setExitCode = (code) => { process.exitCode = code; },
} = {}) {
  if (args.some((argument) => argument !== "--official-run")) {
    error("Usage: node research/validate-pre-experiment-protocols.mjs [--official-run]");
    setExitCode(2);
    return { issues: ["unknown argument"] };
  }

  let packet;
  try {
    packet = await loadProposalPacket(repositoryDirectory);
  } catch (cause) {
    error(`INVALID PRE-EXPERIMENT PROPOSAL PACKET: ${cause.message}`);
    setExitCode(1);
    return { issues: [cause.message] };
  }

  const issues = validateProposalPacket(packet);
  if (issues.length > 0) {
    error("INVALID PRE-EXPERIMENT PROPOSAL PACKET");
    issues.forEach((issue) => error(`- ${issue}`));
    setExitCode(1);
    return { issues };
  }

  if (args.includes("--official-run")) {
    const blockers = officialRunBlockers(packet);
    error("OFFICIAL STUDY RUN BLOCKED BY PERMANENT PROPOSAL GUARD");
    blockers.forEach((blocker) => error(`- ${blocker}`));
    setExitCode(2);
    return { issues: [], blockers };
  }

  log(
    `VALID PRE-EXPERIMENT PROPOSAL PACKET (${DOCUMENT_SPECS.length} exact documents and ${GOVERNED_INPUT_SPECS.length} completed governed inputs hash-bound; 0 approvals; official runs blocked)`,
  );
  return { issues: [], blockers: officialRunBlockers(packet) };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
