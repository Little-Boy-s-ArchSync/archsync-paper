import assert from "node:assert/strict";
import { generateKeyPairSync, sign } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  APPROVAL_PURPOSES,
  DECISION_IDS,
  DOCUMENTS,
  GOVERNED_INPUTS,
  REQUIRED_TOOL_IDS,
  assertTemplate,
  freezePayloadSha256,
  sha256,
  validateExperimentFreezeManifest,
  verifyExperimentReadiness,
} from "./verify-experiment-readiness.mjs";

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const templatePath = join(repositoryRoot, "research", "experiment-freeze-manifest.template.json");
const SOURCE_COMMIT = "a".repeat(40);
const FREEZE_TIME = "2026-09-14T10:00:00Z";

async function put(root, path, text = path) {
  const full = join(root, path);
  await mkdir(dirname(full), { recursive: true });
  const bytes = Buffer.from(`${text}\n`, "utf8");
  await writeFile(full, bytes);
  return sha256(bytes);
}

async function validFixture() {
  const root = await mkdtemp(join(tmpdir(), "archsync-experiment-readiness-"));
  const manifest = JSON.parse(await readFile(templatePath, "utf8"));
  Object.assign(manifest, {
    freeze_id: "EXP-FREEZE-2026-09-14-001",
    status: "frozen-authorized",
    source_commit: SOURCE_COMMIT,
    frozen_at_utc: FREEZE_TIME,
    official_runs_authorized: true,
  });

  manifest.documents = await Promise.all(DOCUMENTS.map(async ([task_id, path]) => ({
    task_id, path, version: "1.0.0", status: "approved-frozen", sha256: await put(root, path),
  })));
  manifest.governed_inputs = await Promise.all(GOVERNED_INPUTS.map(async ([task_id, path]) => ({
    task_id, path, sha256: await put(root, path),
  })));
  manifest.decisions = await Promise.all(DECISION_IDS.map(async (decision_id) => {
    const record_path = `research/evidence/experiment-freeze/decisions/${decision_id}.json`;
    return {
      decision_id,
      status: "accepted",
      record_path,
      record_sha256: await put(root, record_path),
      authorization_url: `https://github.com/Little-Boy-s-ArchSync/archsync/issues/47#issuecomment-${100 + DECISION_IDS.indexOf(decision_id)}`,
    };
  }));

  const datasetPaths = {
    d3_manifest: "research/evidence/experiment-freeze/d3-manifest.json",
    license_register: "research/evidence/experiment-freeze/license-register.csv",
    truth_manifest: "research/evidence/experiment-freeze/truth-manifest.json",
  };
  for (const [prefix, path] of Object.entries(datasetPaths)) {
    manifest.dataset[`${prefix}_path`] = path;
    manifest.dataset[`${prefix}_sha256`] = await put(root, path);
  }
  manifest.dataset.frozen_before_any_output = true;
  manifest.dataset.truth_sealed_before_any_output = true;

  manifest.tools = await Promise.all(REQUIRED_TOOL_IDS.map(async (tool_id) => {
    const package_path = `research/evidence/experiment-freeze/tools/${tool_id}.package`;
    const config_path = `research/evidence/experiment-freeze/tools/${tool_id}.json`;
    return {
      tool_id,
      version: "1.0.0",
      package_path,
      package_sha256: await put(root, package_path, `${tool_id}-package`),
      config_path,
      config_sha256: await put(root, config_path),
      command: `${tool_id} --frozen-config ${config_path}`,
    };
  }));

  manifest.environment = {
    manifest_path: "research/evidence/experiment-freeze/environment.json",
    manifest_sha256: await put(root, "research/evidence/experiment-freeze/environment.json"),
    node_version: "22.16.0",
    package_manager_version: "pnpm 11.16.0",
    container_image_digest: `sha256:${"b".repeat(64)}`,
  };
  manifest.assignment = {
    manifest_path: "research/evidence/experiment-freeze/assignment.json",
    manifest_sha256: await put(root, "research/evidence/experiment-freeze/assignment.json"),
    algorithm: "Williams design v1 with frozen canonical ordering",
    seed_commitment_sha256: "c".repeat(64),
    generated_before_any_outcome: true,
  };

  const ethicsPaths = {
    determination: "research/evidence/experiment-freeze/ethics-determination.pdf",
    consent_materials: "research/evidence/experiment-freeze/consent-materials.pdf",
    provider_authorization: "research/evidence/experiment-freeze/provider-authorization.json",
    redaction_preflight: "research/evidence/experiment-freeze/redaction-preflight.json",
  };
  manifest.ethics.consent_required = true;
  for (const [prefix, path] of Object.entries(ethicsPaths)) {
    manifest.ethics[`${prefix}_path`] = path;
    manifest.ethics[`${prefix}_sha256`] = await put(root, path);
  }

  Object.assign(manifest.data_management, {
    custodian: "Named Data Custodian",
    storage_location: "Approved encrypted research store",
    storage_region: "Approved region",
    encryption_control: "Encryption at rest and in transit",
    key_owner: "Named Key Owner",
    retention_schedule: "Approved versioned retention schedule",
    deletion_procedure: "Approved auditable deletion procedure",
  });
  for (const prefix of ["access_register", "backup_restore_receipt", "publication_register"]) {
    const path = `research/evidence/experiment-freeze/${prefix.replaceAll("_", "-")}.json`;
    manifest.data_management[`${prefix}_path`] = path;
    manifest.data_management[`${prefix}_sha256`] = await put(root, path);
  }
  manifest.preflight = {
    status: "pass",
    receipt_path: "research/evidence/experiment-freeze/preflight.json",
    receipt_sha256: await put(root, "research/evidence/experiment-freeze/preflight.json"),
    completed_at_utc: "2026-09-14T09:59:59Z",
    blockers: [],
  };

  const payloadHash = freezePayloadSha256(manifest);
  manifest.approvals = [];
  for (const [index, purpose] of APPROVAL_PURPOSES.entries()) {
    const actor = index === 0 ? "Vo Duc Hieu" : "Independent Method Reviewer";
    const actor_role = index === 0 ? "Repository Lead" : "Independent Method Reviewer";
    const { publicKey, privateKey } = generateKeyPairSync("ed25519");
    const publicBytes = publicKey.export({ type: "spki", format: "pem" });
    const signature = sign(null, Buffer.from(`${payloadHash}\n`, "utf8"), privateKey);
    const public_key_path = `research/evidence/experiment-freeze/approvals/${index}.pem`;
    const signature_path = `research/evidence/experiment-freeze/approvals/${index}.sig`;
    await mkdir(dirname(join(root, public_key_path)), { recursive: true });
    await writeFile(join(root, public_key_path), publicBytes);
    await writeFile(join(root, signature_path), signature);
    manifest.approvals.push({
      purpose,
      actor,
      actor_role,
      actor_type: "human",
      decision: "approved",
      decided_at_utc: "2026-09-14T10:01:00Z",
      authorization_url: `https://github.com/Little-Boy-s-ArchSync/archsync/issues/47#issuecomment-${200 + index}`,
      source_commit: SOURCE_COMMIT,
      freeze_payload_sha256: payloadHash,
      public_key_path,
      public_key_sha256: sha256(publicBytes),
      signature_path,
      signature_sha256: sha256(signature),
    });
  }
  return { root, manifest };
}

