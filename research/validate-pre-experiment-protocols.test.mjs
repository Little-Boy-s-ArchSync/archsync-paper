import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  DOCUMENT_SPECS,
  GOVERNED_INPUT_SPECS,
  MANIFEST_FILE,
  PROPOSAL_STATUS,
  UNRESOLVED_HUMAN_GATES,
  decodeUtf8,
  loadProposalPacket,
  officialRunBlockers,
  sha256,
  validateProposalManifest,
  validateProposalPacket,
  validateProtocolDocument,
} from "./validate-pre-experiment-protocols.mjs";

async function loadPacket() {
  const documentEntries = await Promise.all(
    DOCUMENT_SPECS.map(async ({ file }) => {
      const bytes = await readFile(new URL(file, import.meta.url));
      return [file, bytes, decodeUtf8(bytes, file)];
    }),
  );
  const governedEntries = await Promise.all(
    GOVERNED_INPUT_SPECS.flatMap(({ artifacts }) => artifacts).map(async (file) => [
      file,
      await readFile(new URL(file, import.meta.url)),
    ]),
  );
  const manifestBytes = await readFile(new URL(MANIFEST_FILE, import.meta.url));
  return {
    documents: Object.fromEntries(documentEntries.map(([file, , text]) => [file, text])),
    documentBytes: Object.fromEntries(documentEntries.map(([file, bytes]) => [file, bytes])),
    governedInputBytes: Object.fromEntries(governedEntries),
    manifest: JSON.parse(decodeUtf8(manifestBytes, MANIFEST_FILE)),
  };
}

function validateManifest(packet, manifest = packet.manifest) {
  return validateProposalManifest(
    manifest,
    packet.documents,
    packet.documentBytes,
    packet.governedInputBytes,
  );
}

test("accepts five exact hash-bound proposals while keeping official runs blocked", async () => {
  const packet = await loadPacket();
  assert.deepEqual(validateProposalPacket(packet), []);
  assert.deepEqual(officialRunBlockers(packet), [
    "--official-run is a permanent proposal-only negative guard and can never authorize a study run",
    "a separate future human-reviewed freeze/readiness validator is required",
    "the proposal manifest authorizes zero official runs and contains zero approvals",
    "the STAT-101/EXP-103 atomic co-freeze candidate is pending human approval",
    "the V-RQ4 joint drift-benefit and productivity non-inferiority criterion and margin are unresolved",
    "ethics, consent, provider, retention, publication, sample-size, assignment, tool, and environment gates require the future validator",
  ]);
});

test("each protocol enforces canonical task, version, status, dependency, manifest and hash metadata", async () => {
  const { documents } = await loadPacket();
  for (const specification of DOCUMENT_SPECS) {
    const original = documents[specification.file];
    assert.deepEqual(validateProtocolDocument(original, specification), []);
    assert.notDeepEqual(validateProtocolDocument("", specification), []);
    for (const mutation of [
      original.replace(`| Task | ${specification.task} |`, "| Task | WRONG |"),
      original.replace(`| ${specification.versionField} | ${specification.version} |`, `| ${specification.versionField} | 1.0.0 |`),
      original.replace(`| Status | ${PROPOSAL_STATUS} |`, "| Status | Frozen |"),
      original.replace(`| ${specification.dependencyField} | ${specification.dependency} |`, `| ${specification.dependencyField} | NONE |`),
      original.replace("| Owner | Hiếu |", "| Owner | TV3 |"),
      original.replace(`| Proposal manifest | \`${MANIFEST_FILE}\` |`, "| Proposal manifest | missing.json |"),
      original.replace(`| ${specification.hashField} | NOT SET — proposal hash is not a freeze hash |`, `| ${specification.hashField} | ${"a".repeat(64)} |`),
      original.replace("| Task |", "|Task|"),
      `${original}\n| Task | ${specification.task} |\n`,
      original.replace(`## ${specification.headings[0]}`, "## Removed section"),
    ]) assert.notDeepEqual(validateProtocolDocument(mutation, specification), []);
  }
});

