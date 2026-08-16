import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";

import {
  atomicWrite,
  buildSentinelLedger,
  loadSentinelArtifacts,
  main as runLedgerTool,
} from "./build-slr-sentinel-ledger.mjs";
import { createSentinelEvidenceFixture } from "./test-support/slr-sentinel-fixture.mjs";

const fixture = createSentinelEvidenceFixture();

function runOptions(overrides = {}) {
  const output = [];
  const errors = [];
  let exitCode = null;
  return {
    output,
    errors,
    exitCode: () => exitCode,
    options: {
      repositoryDirectory: "C:\\synthetic\\archsync-paper",
      loadArtifacts: async () => ({
        artifacts: fixture.sentinelEvidenceArtifacts,
        unexpectedNames: [],
      }),
      readText: async () => null,
      writeText: async () => {},
      log: (message) => output.push(message),
      error: (message) => errors.push(message),
      setExitCode: (code) => {
        exitCode = code;
      },
      ...overrides,
    },
  };
}

test("builds the exact canonical ledger from six semantic artifacts", () => {
  const result = buildSentinelLedger({
    artifacts: fixture.sentinelEvidenceArtifacts,
  });
  assert.deepEqual(result.issues, []);
  assert.equal(result.ledger, fixture.sentinelRecall);
});

test("rejects missing, extra and semantically invalid artifacts", () => {
  const artifacts = new Map(fixture.sentinelEvidenceArtifacts);
  artifacts.delete("research/evidence/slr-sentinel/S-006.json");
  artifacts.set(
    "research/evidence/slr-sentinel/S-001.json",
    Buffer.from("{invalid\n", "utf8"),
  );
  const result = buildSentinelLedger({
    artifacts,
    unexpectedNames: ["notes.txt"],
  });
  assert.ok(result.issues.some((issue) => issue.includes("unexpected artifact")));
  assert.ok(result.issues.some((issue) => issue.includes("JSON is invalid")));
  assert.ok(result.issues.some((issue) => issue.includes("missing research/")));
  assert.equal(result.ledger, null);
});

test("CLI validates usage, stale ledgers and governed write state", async () => {
  const usage = runOptions({ args: [] });
  await runLedgerTool(usage.options);
  assert.equal(usage.exitCode(), 2);
  assert.match(usage.errors[0], /^USAGE:/);

  const stale = runOptions({ args: ["--check"] });
  await runLedgerTool(stale.options);
  assert.equal(stale.exitCode(), 1);
  assert.match(stale.errors[0], /missing or stale/);

  const valid = runOptions({
    args: ["--check"],
    readText: async () => fixture.sentinelRecall,
  });
  await runLedgerTool(valid.options);
  assert.equal(valid.exitCode(), null);
  assert.deepEqual(valid.errors, []);
  assert.deepEqual(valid.output, [
    "VALID SLR SENTINEL LEDGER (6/6 artifacts and semantic hashes)",
  ]);

  let written = null;
  const write = runOptions({
    args: ["--write"],
    writeText: async (_path, text) => {
      written = text;
    },
  });
  await runLedgerTool(write.options);
  assert.equal(write.exitCode(), null);
  assert.equal(written, fixture.sentinelRecall);

  const reviewed = runOptions({
    args: ["--write"],
    readText: async () => "# existing review",
  });
  await runLedgerTool(reviewed.options);
  assert.equal(reviewed.exitCode(), 1);
  assert.match(reviewed.errors[0], /review evidence already exists/);
});