async function withFixture(callback) {
  const fixture = await validFixture();
  try {
    return await callback(fixture);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
}

test("repository template is valid and permanently fail closed", async () => {
  const value = await assertTemplate(repositoryRoot);
  assert.equal(value.official_runs_authorized, false);
  assert.deepEqual(value.approvals, []);
  assert.notEqual(validateExperimentFreezeManifest(value).length, 0);
});

test("accepts a complete hash-bound and independently signed freeze bundle", async () => {
  await withFixture(async ({ root, manifest }) => {
    assert.deepEqual(validateExperimentFreezeManifest(manifest), []);
    const result = await verifyExperimentReadiness(manifest, { root, headCommit: SOURCE_COMMIT });
    assert.equal(result.ready, true);
    assert.equal(result.status, "READY");
    assert.match(result.payload_sha256, /^[0-9a-f]{64}$/u);
  });
});

test("rejects authorization before every required frozen field is resolved", async () => {
  await withFixture(async ({ manifest }) => {
    manifest.official_runs_authorized = false;
    manifest.status = "not-frozen";
    manifest.documents[0].version = "0.1.1-proposed";
    manifest.dataset.frozen_before_any_output = false;
    manifest.assignment.generated_before_any_outcome = false;
    manifest.ethics.consent_required = false;
    manifest.preflight.blockers.push("REAL_BLOCKER");
    const issues = validateExperimentFreezeManifest(manifest).join("\n");
    assert.match(issues, /official_runs_authorized must be true/u);
    assert.match(issues, /release SemVer/u);
    assert.match(issues, /dataset must freeze before any output/u);
    assert.match(issues, /assignment must be generated before any outcome/u);
    assert.match(issues, /consent_required must be true/u);
    assert.match(issues, /preflight.blockers must be empty/u);
  });
});

test("rejects fabricated completion fields and outcome-bearing freeze manifests", async () => {
  await withFixture(async ({ manifest }) => {
    manifest.freeze_id = "";
    manifest.frozen_at_utc = "2026-02-30T00:00:00Z";
    manifest.results.push({ claimed: "result" });
    manifest.decisions[0].status = "unresolved";
    manifest.tools[0].package_sha256 = "not-a-hash";
    const issues = validateExperimentFreezeManifest(manifest).join("\n");
    assert.match(issues, /freeze_id is required/u);
    assert.match(issues, /frozen_at_utc must be canonical/u);
    assert.match(issues, /results must be empty/u);
    assert.match(issues, /status must be accepted/u);
    assert.match(issues, /package_sha256 must be SHA-256/u);
  });
});

test("rejects path traversal, schema drift and tool reordering", async () => {
  await withFixture(async ({ manifest }) => {
    manifest.documents[0].path = "../outside.md";
    manifest.documents[1].extra = true;
    [manifest.tools[0], manifest.tools[1]] = [manifest.tools[1], manifest.tools[0]];
    const issues = validateExperimentFreezeManifest(manifest).join("\n");
    assert.match(issues, /must bind EXP-101/u);
    assert.match(issues, /safe research\/ path/u);
    assert.match(issues, /fields do not match schema/u);
    assert.match(issues, /tool_id must be archsync-core/u);
  });
});

test("rejects same-person approval and approval not bound to exact payload", async () => {
  await withFixture(async ({ manifest }) => {
    manifest.approvals[1].actor = manifest.approvals[0].actor;
    manifest.approvals[1].freeze_payload_sha256 = "d".repeat(64);
    manifest.approvals[1].source_commit = "e".repeat(40);
    const issues = validateExperimentFreezeManifest(manifest).join("\n");
    assert.match(issues, /different actors/u);
    assert.match(issues, /canonical payload/u);
    assert.match(issues, /source_commit must match/u);
  });
});

test("rejects non-immutable authorization URLs and approvals predating freeze", async () => {
  await withFixture(async ({ manifest }) => {
    manifest.decisions[0].authorization_url = "https://example.com/claim";
    manifest.approvals[0].authorization_url = "https://github.com/Little-Boy-s-ArchSync/archsync/issues/47";
    manifest.approvals[0].decided_at_utc = "2026-09-14T09:00:00Z";
    const issues = validateExperimentFreezeManifest(manifest).join("\n");
    assert.match(issues, /immutable ArchSync GitHub comment or review/u);
    assert.match(issues, /cannot predate the freeze payload/u);
  });
});

test("accepts a manifest commit descended from the frozen source and checks source bytes", async () => {
  await withFixture(async ({ root, manifest }) => {
    const source = new Map(
      [...manifest.documents, ...manifest.governed_inputs]
        .map((row) => [row.path, readFile(join(root, row.path))]),
    );
    const readSource = async (_commit, path) => source.get(path);
    const result = await verifyExperimentReadiness(manifest, {
      root,
      headCommit: "f".repeat(40),
      sourceCommitIsAncestor: true,
      readSource,
    });
    assert.equal(result.ready, true);
  });
});

test("rejects source-commit byte drift or an unreadable frozen source", async () => {
  await withFixture(async ({ root, manifest }) => {
    const changedPath = manifest.documents[0].path;
    const missingPath = manifest.documents[1].path;
    const readSource = async (_commit, path) => {
      if (path === changedPath) return Buffer.from("changed source bytes\n", "utf8");
      if (path === missingPath) throw new Error("missing");
      return readFile(join(root, path));
    };
    const result = await verifyExperimentReadiness(manifest, {
      root,
      headCommit: "f".repeat(40),
      sourceCommitIsAncestor: true,
      readSource,
    });
    assert.equal(result.ready, false);
    assert.match(result.issues.join("\n"), /source commit bytes do not match/u);
    assert.match(result.issues.join("\n"), /source commit cannot provide/u);
  });
});

test("rejects every unresolved or structurally changed freeze section", async () => {
  await withFixture(async ({ manifest }) => {
    const mutations = [
      ["top-level", (v) => { v.extra = true; }, /top-level fields/u],
      ["schema", (v) => { v.schema_version = "2.0.0"; }, /schema_version/u],
      ["tasks", (v) => { v.task_ids = []; }, /task_ids/u],
      ["modules", (v) => { v.module_scope = []; }, /module_scope/u],
      ["source", (v) => { v.source_commit = "short"; }, /full Git SHA/u],
      ["documents length", (v) => { v.documents = []; }, /documents must contain/u],
      ["inputs length", (v) => { v.governed_inputs = []; }, /governed_inputs must contain/u],
      ["input binding", (v) => { v.governed_inputs[0].task_id = "RQ-102"; }, /must bind RQ-101/u],
      ["decisions length", (v) => { v.decisions = []; }, /decisions must contain/u],
      ["decision order", (v) => { v.decisions[0].decision_id = "wrong"; }, /out of order/u],
      ["dataset schema", (v) => { v.dataset = {}; }, /dataset fields/u],
      ["truth seal", (v) => { v.dataset.truth_sealed_before_any_output = false; }, /truth must seal/u],
      ["tools length", (v) => { v.tools = []; }, /tools must contain/u],
      ["tool schema", (v) => { v.tools[0].extra = true; }, /tools\[0\] fields/u],
      ["tool values", (v) => { v.tools[0].version = ""; v.tools[0].command = ""; }, /requires version and command/u],
      ["tool package path", (v) => { v.tools[0].package_path = "research/../outside.tgz"; }, /package_path must be a safe research\/ path/u],
      ["environment schema", (v) => { v.environment = {}; }, /environment fields/u],
      ["environment versions", (v) => { v.environment.node_version = ""; }, /environment versions/u],
      ["environment digest", (v) => { v.environment.container_image_digest = "latest"; }, /immutable sha256 digest/u],
      ["assignment schema", (v) => { v.assignment = {}; }, /assignment fields/u],
      ["assignment algorithm", (v) => { v.assignment.algorithm = ""; }, /assignment.algorithm/u],
      ["assignment seed", (v) => { v.assignment.seed_commitment_sha256 = "bad"; }, /seed_commitment_sha256/u],
      ["ethics schema", (v) => { v.ethics = {}; }, /ethics fields/u],
      ["data schema", (v) => { v.data_management = {}; }, /data_management fields/u],
      ["data values", (v) => { v.data_management.custodian = ""; }, /data_management.custodian/u],
      ["preflight schema", (v) => { v.preflight = {}; }, /preflight fields/u],
      ["preflight status", (v) => { v.preflight.status = "blocked"; }, /preflight.status/u],
      ["preflight time", (v) => { v.preflight.completed_at_utc = "2026-09-14T11:00:00Z"; }, /no later than/u],
      ["approvals length", (v) => { v.approvals = []; }, /approvals must contain/u],
      ["approval schema", (v) => { v.approvals[0].extra = true; }, /approvals\[0\] fields/u],
      ["approval purpose", (v) => { v.approvals[0].purpose = "wrong"; }, /purpose must be/u],
      ["approval identity", (v) => { v.approvals[0].actor_type = "ai"; }, /must name a human/u],
      ["approval decision", (v) => { v.approvals[0].decision = "pending"; }, /decision must be approved/u],
      ["approval time", (v) => { v.approvals[0].decided_at_utc = "not-utc"; }, /decided_at_utc/u],
      ["approval role", (v) => { v.approvals[0].actor_role = "Other"; }, /actor_role must be Repository Lead/u],
      ["normalized traversal", (v) => { v.preflight.receipt_path = "research/../outside.json"; }, /safe research\/ path/u],
      ["absolute path", (v) => { v.preflight.receipt_path = "C:/outside.json"; }, /safe research\/ path/u],
      ["backslash path", (v) => { v.preflight.receipt_path = "research\\outside.json"; }, /safe research\/ path/u],
      ["hash", (v) => { v.preflight.receipt_sha256 = null; }, /receipt_sha256 must be SHA-256/u],
    ];
    for (const [name, mutate, expected] of mutations) {
      const value = structuredClone(manifest);
      mutate(value);
      assert.match(validateExperimentFreezeManifest(value).join("\n"), expected, name);
    }
  });
});

test("detects changed artifact bytes and an unrelated checked-out commit", async () => {
  await withFixture(async ({ root, manifest }) => {
    await writeFile(join(root, manifest.documents[0].path), "changed\n", "utf8");
    const result = await verifyExperimentReadiness(manifest, {
      root,
      headCommit: "f".repeat(40),
      sourceCommitIsAncestor: false,
    });
    assert.equal(result.ready, false);
    assert.match(result.issues.join("\n"), /hash does not match/u);
    assert.match(result.issues.join("\n"), /verified ancestor of HEAD/u);
  });
});

test("detects a missing artifact and invalid approval signature", async () => {
  await withFixture(async ({ root, manifest }) => {
    await rm(join(root, manifest.decisions[0].record_path));
    await writeFile(join(root, manifest.approvals[0].signature_path), Buffer.from("invalid"));
    const result = await verifyExperimentReadiness(manifest, { root, headCommit: SOURCE_COMMIT });
    assert.equal(result.ready, false);
    assert.match(result.issues.join("\n"), /cannot be read/u);
    assert.match(result.issues.join("\n"), /signature hash mismatch/u);
    assert.match(result.issues.join("\n"), /signature does not verify/u);
  });
});

test("rejects an unreadable approval key bundle", async () => {
  await withFixture(async ({ root, manifest }) => {
    await rm(join(root, manifest.approvals[0].public_key_path));
    const result = await verifyExperimentReadiness(manifest, { root, headCommit: SOURCE_COMMIT });
    assert.equal(result.ready, false);
    assert.match(result.issues.join("\n"), /signature bundle cannot be read or verified/u);
  });
});

test("template assertion rejects a template that appears authorized", async () => {
  const root = await mkdtemp(join(tmpdir(), "archsync-experiment-template-"));
  try {
    const value = JSON.parse(await readFile(templatePath, "utf8"));
    value.official_runs_authorized = true;
    await mkdir(join(root, "research"), { recursive: true });
    await writeFile(
      join(root, "research", "experiment-freeze-manifest.template.json"),
      `${JSON.stringify(value, null, 2)}\n`,
      "utf8",
    );
    await assert.rejects(() => assertTemplate(root), /must remain unapproved/u);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("requires a verification root", async () => {
  await withFixture(async ({ manifest }) => {
    const result = await verifyExperimentReadiness(manifest, { headCommit: SOURCE_COMMIT });
    assert.equal(result.ready, false);
    assert.ok(result.issues.includes("verification root is required"));
  });
});

test("CLI validates only the fail-closed template by default", () => {
  const script = join(repositoryRoot, "research", "verify-experiment-readiness.mjs");
  const template = spawnSync(process.execPath, [script, "--template"], { cwd: repositoryRoot, encoding: "utf8" });
  assert.equal(template.status, 0, template.stderr);
  assert.match(template.stdout, /official runs blocked/u);
  const usage = spawnSync(process.execPath, [script, "--unknown"], { cwd: repositoryRoot, encoding: "utf8" });
  assert.equal(usage.status, 2);
  assert.match(usage.stderr, /Usage:/u);
  const missing = spawnSync(process.execPath, [script, "--check"], { cwd: repositoryRoot, encoding: "utf8" });
  assert.equal(missing.status, 2);
  assert.match(missing.stderr, /experiment-freeze-manifest\.json is missing/u);
});
