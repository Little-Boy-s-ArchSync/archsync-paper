import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import test from "node:test";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

import {
  freezeLiteratureProtocol,
  main as runFreezeTool,
} from "./freeze-literature-protocol.mjs";

const researchDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryDirectory = dirname(researchDirectory);
const [protocol, decisions, baseline, traceability, paper, bibliography] =
  await Promise.all([
    readFile(join(researchDirectory, "literature-protocol.md"), "utf8"),
    readFile(join(researchDirectory, "decision-log.md"), "utf8"),
    readFile(join(researchDirectory, "RESEARCH.md"), "utf8"),
    readFile(join(researchDirectory, "RQ-TRACEABILITY.md"), "utf8"),
    readFile(join(repositoryDirectory, "main.tex"), "utf8"),
    readFile(join(repositoryDirectory, "references.bib"), "utf8"),
  ]);

const reviewRecord = `# SLR-101 Independent Review Record

| Field | Value |
| --- | --- |
| Task | SLR-101 |
| Protocol version | 1.0.0 |
| Review PR | https://github.com/Little-Boy-s-ArchSync/archsync-paper/pull/6 |
| Reviewer | Member 3 |
| Review decision | Approved |
| Review commit | abcdef0123456789abcdef0123456789abcdef01 |
| Review timestamp | 2026-08-17T03:04:05Z |
| Search results inspected | No |
| Sentinel recall | Passed |
`;

const sentinelRecall = `sentinel_id,doi,indexed_sources,retrieved_sources,classification,reviewer,evidence
S-001,10.1145/222124.222136,ACM Digital Library;Scopus,ACM Digital Library,retrieved,Member 3,research/evidence/slr-sentinel/S-001.json#sha256=${"1".repeat(64)}
S-002,10.1109/WICSA.2007.1,IEEE Xplore;Scopus,IEEE Xplore,retrieved,Member 3,research/evidence/slr-sentinel/S-002.json#sha256=${"2".repeat(64)}
S-003,10.1002/spe.931,Scopus;Web of Science Core Collection,Scopus,retrieved,Member 3,research/evidence/slr-sentinel/S-003.json#sha256=${"3".repeat(64)}
S-004,10.1016/j.jss.2011.07.036,Scopus;Web of Science Core Collection,Scopus,retrieved,Member 3,research/evidence/slr-sentinel/S-004.json#sha256=${"4".repeat(64)}
S-005,10.3217/jucs-023-08-0769,Scopus,Scopus,retrieved,Member 3,research/evidence/slr-sentinel/S-005.json#sha256=${"5".repeat(64)}
S-006,10.1002/smr.2423,Scopus;Web of Science Core Collection,Scopus,retrieved,Member 3,research/evidence/slr-sentinel/S-006.json#sha256=${"6".repeat(64)}
`;
const sentinelEvidenceHashes = new Map(
  [
    ...sentinelRecall.matchAll(
      /(research\/evidence\/slr-sentinel\/S-[0-9]{3}\.json)#sha256=([0-9a-f]{64})/g,
    ),
  ].map((match) => [match[1], match[2]]),
);

const source = {
  protocol,
  decisions,
  baseline,
  traceability,
  paper,
  bibliography,
  reviewRecord,
  sentinelRecall,
  sentinelEvidenceHashes,
};