test("CLI converts artifact, ledger, review-state and write failures into deterministic blocks", async () => {
  const cases = [
    runOptions({
      args: ["--check"],
      loadArtifacts: async () => {
        throw new Error("artifact I/O failed");
      },
    }),
    runOptions({
      args: ["--check"],
      readText: async () => {
        throw new Error("ledger I/O failed");
      },
    }),
    runOptions({
      args: ["--write"],
      readText: async () => {
        throw new Error("review I/O failed");
      },
    }),
    runOptions({
      args: ["--write"],
      writeText: async () => {
        throw new Error("write I/O failed");
      },
    }),
  ];
  for (const entry of cases) {
    await runLedgerTool(entry.options);
    assert.equal(entry.exitCode(), 1);
    assert.match(entry.errors[0], /^SENTINEL LEDGER BLOCKED:/);
  }

  const semantic = runOptions({
    args: ["--check"],
    loadArtifacts: async () => ({ artifacts: new Map(), unexpectedNames: [] }),
  });
  await runLedgerTool(semantic.options);
  assert.equal(semantic.exitCode(), 1);
  assert.equal(semantic.errors[0], "SENTINEL LEDGER BLOCKED");
});

test("default filesystem adapters write and then verify a disposable ledger", async (context) => {
  const repository = await mkdtemp(join(tmpdir(), "archsync-slr-ledger-"));
  context.after(() => rm(repository, { recursive: true, force: true }));
  for (const [relative, bytes] of fixture.sentinelEvidenceArtifacts) {
    const target = join(repository, ...relative.split("/"));
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, bytes);
  }

  const write = runOptions({
    args: ["--write"],
    repositoryDirectory: repository,
    loadArtifacts: undefined,
    readText: undefined,
    writeText: undefined,
  });
  await runLedgerTool(write.options);
  assert.equal(write.exitCode(), null);
  assert.equal(
    await readFile(
      join(repository, "research", "literature-sentinel-recall.csv"),
      "utf8",
    ),
    fixture.sentinelRecall,
  );

  const check = runOptions({
    args: ["--check"],
    repositoryDirectory: repository,
    loadArtifacts: undefined,
    readText: undefined,
  });
  await runLedgerTool(check.options);
  assert.equal(check.exitCode(), null);
  assert.deepEqual(check.errors, []);
});

test("loader rejects unexpected directory entries and non-regular expected paths", async (context) => {
  const repository = await mkdtemp(join(tmpdir(), "archsync-slr-loader-"));
  context.after(() => rm(repository, { recursive: true, force: true }));
  const evidence = join(repository, "research", "evidence", "slr-sentinel");
  await mkdir(join(evidence, "S-001.json"), { recursive: true });
  await writeFile(join(evidence, "notes.txt"), "not evidence", "utf8");
  const loaded = await loadSentinelArtifacts(repository);
  assert.ok(loaded.unexpectedNames.includes("notes.txt"));
  assert.ok(
    loaded.unexpectedNames.includes("S-001.json (not a regular file)"),
  );
  assert.equal(loaded.artifacts.size, 0);
});

test("loader propagates a non-missing evidence-directory failure", async (context) => {
  const repository = await mkdtemp(join(tmpdir(), "archsync-slr-loader-error-"));
  context.after(() => rm(repository, { recursive: true, force: true }));
  const evidence = join(repository, "research", "evidence", "slr-sentinel");
  await mkdir(dirname(evidence), { recursive: true });
  await writeFile(evidence, "not a directory", "utf8");
  await assert.rejects(loadSentinelArtifacts(repository), /ENOTDIR|not a directory/i);
});

test("default exit-code adapter marks invalid CLI usage", async () => {
  const previous = process.exitCode;
  const errors = [];
  try {
    await runLedgerTool({
      args: [],
      error: (message) => errors.push(message),
      log: () => {},
    });
    assert.equal(process.exitCode, 2);
    assert.match(errors[0], /^USAGE:/);
  } finally {
    process.exitCode = previous ?? 0;
  }
});

test("atomic writer replaces a ledger and cleans temporary state after failure", async (context) => {
  const repository = await mkdtemp(join(tmpdir(), "archsync-slr-atomic-"));
  context.after(() => rm(repository, { recursive: true, force: true }));
  const ledger = join(repository, "ledger.csv");
  await atomicWrite(ledger, "old\n");
  await atomicWrite(ledger, "new\n");
  assert.equal(await readFile(ledger, "utf8"), "new\n");
  await assert.rejects(
    atomicWrite(join(repository, "missing", "ledger.csv"), "value"),
    /ENOENT/,
  );
});
