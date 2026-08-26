import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { readFile, rename, stat, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { validateDevcontainerContractFromDisk } from "./validate-devcontainer.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const challengePath = join(root, ".devcontainer/smoke-challenge.json");
const evidencePath = join(root, ".devcontainer/smoke-evidence.json");
const temporaryEvidencePath = `${evidencePath}.tmp`;

const contractFiles = [
  ".devcontainer/Dockerfile",
  ".devcontainer/devcontainer.json",
  ".devcontainer/devcontainer-lock.json",
  ".github/workflows/build-paper.yml",
  "package.json",
  "package-lock.json",
  "scripts/prepare-devcontainer-smoke.mjs",
  "scripts/run-devcontainer-smoke.mjs",
  "scripts/validate-devcontainer.mjs",
  "scripts/validate-devcontainer.test.mjs",
  "scripts/validate-paper-structure.mjs",
  "scripts/verify-devcontainer-smoke.mjs",
  "scripts/verify-pdf-variants.mjs",
  "main.tex",
  "main-anonymous.tex",
  "references.bib",
  "acmart.cls",
  "ACM-Reference-Format.bst",
  "sections/abstract.tex",
  "sections/introduction.tex",
  "sections/related-work.tex",
  "sections/approach.tex",
  "sections/architecture.tex",
  "sections/implementation.tex",
  "sections/evaluation.tex",
  "sections/results.tex",
  "sections/discussion.tex",
  "sections/threats-to-validity.tex",
  "sections/conclusion.tex",
  "sections/author-information.tex",
];

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    env: { ...process.env, LC_ALL: "C.UTF-8", TZ: "UTC" },
    stdio: "inherit",
  });
  assert.equal(
    result.status,
    0,
    `${command} ${args.join(" ")} failed with status ${result.status}`,
  );
}

function version(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, `${command} ${args.join(" ")} failed`);
  return `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
}

async function digest(path) {
  const content = await readFile(path);
  return createHash("sha256").update(content).digest("hex");
}

async function fileEvidence(relativePath) {
  const path = join(root, relativePath);
  const metadata = await stat(path);
  return {
    path: relativePath,
    bytes: metadata.size,
    sha256: await digest(path),
  };
}

async function loadChallenge() {
  try {
    return JSON.parse(await readFile(challengePath, "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    const challenge = {
      schemaVersion: 1,
      nonce: randomUUID(),
      preparedAt: new Date().toISOString(),
    };
    await writeFile(challengePath, `${JSON.stringify(challenge, null, 2)}\n`, {
      mode: 0o600,
    });
    return challenge;
  }
}

await validateDevcontainerContractFromDisk();
const challenge = await loadChallenge();
assert.equal(challenge.schemaVersion, 1);
assert.match(challenge.nonce, /^[0-9a-f-]{36}$/);
assert.ok(Number.isFinite(Date.parse(challenge.preparedAt)));

run(process.execPath, ["scripts/validate-paper-structure.mjs"]);
run("latexmk", [
  "-pdf",
  "-file-line-error",
  "-halt-on-error",
  "-interaction=nonstopmode",
  "main.tex",
]);
run("latexmk", [
  "-pdf",
  "-file-line-error",
  "-halt-on-error",
  "-interaction=nonstopmode",
  "main-anonymous.tex",
]);
run(process.execPath, ["scripts/verify-pdf-variants.mjs"]);

const artifacts = await Promise.all([
  fileEvidence("main.pdf"),
  fileEvidence("main-anonymous.pdf"),
]);
const contract = await Promise.all(contractFiles.map(fileEvidence));
const evidence = {
  schemaVersion: 1,
  challengeNonce: challenge.nonce,
  challengePreparedAt: challenge.preparedAt,
  completedAt: new Date().toISOString(),
  runtime: {
    node: process.version,
    latexmk: version("latexmk", ["-version"]).split(/\r?\n/, 1)[0],
    pdftotext: version("pdftotext", ["-v"]),
  },
  contract,
  artifacts,
};
assert.equal(evidence.runtime.node, "v22.16.0");
assert.ok(artifacts.every((artifact) => artifact.bytes > 50_000));

await writeFile(temporaryEvidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
await rename(temporaryEvidencePath, evidencePath);
console.log(
  `COMPLETED DEVCONTAINER POST-CREATE (${challenge.nonce}; ${artifacts.map((artifact) => `${relative(root, join(root, artifact.path))}=${artifact.sha256}`).join(", ")})`,
);