test("document-specific safeguards cannot be removed", async () => {
  const { documents } = await loadPacket();
  const mutations = {
    "experiment-protocol.md": [
      ["does not create D3 holdout evidence", "creates D3 evidence"],
      ["RQ-101 and RQ-102 are distinct completed governed inputs", "RQ inputs are interchangeable"],
      ["claim-to-evidence contract implemented by `claim-evidence.csv`", "claim contract is implicit"],
      ["Approval must be supplied by the accountable humans", "Approval is automatic"],
    ],
    "dataset-governance.md": [
      ["`independent-holdout` only after freeze and execution", "`controlled-development`"],
      ["No pooled number may combine development\nand holdout units", "Pooling is permitted"],
      ["NOT CREATED / NOT SELECTED / NOT FROZEN", "READY"],
    ],
    "ethics-privacy.md": [
      ["Provider authorization | NONE", "Provider authorization | IMPLIED"],
      ["Participant consent | NOT OBTAINED", "Participant consent | ASSUMED"],
      ["Redaction occurs before serialization", "Redaction occurs after transmission"],
    ],
    "data-management-plan.md": [
      ["source capture → raw → validated → normalized → analysis tables → figures/report → publication package", "raw → paper"],
      ["Pseudonymization is not anonymization", "Pseudonymization is anonymization"],
      ["Public release | NOT AUTHORIZED", "Public release | AUTHORIZED"],
    ],
    "measurement-study-protocol.md": [
      ["| C — AI+Context |", "| C — AI |"],
      ["fresh byte-identical baseline", "different baseline"],
      ["The current proposal contains no seed or assignment list", "The assignment is complete"],
      ["No B/C/D run starts without provider approval", "B/C/D may run now"],
      ["productivity non-inferiority criterion", "productivity summary"],
      ["No numeric margin is\ncreated by this proposal", "A ten-percent margin is approved"],
    ],
  };
  for (const specification of DOCUMENT_SPECS) {
    for (const [before, after] of mutations[specification.file]) {
      const mutated = documents[specification.file].replace(before, after);
      assert.notEqual(mutated, documents[specification.file], `${before} must exist in ${specification.file}`);
      assert.notDeepEqual(validateProtocolDocument(mutated, specification), []);
    }
  }
});

test("proposal manifest enforces exact no-authorization state and exact document hashes", async () => {
  const { documents, manifest } = await loadPacket();
  const packet = await loadPacket();
  assert.deepEqual(validateManifest(packet), []);
  assert.deepEqual(validateManifest(packet, null), [
    "pre-experiment-proposal-manifest.json: top-level fields must match schema 0.1.0 exactly",
  ]);
  for (const mutation of [
    { ...manifest, schema_version: "1.0.0" },
    { ...manifest, status: "frozen" },
    { ...manifest, official_runs_authorized: true },
    { ...manifest, approvals: ["invented"] },
    { ...manifest, freeze_manifest: "pre-experiment-freeze-manifest.json" },
    { ...manifest, results: [{ invented: true }] },
    { ...manifest, unresolved_human_gates: UNRESOLVED_HUMAN_GATES.slice(1) },
    { ...manifest, extra: true },
    { ...manifest, documents: manifest.documents.slice(1) },
    { ...manifest, documents: manifest.documents.map((row, index) => index === 0 ? { ...row, sha256: "bad" } : row) },
    { ...manifest, documents: manifest.documents.map((row, index) => index === 1 ? { ...row, task_id: "EXP-101" } : row) },
    { ...manifest, documents: manifest.documents.map((row, index) => index === 2 ? { ...row, path: "../escape.md" } : row) },
    { ...manifest, documents: manifest.documents.map((row, index) => index === 3 ? { ...row, status: "approved" } : row) },
    { ...manifest, documents: manifest.documents.map((row, index) => index === 4 ? { ...row, extra: true } : row) },
    { ...manifest, governed_inputs: manifest.governed_inputs.slice(1) },
    { ...manifest, governed_inputs: manifest.governed_inputs.map((row, index) => index === 0 ? { ...row, status: "proposed" } : row) },
    { ...manifest, governed_inputs: manifest.governed_inputs.map((row, index) => index === 1 ? { ...row, task_id: "RQ-101" } : row) },
  ]) assert.notDeepEqual(validateManifest(packet, mutation), []);

  assert.notDeepEqual(
    validateProposalManifest(
      manifest,
      { ...documents, "experiment-protocol.md": `${documents["experiment-protocol.md"]}\n` },
      packet.documentBytes,
      packet.governedInputBytes,
    ),
    [],
  );
  assert.notDeepEqual(
    validateProposalManifest(
      manifest,
      { ...documents, "dataset-governance.md": undefined },
      packet.documentBytes,
      packet.governedInputBytes,
    ),
    [],
  );
});

