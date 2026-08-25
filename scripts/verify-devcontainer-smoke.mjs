import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { validateDevcontainerContractFromDisk } from "./validate-devcontainer.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

async function readJson(relativePath) {
  return JSON.parse(await readFile(join(root, relativePath), "utf8"));
}

async function digest(relativePath) {
  const content = await readFile(join(root, relativePath));
  return createHash("sha256").update(content).digest("hex");
}

await validateDevcontainerContractFromDisk();
const challenge = await readJson(".devcontainer/smoke-challenge.json");
const evidence = await readJson(".devcontainer/smoke-evidence.json");

assert.equal(challenge.schemaVersion, 1);
assert.equal(evidence.schemaVersion, 1);
assert.equal(
  evidence.challengeNonce,
  challenge.nonce,
  "evidence was not created for the current smoke challenge",
);
assert.equal(evidence.challengePreparedAt, challenge.preparedAt);
assert.ok(
  Date.parse(evidence.completedAt) >= Date.parse(challenge.preparedAt),
  "evidence predates the current smoke challenge",
);
assert.equal(evidence.runtime?.node, "v22.16.0");
assert.equal(process.version, evidence.runtime.node);

for (const item of [...evidence.contract, ...evidence.artifacts]) {
  assert.match(item.sha256, /^[0-9a-f]{64}$/);
  assert.equal(await digest(item.path), item.sha256, `${item.path} changed after smoke`);
  assert.equal((await stat(join(root, item.path))).size, item.bytes);
}
assert.deepEqual(
  evidence.artifacts.map((item) => item.path),
  ["main.pdf", "main-anonymous.pdf"],
);
assert.ok(evidence.artifacts.every((item) => item.bytes > 50_000));

const pdfVerification = spawnSync(
  process.execPath,
  ["scripts/verify-pdf-variants.mjs"],
  { cwd: root, encoding: "utf8" },
);
assert.equal(pdfVerification.status, 0, pdfVerification.stderr);
process.stdout.write(pdfVerification.stdout);

console.log(
  `VALID DEVCONTAINER SMOKE (${evidence.challengeNonce}; ${evidence.runtime.node}; ${evidence.artifacts.map((item) => `${item.path}=${item.sha256}`).join(", ")})`,
);
