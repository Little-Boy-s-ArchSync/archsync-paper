import { createHash, randomUUID } from "node:crypto";
import {
  lstat,
  readFile,
  readdir,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  SENTINEL_DOIS,
  verifySlrSentinelEvidence,
} from "./verify-slr-sentinel-evidence.mjs";

const HEADER =
  "sentinel_id,doi,indexed_sources,retrieved_sources,classification,reviewer,evidence";
const EXPECTED_NAMES = Object.freeze(
  SENTINEL_DOIS.map((_, index) =>
    `S-${String(index + 1).padStart(3, "0")}.json`,
  ),
);

function expectedIdentity(index) {
  return {
    sentinel_id: EXPECTED_NAMES[index].slice(0, -5),
    doi: SENTINEL_DOIS[index],
  };
}

function artifactLedgerRecord(bytes, index) {
  let parsed = {};
  try {
    parsed = JSON.parse(bytes.toString("utf8"));
  } catch {
    // The semantic verifier reports the exact parse failure.
  }
  return {
    ...expectedIdentity(index),
    indexed_sources: Array.isArray(parsed?.indexed_sources)
      ? parsed.indexed_sources
      : [],
    retrieved_sources: Array.isArray(parsed?.retrieved_sources)
      ? parsed.retrieved_sources
      : [],
    classification: parsed?.classification,
  };
}

export function buildSentinelLedger({
  artifacts,
  unexpectedNames = [],
}) {
  const issues = [];
  const rows = [];

  for (const name of unexpectedNames) {
    issues.push(`sentinel ledger: unexpected artifact '${name}'`);
  }

  EXPECTED_NAMES.forEach((name, index) => {
    const identity = expectedIdentity(index);
    const path = `research/evidence/slr-sentinel/${name}`;
    const bytes = artifacts.get(path);
    if (!bytes) {
      issues.push(`sentinel ledger: missing ${path}`);
      return;
    }
    const ledgerRecord = artifactLedgerRecord(bytes, index);
    const result = verifySlrSentinelEvidence({
      artifactBytes: bytes,
      ledgerRecord,
    });
    issues.push(...result.issues);
    if (result.issues.length > 0) return;

    const digest = createHash("sha256").update(bytes).digest("hex");
    rows.push(
      [
        identity.sentinel_id,
        identity.doi,
        ledgerRecord.indexed_sources.length > 0
          ? ledgerRecord.indexed_sources.join(";")
          : "none",
        ledgerRecord.retrieved_sources.length > 0
          ? ledgerRecord.retrieved_sources.join(";")
          : "none",
        ledgerRecord.classification,
        "Member 3",
        `${path}#sha256=${digest}`,
      ].join(","),
    );
  });

  return {
    issues,
    ledger: issues.length === 0 ? `${[HEADER, ...rows].join("\n")}\n` : null,
  };
}

export async function loadSentinelArtifacts(repositoryDirectory) {
  const directory = join(
    repositoryDirectory,
    "research",
    "evidence",
    "slr-sentinel",
  );
  let entries = [];
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }

  const unexpectedNames = entries
    .map((entry) => entry.name)
    .filter((name) => !EXPECTED_NAMES.includes(name));
  const artifacts = new Map();
  for (const name of EXPECTED_NAMES) {
    const path = join(directory, name);
    try {
      const metadata = await lstat(path);
      if (!metadata.isFile() || metadata.isSymbolicLink()) {
        unexpectedNames.push(`${name} (not a regular file)`);
        continue;
      }
      artifacts.set(
        `research/evidence/slr-sentinel/${name}`,
        await readFile(path),
      );
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }
  return { artifacts, unexpectedNames };
}

async function readOptional(path) {
  try {
    return await readFile(path, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

export async function atomicWrite(path, text) {
  const temporaryPath = `${path}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporaryPath, text, { encoding: "utf8", flag: "wx" });
    await rename(temporaryPath, path);
  } catch (error) {
    await rm(temporaryPath, { force: true });
    throw error;
  }
}

export async function main({
  args = process.argv.slice(2),
  repositoryDirectory = dirname(dirname(fileURLToPath(import.meta.url))),
  loadArtifacts = loadSentinelArtifacts,
  readText = readOptional,
  writeText = atomicWrite,
  log = console.log,
  error = console.error,
  setExitCode = (code) => {
    process.exitCode = code;
  },
} = {}) {
  const mode =
    args.length === 1 && ["--check", "--write"].includes(args[0])
      ? args[0]
      : null;
  if (!mode) {
    error(
      "USAGE: node research/build-slr-sentinel-ledger.mjs --check|--write",
    );
    setExitCode(2);
    return;
  }

  let loaded;
  try {
    loaded = await loadArtifacts(repositoryDirectory);
  } catch (loadError) {
    error(`SENTINEL LEDGER BLOCKED: cannot read artifacts: ${loadError.message}`);
    setExitCode(1);
    return;
  }
  const result = buildSentinelLedger(loaded);
  if (result.issues.length > 0) {
    error("SENTINEL LEDGER BLOCKED");
    for (const issue of result.issues) error(`- ${issue}`);
    setExitCode(1);
    return;
  }

  const ledgerPath = join(
    repositoryDirectory,
    "research",
    "literature-sentinel-recall.csv",
  );
  const reviewPath = join(
    repositoryDirectory,
    "research",
    "slr-review-record.md",
  );
  if (mode === "--check") {
    let current;
    try {
      current = await readText(ledgerPath);
    } catch (readError) {
      error(`SENTINEL LEDGER BLOCKED: cannot read ledger: ${readError.message}`);
      setExitCode(1);
      return;
    }
    if (current !== result.ledger) {
      error("SENTINEL LEDGER BLOCKED: governed CSV is missing or stale");
      setExitCode(1);
      return;
    }
    log("VALID SLR SENTINEL LEDGER (6/6 artifacts and semantic hashes)");
    return;
  }

  let reviewRecord;
  try {
    reviewRecord = await readText(reviewPath);
  } catch (readError) {
    error(
      `SENTINEL LEDGER BLOCKED: cannot inspect review state: ${readError.message}`,
    );
    setExitCode(1);
    return;
  }
  if (reviewRecord !== null) {
    error("SENTINEL LEDGER BLOCKED: review evidence already exists");
    setExitCode(1);
    return;
  }
  try {
    await writeText(ledgerPath, result.ledger);
  } catch (writeError) {
    error(`SENTINEL LEDGER BLOCKED: cannot write ledger: ${writeError.message}`);
    setExitCode(1);
    return;
  }
  log("WROTE SLR SENTINEL LEDGER (6/6 artifacts and semantic hashes)");
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  await main();
}