test("hashes exact raw bytes and rejects malformed UTF-8 before document validation", async () => {
  const packet = await loadPacket();
  const bytes = packet.documentBytes["experiment-protocol.md"];
  assert.equal(sha256(bytes), packet.manifest.documents[0].sha256);
  assert.equal(decodeUtf8(bytes, "experiment-protocol.md"), packet.documents["experiment-protocol.md"]);
  assert.throws(() => decodeUtf8(Buffer.from([0xc3, 0x28]), "bad.md"), /invalid UTF-8/u);
  assert.throws(() => decodeUtf8("text", "bad.md"), /raw bytes are required/u);
  assert.throws(() => sha256(null), /raw byte array/u);
  assert.throws(() => sha256("text"), /raw byte array/u);

  const invalidBytes = {
    ...packet.documentBytes,
    "experiment-protocol.md": Buffer.from([0xc3, 0x28]),
  };
  assert.match(
    validateProposalManifest(
      packet.manifest,
      packet.documents,
      invalidBytes,
      packet.governedInputBytes,
    ).join("\n"),
    /invalid UTF-8/u,
  );
});

test("disk loader fatally rejects malformed UTF-8 before parsing a document", async () => {
  const packet = await loadPacket();
  const root = await mkdtemp(join(tmpdir(), "archsync-proposal-utf8-"));
  const research = join(root, "research");
  await mkdir(research);
  try {
    await Promise.all([
      ...Object.entries(packet.documentBytes).map(([file, bytes]) =>
        writeFile(join(research, file), bytes)),
      ...Object.entries(packet.governedInputBytes).map(([file, bytes]) =>
        writeFile(join(research, file), bytes)),
      writeFile(
        join(research, MANIFEST_FILE),
        await readFile(new URL(MANIFEST_FILE, import.meta.url)),
      ),
    ]);
    await writeFile(join(research, "experiment-protocol.md"), Buffer.from([0xc3, 0x28]));
    await assert.rejects(
      loadProposalPacket(root),
      /experiment-protocol\.md: invalid UTF-8 byte sequence/u,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("governed-input semantics keep RQ-101 and RQ-102 distinct", async () => {
  const packet = await loadPacket();
  const rq101Bytes = Buffer.from(
    decodeUtf8(packet.governedInputBytes["validate-claim-evidence.mjs"])
      .replace('GOVERNED_TASK_ID = "RQ-101"', 'GOVERNED_TASK_ID = "RQ-102"'),
    "utf8",
  );
  const manifest = structuredClone(packet.manifest);
  manifest.governed_inputs[0].artifacts[1].sha256 = sha256(rq101Bytes);
  const issues = validateProposalManifest(
    manifest,
    packet.documents,
    packet.documentBytes,
    { ...packet.governedInputBytes, "validate-claim-evidence.mjs": rq101Bytes },
  );
  assert.match(issues.join("\n"), /not bound to RQ-101/u);

  const rq102Bytes = Buffer.from(
    decodeUtf8(packet.governedInputBytes["RQ-TRACEABILITY.md"])
      .replace("| Task | RQ-102 |", "| Task | RQ-101 |"),
    "utf8",
  );
  const secondManifest = structuredClone(packet.manifest);
  secondManifest.governed_inputs[1].artifacts[0].sha256 = sha256(rq102Bytes);
  assert.match(
    validateProposalManifest(
      secondManifest,
      packet.documents,
      packet.documentBytes,
      { ...packet.governedInputBytes, "RQ-TRACEABILITY.md": rq102Bytes },
    ).join("\n"),
    /not bound to RQ-102/u,
  );
});

test("official-run command fails closed without weakening proposal validation", () => {
  const script = fileURLToPath(new URL("validate-pre-experiment-protocols.mjs", import.meta.url));
  const valid = spawnSync(process.execPath, [script], { encoding: "utf8" });
  assert.equal(valid.status, 0);
  assert.match(valid.stdout, /VALID PRE-EXPERIMENT PROPOSAL PACKET/u);
  assert.match(valid.stdout, /0 approvals; official runs blocked/u);

  const blocked = spawnSync(process.execPath, [script, "--official-run"], { encoding: "utf8" });
  assert.equal(blocked.status, 2);
  assert.match(blocked.stderr, /OFFICIAL STUDY RUN BLOCKED/u);
  assert.match(blocked.stderr, /permanent proposal-only negative guard/u);
  assert.match(blocked.stderr, /separate future human-reviewed freeze\/readiness validator/u);

  const usage = spawnSync(process.execPath, [script, "--freeze"], { encoding: "utf8" });
  assert.equal(usage.status, 2);
  assert.match(usage.stderr, /Usage:/u);
});

test("invalid packet yields a single fail-closed official-run blocker", async () => {
  const packet = await loadPacket();
  packet.documents["experiment-protocol.md"] = "invalid";
  assert.deepEqual(officialRunBlockers(packet), ["the proposed protocol packet is invalid"]);
});