test("produces a validator-approved 1.0.0 freeze state from governed evidence", () => {
  const result = freezeLiteratureProtocol(source);
  assert.deepEqual(result.issues, []);
  assert.match(result.protocol, /\| Protocol version \| 1\.0\.0 \|/);
  assert.match(result.protocol, /\| Status \| Frozen \|/);
  assert.match(result.protocol, /\| Search authorization \| Authorized \|/);
  assert.match(result.protocol, /^This protocol is frozen at version 1\.0\.0/m);
  assert.match(result.protocol, /^## 20\. Protocol version history$/m);
  assert.match(
    result.protocol,
    /^\| 1\.0\.0 \| 2026-08-17 \| D-008 accepted \|/m,
  );
  assert.equal((result.protocol.match(/^- \[x\]/gm) ?? []).length, 10);
  assert.match(result.decisions, /^- Status: Accepted$/m);
  assert.match(result.decisions, /Independent review: Member 3 approved/);
  assert.match(result.paper, /The frozen protocol predeclares/);
  assert.match(result.paper, /protocol version \\texttt\{1\.0\.0\} is frozen/);
});

test("refuses to freeze a modified or already-frozen source state", () => {
  const modified = freezeLiteratureProtocol({
    ...source,
    protocol: protocol.replace(
      "| Status | Review candidate |",
      "| Status | Unknown |",
    ),
  });
  assert.ok(
    modified.issues.some((issue) => issue.startsWith("candidate state:")),
  );

  const frozen = freezeLiteratureProtocol(source);
  const repeated = freezeLiteratureProtocol({
    ...source,
    protocol: frozen.protocol,
    decisions: frozen.decisions,
    paper: frozen.paper,
  });
  assert.ok(
    repeated.issues.some((issue) => issue.startsWith("candidate state:")),
  );
});

test("refuses missing review metadata or sentinel evidence", () => {
  const missingReview = freezeLiteratureProtocol({
    ...source,
    reviewRecord: reviewRecord
      .replace(/\| Review PR \|[^\n]+\n/, "")
      .replace(/\| Review commit \|[^\n]+\n/, "")
      .replace(/\| Review timestamp \|[^\n]+\n/, ""),
    sentinelRecall: "",
  });
  for (const fragment of [
    "missing Review PR",
    "missing Review commit",
    "missing Review timestamp",
    "sentinel recall ledger is missing",
  ]) {
    assert.ok(missingReview.issues.some((issue) => issue.includes(fragment)));
  }
});

test("refuses forged sentinel hashes after generating the prospective state", () => {
  const hashes = new Map(sentinelEvidenceHashes);
  hashes.set("research/evidence/slr-sentinel/S-001.json", "0".repeat(64));
  const result = freezeLiteratureProtocol({
    ...source,
    sentinelEvidenceHashes: hashes,
  });
  assert.ok(
    result.issues.some(
      (issue) =>
        issue.includes("frozen state:") &&
        issue.includes("evidence SHA-256 does not match"),
    ),
  );
});

function inMemoryCli(overrides = {}) {
  const files = new Map([
    ["literature-protocol.md", protocol],
    ["decision-log.md", decisions],
    ["RESEARCH.md", baseline],
    ["RQ-TRACEABILITY.md", traceability],
    ["main.tex", paper],
    ["references.bib", bibliography],
    ["slr-review-record.md", reviewRecord],
    ["literature-sentinel-recall.csv", sentinelRecall],
  ]);
  const writes = new Map();
  const output = [];
  const errors = [];
  let exitCode = null;
  return {
    writes,
    output,
    errors,
    exitCode: () => exitCode,
    options: {
      repositoryDirectory: "C:\\synthetic\\archsync-paper",
      readText: async (path) => {
        const name = path.split(/[\\/]/).at(-1);
        if (!files.has(name)) {
          const missing = new Error("missing");
          missing.path = path;
          throw missing;
        }
        return files.get(name);
      },
      writeText: async (path, text) => {
        writes.set(path.split(/[\\/]/).at(-1), text);
      },
      loadHashes: async () => sentinelEvidenceHashes,
      log: (message) => output.push(message),
      error: (message) => errors.push(message),
      setExitCode: (code) => {
        exitCode = code;
      },
      ...overrides,
    },
  };
}

test("CLI check mode validates without writing", async () => {
  const cli = inMemoryCli({ args: ["--check"] });
  await runFreezeTool(cli.options);
  assert.equal(cli.exitCode(), null);
  assert.deepEqual(cli.errors, []);
  assert.equal(cli.writes.size, 0);
  assert.deepEqual(cli.output, ["READY TO FREEZE SLR PROTOCOL 1.0.0"]);
});

test("CLI write mode updates exactly the three governed documents", async () => {
  const cli = inMemoryCli({ args: ["--write"] });
  await runFreezeTool(cli.options);
  assert.equal(cli.exitCode(), null);
  assert.deepEqual([...cli.writes.keys()].sort(), [
    "decision-log.md",
    "literature-protocol.md",
    "main.tex",
  ]);
  assert.deepEqual(cli.output, ["WROTE SLR PROTOCOL 1.0.0 FREEZE STATE"]);
});

test("CLI rejects invalid usage and missing evidence files", async () => {
  const usage = inMemoryCli({ args: [] });
  await runFreezeTool(usage.options);
  assert.equal(usage.exitCode(), 2);
  assert.ok(usage.errors[0].startsWith("USAGE:"));

  const missing = inMemoryCli({
    args: ["--check"],
    readText: async (path) => {
      const error = new Error("missing");
      error.path = path;
      throw error;
    },
  });
  await runFreezeTool(missing.options);
  assert.equal(missing.exitCode(), 1);
  assert.ok(missing.errors[0].startsWith("FREEZE BLOCKED: cannot read"));
});

test("CLI default filesystem adapters verify hashes and write a disposable freeze tree", async (context) => {
  const repository = await mkdtemp(join(tmpdir(), "archsync-slr-freeze-"));
  context.after(() => rm(repository, { recursive: true, force: true }));
  const research = join(repository, "research");
  const evidence = join(research, "evidence", "slr-sentinel");
  await mkdir(evidence, { recursive: true });

  const evidenceHashes = new Map();
  for (let index = 1; index <= 6; index += 1) {
    const id = `S-${String(index).padStart(3, "0")}`;
    const content = `${JSON.stringify({ sentinel_id: id, retrieved: true })}\n`;
    await writeFile(join(evidence, `${id}.json`), content, "utf8");
    evidenceHashes.set(id, createHash("sha256").update(content).digest("hex"));
  }
  let realRecall = sentinelRecall;
  for (let index = 1; index <= 6; index += 1) {
    realRecall = realRecall.replace(
      String(index).repeat(64),
      evidenceHashes.get(`S-${String(index).padStart(3, "0")}`),
    );
  }

  await Promise.all([
    writeFile(join(research, "literature-protocol.md"), protocol, "utf8"),
    writeFile(join(research, "decision-log.md"), decisions, "utf8"),
    writeFile(join(research, "RESEARCH.md"), baseline, "utf8"),
    writeFile(join(research, "RQ-TRACEABILITY.md"), traceability, "utf8"),
    writeFile(join(repository, "main.tex"), paper, "utf8"),
    writeFile(join(repository, "references.bib"), bibliography, "utf8"),
    writeFile(join(research, "slr-review-record.md"), reviewRecord, "utf8"),
    writeFile(
      join(research, "literature-sentinel-recall.csv"),
      realRecall,
      "utf8",
    ),
  ]);

  const output = [];
  const errors = [];
  let exitCode = null;
  await runFreezeTool({
    args: ["--write"],
    repositoryDirectory: repository,
    log: (message) => output.push(message),
    error: (message) => errors.push(message),
    setExitCode: (code) => {
      exitCode = code;
    },
  });
  assert.equal(exitCode, null);
  assert.deepEqual(errors, []);
  assert.deepEqual(output, ["WROTE SLR PROTOCOL 1.0.0 FREEZE STATE"]);
  assert.match(
    await readFile(join(research, "literature-protocol.md"), "utf8"),
    /\| Protocol version \| 1\.0\.0 \|/,
  );
  assert.match(
    await readFile(join(research, "decision-log.md"), "utf8"),
    /^- Status: Accepted$/m,
  );
  assert.match(
    await readFile(join(repository, "main.tex"), "utf8"),
    /The frozen protocol predeclares/,
  );
});
