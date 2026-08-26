import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { arch, hostname, platform, release } from "node:os";
import { dirname, join, relative } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const publish = process.argv.includes("--publish");
const startedAt = new Date();

function run(command, args) {
  return spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    env: process.env,
    maxBuffer: 64 * 1024 * 1024,
    shell: false,
  });
}

function combinedOutput(result) {
  return `${result.stdout ?? ""}${result.stderr ?? ""}`;
}

function git(args) {
  const result = run("git", args);
  if (result.status !== 0) {
    throw new Error(`git ${args.join(" ")} failed: ${combinedOutput(result).trim()}`);
  }
  return result.stdout.trim();
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function commandAvailable(command, args = ["--version"]) {
  const result = run(command, args);
  return result.status === 0;
}

const targetCommit = git(["rev-parse", "HEAD"]);
const branch = git(["branch", "--show-current"]);
const remote = git(["remote", "get-url", "origin"]);
const trackedStatus = git(["status", "--porcelain", "--untracked-files=no"]);
if (trackedStatus) {
  console.error("LOCAL PAPER VERIFY REFUSED: tracked worktree changes are present.");
  console.error(trackedStatus);
  process.exit(2);
}

const safeTimestamp = startedAt.toISOString().replaceAll(":", "-");
const bundleRoot = publish
  ? join(root, "research", "evidence", "local-verification", targetCommit)
  : join(root, "artifacts", "local-verification", `${targetCommit.slice(0, 12)}-${safeTimestamp}`);
const logRoot = join(bundleRoot, "logs");
await mkdir(logRoot, { recursive: true });

const coverageArguments = [
  "--experimental-test-coverage",
  "--test-coverage-include=research/validate-claim-evidence.mjs",
  "--test-coverage-include=research/validate-literature-protocol.mjs",
  "--test-coverage-include=research/freeze-literature-protocol.mjs",
  "--test-coverage-include=research/verify-slr-review-provenance.mjs",
  "--test-coverage-include=research/verify-slr-signed-attestation.mjs",
  "--test-coverage-include=research/create-slr-signed-review.mjs",
  "--test-coverage-include=research/verify-slr-sentinel-evidence.mjs",
  "--test-coverage-include=research/build-slr-sentinel-ledger.mjs",
  "--test-coverage-include=research/validate-search-queries.mjs",
  "--test-coverage-include=research/validate-screening-criteria.mjs",
  "--test-coverage-include=research/validate-literature-matrix.mjs",
  "--test-coverage-include=research/verify-slr-screening-calibration.mjs",
  "--test-coverage-include=research/build-slr-screening-calibration.mjs",
  "--test-coverage-include=research/statistical-analysis.mjs",
  "--test-coverage-include=research/validate-evaluation-report-scaffold.mjs",
  "--test-coverage-lines=95",
  "--test-coverage-branches=88",
  "--test-coverage-functions=90",
  "--test",
  "research/validate-claim-evidence.test.mjs",
  "research/validate-literature-protocol.test.mjs",
  "research/freeze-literature-protocol.test.mjs",
  "research/verify-slr-review-provenance.test.mjs",
  "research/verify-slr-signed-attestation.test.mjs",
  "research/create-slr-signed-review.test.mjs",
  "research/verify-slr-sentinel-evidence.test.mjs",
  "research/build-slr-sentinel-ledger.test.mjs",
  "research/validate-search-queries.test.mjs",
  "research/validate-screening-criteria.test.mjs",
  "research/validate-literature-matrix.test.mjs",
  "research/validate-reference-quality-policy.test.mjs",
  "research/verify-slr-screening-calibration.test.mjs",
  "research/build-slr-screening-calibration.test.mjs",
  "research/statistical-analysis.test.mjs",
  "research/validate-evaluation-report-scaffold.test.mjs",
];

const hostTexAvailable =
  commandAvailable("latexmk", ["-version"]) &&
  commandAvailable("pdftotext", ["-v"]);
const containerImage = "archsync-paper-local-verification:1.0.0";
const dockerPrefix = [
  "run",
  "--rm",
  "--volume",
  `${root}:/workspace`,
  "--workdir",
  "/workspace",
  containerImage,
];

const commands = [
  { id: "source-metadata", command: process.execPath, args: ["scripts/verify-paper-source.mjs"] },
  { id: "research-baseline", command: process.execPath, args: ["research/validate-baseline.mjs"] },
  { id: "rq-traceability", command: process.execPath, args: ["research/validate-rq-traceability.mjs"] },
  { id: "research-contract-tests", command: process.execPath, args: coverageArguments },
  { id: "claim-evidence", command: process.execPath, args: ["research/validate-claim-evidence.mjs"] },
  { id: "literature-protocol", command: process.execPath, args: ["research/validate-literature-protocol.mjs"] },
  { id: "search-queries", command: process.execPath, args: ["research/validate-search-queries.mjs"] },
  { id: "screening-criteria", command: process.execPath, args: ["research/validate-screening-criteria.mjs"] },
  { id: "literature-matrix", command: process.execPath, args: ["research/validate-literature-matrix.mjs"] },
  { id: "reference-quality", command: process.execPath, args: ["research/validate-reference-quality-policy.mjs"] },
  { id: "evaluation-scaffold", command: process.execPath, args: ["research/verify-evaluation-report-scaffold.mjs"] },
];

const screeningCalibration = "research/literature-screening-calibration.json";
const calibrationTracked = run("git", ["ls-files", "--error-unmatch", screeningCalibration]).status === 0;
const reviewEvidenceTracked = run("git", [
  "ls-files",
  "research/slr-review-record.md",
  "research/evidence/slr-review/independent-slr-reviewer-attestation.json",
  "research/evidence/slr-review/independent-slr-reviewer-attestation.sig",
]).stdout.trim().length > 0;
if (calibrationTracked) {
  commands.push({
    id: "screening-calibration",
    command: process.execPath,
    args: ["research/build-slr-screening-calibration.mjs", "--check"],
  });
} else if (reviewEvidenceTracked) {
  console.error("LOCAL PAPER VERIFY REFUSED: SLR review evidence requires the governed screening calibration summary.");
  process.exit(2);
}

if (!hostTexAvailable) {
  commands.push({
    id: "build-tex-container",
    command: "docker",
    args: ["build", "--file", "scripts/local-verification.Dockerfile", "--tag", containerImage, "."],
  });
}

for (const [id, file] of [
  ["compile-named", "main.tex"],
  ["compile-anonymous", "main-anonymous.tex"],
]) {
  const latexArguments = [
    "latexmk",
    "-pdf",
    "-file-line-error",
    "-halt-on-error",
    "-interaction=nonstopmode",
    file,
  ];
  commands.push(
    hostTexAvailable
      ? { id, command: latexArguments[0], args: latexArguments.slice(1) }
      : { id, command: "docker", args: [...dockerPrefix, ...latexArguments] },
  );
}

commands.push(
  hostTexAvailable
    ? { id: "anonymous-redaction", command: process.execPath, args: ["scripts/verify-pdf-redaction.mjs"] }
    : {
        id: "anonymous-redaction",
        command: "docker",
        args: [...dockerPrefix, "node", "scripts/verify-pdf-redaction.mjs"],
      },
  { id: "generated-diff", command: "git", args: ["diff", "--exit-code"] },
);

const records = [];
let failed = false;
for (const specification of commands) {
  const commandStartedAt = new Date();
  console.log(`\n==> ${specification.id}: ${specification.command} ${specification.args.join(" ")}`);
  const result = run(specification.command, specification.args);
  const rawLog = combinedOutput(result);
  process.stdout.write(rawLog);
  const logPath = join(logRoot, `${specification.id}.log`);
  await writeFile(logPath, rawLog, "utf8");
  records.push({
    id: specification.id,
    command: [specification.command, ...specification.args].join(" "),
    cwd: ".",
    started_at_utc: commandStartedAt.toISOString(),
    finished_at_utc: new Date().toISOString(),
    duration_ms: Date.now() - commandStartedAt.getTime(),
    exit_code: result.status,
    status: result.status === 0 ? "PASS" : "FAIL",
    log: relative(bundleRoot, logPath).replaceAll("\\", "/"),
    log_sha256: sha256(rawLog),
  });
  if (result.status !== 0) {
    failed = true;
    break;
  }
}

const gitVersion = run("git", ["--version"]);
const pdfs = [];
for (const name of ["main.pdf", "main-anonymous.pdf"]) {
  try {
    const bytes = await readFile(join(root, name));
    pdfs.push({ file: name, bytes: bytes.byteLength, sha256: sha256(bytes) });
  } catch {
    pdfs.push({ file: name, missing: true });
  }
}

const finishedAt = new Date();
const summary = {
  schema_version: "1.0.0",
  verification_provider: "local-clean-worktree",
  status: failed ? "FAIL" : "PASS",
  target: { repository: remote, branch, commit: targetCommit },
  environment: {
    os: `${platform()} ${release()}`,
    architecture: arch(),
    node: process.versions.node,
    git: gitVersion.status === 0 ? gitVersion.stdout.trim() : null,
    tex_provider: hostTexAvailable ? "host" : `docker:${containerImage}`,
    hostname_sha256: sha256(hostname()),
  },
  started_at_utc: startedAt.toISOString(),
  finished_at_utc: finishedAt.toISOString(),
  duration_ms: finishedAt.getTime() - startedAt.getTime(),
  github_actions: "not-required-for-this-local-verification",
  commands: records,
  generated_pdfs: pdfs,
};
await writeFile(join(bundleRoot, "summary.json"), `${JSON.stringify(summary, null, 2)}\n`, "utf8");
const readme = `# ArchSync Paper Local Verification\n\n- Status: ${summary.status}\n- Provider: local clean worktree\n- Target commit: \`${targetCommit}\`\n- Branch: \`${branch}\`\n- Started UTC: ${summary.started_at_utc}\n- Finished UTC: ${summary.finished_at_utc}\n- Node.js: ${summary.environment.node}\n- OS: ${summary.environment.os} (${summary.environment.architecture})\n\n| Gate | Status | Exit code | Log SHA-256 |\n| --- | --- | ---: | --- |\n${records.map((record) => `| ${record.id} | ${record.status} | ${record.exit_code ?? "null"} | \`${record.log_sha256}\` |`).join("\n")}\n\nThis bundle proves a real local execution for the target commit. It does not replace independent review, protocol freeze, signed evidence, database output or another task-specific acceptance condition.\n`;
await writeFile(join(bundleRoot, "README.md"), readme, "utf8");

const summaryBytes = await readFile(join(bundleRoot, "summary.json"));
console.log(`\nLOCAL PAPER VERIFICATION ${summary.status}`);
console.log(`Evidence: ${bundleRoot}`);
console.log(`summary.json SHA-256: ${sha256(summaryBytes)}`);
if (failed) process.exitCode = 1;
