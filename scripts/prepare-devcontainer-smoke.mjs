import { randomUUID } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const challengePath = join(root, ".devcontainer/smoke-challenge.json");
const evidencePath = join(root, ".devcontainer/smoke-evidence.json");

export async function prepareDevcontainerSmoke() {
  await mkdir(dirname(challengePath), { recursive: true });
  await rm(evidencePath, { force: true });
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

const challenge = await prepareDevcontainerSmoke();
console.log(`PREPARED DEVCONTAINER SMOKE (${challenge.nonce})`);
