import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { lstat, mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  CANDIDATE_ROOT,
  main,
  validateCandidatePacket,
} from "./validate-slr-calibration-candidates.mjs";

const repositoryDirectory = join(dirname(fileURLToPath(import.meta.url)), "..");
const candidateRoot = join(repositoryDirectory, CANDIDATE_ROOT);

async function fixture() {
  const recordsDirectory = join(candidateRoot, "records");
  const filenames = await readdir(recordsDirectory);
  const artifacts = new Map();
  for (const filename of filenames.sort()) {
    const status = await lstat(join(recordsDirectory, filename));
    artifacts.set(filename, {
      bytes: await readFile(join(recordsDirectory, filename), "utf8"),
      regular: true,
      mode: status.mode & 0o777,
    });
  }
  return {
    readme: await readFile(join(candidateRoot, "README.md"), "utf8"),
    manifestBytes: await readFile(join(candidateRoot, "manifest.json"), "utf8"),
    artifacts,
    now: new Date("2026-08-28T00:00:00Z"),
  };
}

function hasIssue(result, fragment) {
  assert.ok(
    result.issues.some((issue) => issue.includes(fragment)),
    JSON.stringify(result.issues),
  );
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

test("accepts the decision-free source-backed candidate packet", async () => {
  const input = await fixture();
  const result = validateCandidatePacket(input);
  assert.deepEqual(result.issues, []);
  assert.equal(result.candidateCount, 9);
});

test("rejects missing integrity boundaries and too few records", async () => {
  const input = await fixture();
  input.readme = "Status: preparation only";
  input.artifacts = new Map([...input.artifacts].slice(0, 7));
  const result = validateCandidatePacket(input);
  hasIssue(result, "missing integrity statement");
  hasIssue(result, "at least 8");
});

test("rejects malformed, noncanonical, duplicated, and unsafe records", async () => {
  const input = await fixture();
  const first = JSON.parse(input.artifacts.get("CAL-001.json").bytes);
  first.record_id = "CAL-002";
  first.title = "";
  first.abstract = "";
  first.publication_type = "";
  first.venue = "";
  first.publication_date = "2026-08-32";
  first.persistent_locator = "https://example.invalid/paper";
  first.evidence_location = "not a URL";
  first.captured_at_utc = "tomorrow";
  first.decision = "include";
  input.artifacts.set("CAL-001.json", {
    bytes: JSON.stringify(first),
    regular: false,
    mode: 0o755,
  });
  const second = JSON.parse(input.artifacts.get("CAL-002.json").bytes);
  second.persistent_locator = first.persistent_locator;
  input.artifacts.set("CAL-002.json", {
    bytes: JSON.stringify(second, null, 2) + "\n",
    regular: true,
    mode: 0o644,
  });
  const result = validateCandidatePacket(input);
  for (const fragment of [
    "must be a regular file",
    "must not be executable",
    "fields must exactly match",
    "canonical pretty JSON",
    "record_id must match",
    "record_id is duplicated",
    "title is empty",
    "abstract is empty",
    "publication_type is empty",
    "venue is empty",
    "real YYYY-MM-DD",
    "production DOI",
    "approved production metadata API",
    "canonical UTC",
  ]) {
    hasIssue(result, fragment);
  }
});

test("rejects post-cutoff and future candidate metadata", async () => {
  const input = await fixture();
  const first = JSON.parse(input.artifacts.get("CAL-001.json").bytes);
  first.publication_date = "2026-08-17";
  first.captured_at_utc = "2026-08-29T00:00:00Z";
  input.artifacts.set("CAL-001.json", {
    bytes: JSON.stringify(first, null, 2) + "\n",
    regular: true,
    mode: 0o644,
  });
  const result = validateCandidatePacket(input);
  hasIssue(result, "after the governed review cutoff");
  hasIssue(result, "cannot be in the future");
});

test("rejects a stale or malformed hash inventory", async () => {
  const input = await fixture();
  const manifest = JSON.parse(input.manifestBytes);
  manifest.status = "approved";
  manifest.readme_sha256 = "0".repeat(64);
  manifest.official_results_inspected = true;
  manifest.record_count = 8;
  manifest.records[0].record_path = "records/other.json";
  manifest.records[0].record_sha256 = "0".repeat(64);
  manifest.records[1].record_sha256 = "0".repeat(64);
  input.manifestBytes = JSON.stringify(manifest);
  const result = validateCandidatePacket(input);
  for (const fragment of [
    "canonical pretty JSON",
    "status must be",
    "readme_sha256 must match",
    "official_results_inspected=false",
    "record_count must match",
    "record_path does not match",
    "record_sha256 is duplicated",
    "digest is stale",
  ]) {
    hasIssue(result, fragment);
  }
});

test("rejects invalid manifest JSON", async () => {
  const input = await fixture();
  input.manifestBytes = "{";
  hasIssue(validateCandidatePacket(input), "manifest JSON is invalid");
  input.manifestBytes = Buffer.from([0x7b, 0xff, 0x7d]);
  hasIssue(validateCandidatePacket(input), "manifest bytes are not valid UTF-8");
});

test("rejects every valid JSON value that is not the manifest object", async () => {
  for (const value of [null, false, 0, "", []]) {
    const input = await fixture();
    input.manifestBytes = JSON.stringify(value) + "\n";
    hasIssue(
      validateCandidatePacket(input),
      "manifest fields must exactly match",
    );
  }
});

test("rejects calibration decisions hidden inside allowed free-text fields", async () => {
  for (const leakedText of [
    "Expected decision: exclude; reason code: E01; evidence class: contextual-only.",
    "The expected decision for CAL-001 is exclude.",
    "Expected outcome: include.",
    "Decision: include.",
    "Reviewer: Hiếu; approval is approved.",
  ]) {
    const input = await fixture();
    const record = JSON.parse(input.artifacts.get("CAL-001.json").bytes);
    record.abstract = leakedText;
    const bytes = JSON.stringify(record, null, 2) + "\n";
    input.artifacts.set("CAL-001.json", {
      bytes,
      regular: true,
      mode: 0o644,
    });
    const manifest = JSON.parse(input.manifestBytes);
    manifest.records[0].record_sha256 = sha256(bytes);
    input.manifestBytes = JSON.stringify(manifest, null, 2) + "\n";
    const result = validateCandidatePacket(input);
    assert.deepEqual(
      result.issues,
      [
        "candidate CAL-001.json contains calibration decision or reviewer-governance leakage",
      ],
    );
  }
});

test("rejects decision mappings in README even when its digest is updated", async () => {
  const input = await fixture();
  input.readme += "\nExpected decision: CAL-001 = exclude (E01); CAL-002 = include.\n";
  const manifest = JSON.parse(input.manifestBytes);
  manifest.readme_sha256 = sha256(input.readme);
  input.manifestBytes = JSON.stringify(manifest, null, 2) + "\n";
  const result = validateCandidatePacket(input);
  hasIssue(result, "README contains calibration decision");
  hasIssue(result, "README must match the canonical preparation-only template");
});

test("rejects contradictory README status even when its digest is updated", async () => {
  const input = await fixture();
  input.readme +=
    "\nStatus: approved governed pilot evidence. This is now a pilot set and an approval. Official results were inspected.\n";
  const manifest = JSON.parse(input.manifestBytes);
  manifest.readme_sha256 = sha256(input.readme);
  input.manifestBytes = JSON.stringify(manifest, null, 2) + "\n";
  hasIssue(
    validateCandidatePacket(input),
    "README must match the canonical preparation-only template",
  );
});

test("rejects non-object and invalid UTF-8 record bytes without throwing", async () => {
  for (const value of [null, false, 0, "", []]) {
    const input = await fixture();
    const bytes = Buffer.from(JSON.stringify(value) + "\n");
    input.artifacts.set("CAL-001.json", {
      bytes,
      regular: true,
      mode: 0o644,
    });
    const manifest = JSON.parse(input.manifestBytes);
    manifest.records[0].record_sha256 = sha256(bytes);
    input.manifestBytes = JSON.stringify(manifest, null, 2) + "\n";
    assert.deepEqual(
      validateCandidatePacket(input).issues,
      ["candidate CAL-001.json fields must exactly match schema 1.1.0"],
    );
  }

  const input = await fixture();
  const bytes = Buffer.from([0x7b, 0xff, 0x7d]);
  input.artifacts.set("CAL-001.json", {
    bytes,
    regular: true,
    mode: 0o644,
  });
  const manifest = JSON.parse(input.manifestBytes);
  manifest.records[0].record_sha256 = sha256(bytes);
  input.manifestBytes = JSON.stringify(manifest, null, 2) + "\n";
  hasIssue(validateCandidatePacket(input), "bytes are not valid UTF-8");
});

test("accepts provider-neutral non-executable file modes", async () => {
  const input = await fixture();
  input.artifacts.get("CAL-001.json").mode = 0o666;
  assert.deepEqual(validateCandidatePacket(input).issues, []);
});

test("binds every evidence API record to the same DOI", async () => {
  const input = await fixture();
  const first = JSON.parse(input.artifacts.get("CAL-001.json").bytes);
  first.evidence_location =
    "https://api.openalex.org/works/https://doi.org/10.1002%2Fsmr.2423";
  input.artifacts.set("CAL-001.json", {
    bytes: JSON.stringify(first, null, 2) + "\n",
    regular: true,
    mode: 0o644,
  });
  const second = JSON.parse(input.artifacts.get("CAL-002.json").bytes);
  second.persistent_locator = "https://doi.org/10.1000/%E0%A4%A";
  input.artifacts.set("CAL-002.json", {
    bytes: JSON.stringify(second, null, 2) + "\n",
    regular: true,
    mode: 0o644,
  });
  const third = JSON.parse(input.artifacts.get("CAL-003.json").bytes);
  third.persistent_locator = "https://doi.org/";
  input.artifacts.set("CAL-003.json", {
    bytes: JSON.stringify(third, null, 2) + "\n",
    regular: true,
    mode: 0o644,
  });
  const fourth = JSON.parse(input.artifacts.get("CAL-004.json").bytes);
  fourth.evidence_location += "?api_key=SUPERSECRET#ignored";
  input.artifacts.set("CAL-004.json", {
    bytes: JSON.stringify(fourth, null, 2) + "\n",
    regular: true,
    mode: 0o644,
  });
  const fifth = JSON.parse(input.artifacts.get("CAL-005.json").bytes);
  fifth.evidence_location = fifth.evidence_location.replace(
    "api.openalex.org",
    "api.openalex.org:444",
  );
  input.artifacts.set("CAL-005.json", {
    bytes: JSON.stringify(fifth, null, 2) + "\n",
    regular: true,
    mode: 0o644,
  });
  const result = validateCandidatePacket(input);
  hasIssue(result, "evidence_location DOI must match persistent_locator");
  hasIssue(result, "persistent_locator must be a production DOI");
  hasIssue(result, "evidence_location must use an approved production metadata API");
  assert.ok(!result.issues.join("\n").includes("SUPERSECRET"));
});

test("rejects normalized DOI and publication identity duplicates", async () => {
  const input = await fixture();
  const first = JSON.parse(input.artifacts.get("CAL-001.json").bytes);
  const second = JSON.parse(input.artifacts.get("CAL-002.json").bytes);
  second.persistent_locator = "https://doi.org/10.1002/SPE.931";
  second.evidence_location =
    "https://api.openalex.org/works/https://doi.org/10.1002%2FSPE.931";
  second.title = "  " + first.title.normalize("NFKC").toUpperCase() + "  ";
  second.publication_date = first.publication_date;
  second.publication_type = first.publication_type.toUpperCase();
  second.venue = first.venue.toUpperCase();
  const bytes = JSON.stringify(second, null, 2) + "\n";
  input.artifacts.set("CAL-002.json", {
    bytes,
    regular: true,
    mode: 0o644,
  });
  const manifest = JSON.parse(input.manifestBytes);
  manifest.records[1].record_sha256 = sha256(bytes);
  input.manifestBytes = JSON.stringify(manifest, null, 2) + "\n";
  const result = validateCandidatePacket(input);
  hasIssue(result, "persistent_locator is duplicated");
  hasIssue(result, "duplicates a normalized publication record");
});

test("rejects invalid JSON and invalid filenames", async () => {
  const input = await fixture();
  input.artifacts.set("candidate.json", {
    bytes: "{",
    regular: true,
    mode: 0o644,
  });
  const result = validateCandidatePacket(input);
  hasIssue(result, "filename must match CAL-NNN.json");
  hasIssue(result, "JSON is invalid");
});

test("runs the real packet through the CLI entry point", async () => {
  const output = [];
  const errors = [];
  let exitCode = null;
  const result = await main({
    repositoryDirectory,
    now: new Date("2026-08-28T00:00:00Z"),
    log: (message) => output.push(message),
    error: (message) => errors.push(message),
    setExitCode: (code) => { exitCode = code; },
  });
  assert.deepEqual(result.issues, []);
  assert.equal(exitCode, null);
  assert.deepEqual(errors, []);
  assert.ok(output.some((message) => message.includes("preparation only")));
});

test("fails closed when the candidate packet cannot be loaded", async () => {
  const temporary = await mkdtemp(join(tmpdir(), "archsync-candidates-"));
  const errors = [];
  let exitCode = null;
  try {
    const result = await main({
      repositoryDirectory: temporary,
      error: (message) => errors.push(message),
      setExitCode: (code) => { exitCode = code; },
    });
    assert.equal(result.candidateCount, 0);
    assert.equal(exitCode, 1);
    assert.ok(errors.some((message) => message.includes("cannot load")));
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});

test("fails closed on unexpected packet inventory", async () => {
  const temporary = await mkdtemp(join(tmpdir(), "archsync-candidates-"));
  const destination = join(temporary, CANDIDATE_ROOT);
  const records = join(destination, "records");
  const errors = [];
  let exitCode = null;
  try {
    await mkdir(records, { recursive: true });
    await writeFile(
      join(destination, "README.md"),
      await readFile(join(candidateRoot, "README.md"), "utf8"),
      "utf8",
    );
    await writeFile(
      join(destination, "manifest.json"),
      await readFile(join(candidateRoot, "manifest.json"), "utf8"),
      "utf8",
    );
    await writeFile(join(destination, "unexpected.txt"), "unexpected\n", "utf8");
    for (const [filename, artifact] of (await fixture()).artifacts) {
      await writeFile(join(records, filename), artifact.bytes, "utf8");
    }
    const result = await main({
      repositoryDirectory: temporary,
      now: new Date("2026-08-28T00:00:00Z"),
      error: (message) => errors.push(message),
      setExitCode: (code) => { exitCode = code; },
    });
    hasIssue(result, "root must contain exactly");
    assert.equal(exitCode, 1);
    assert.ok(errors.some((message) => message.includes("INVALID")));
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});
