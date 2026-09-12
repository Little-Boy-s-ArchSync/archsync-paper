import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

// Fixed test inputs, never reconstructed by reversing a live freeze transition.
export async function loadSlrCandidateFixture() {
  const root = new URL("./slr-candidate/", import.meta.url);
  const provenance = JSON.parse(await readFile(new URL("provenance.json", root), "utf8"));
  const documents = {};
  for (const entry of provenance.files) {
    const bytes = await readFile(new URL(entry.file, root));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), entry.sha256, `Canonical SLR test fixture changed: ${entry.file}`);
    documents[entry.file] = bytes.toString("utf8");
  }
  return { protocol: documents["literature-protocol.md"], decisions: documents["decision-log.md"] };
}
