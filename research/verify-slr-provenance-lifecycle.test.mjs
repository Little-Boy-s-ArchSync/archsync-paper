import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash, generateKeyPairSync, sign } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { freezeLiteratureProtocol } from "./freeze-literature-protocol.mjs";
import { loadExpandedManuscript } from "./load-manuscript.mjs";
import { loadSlrCandidateFixture } from "./test-support/slr-candidate-fixture.mjs";
import { createSentinelEvidenceFixture } from "./test-support/slr-sentinel-fixture.mjs";
import { REVIEW_CHECKLIST, REVIEWER_NAME, REVIEWER_ORCID, REVIEWER_OPERATOR_LOGIN, SIGNED_REVIEW_PATHS } from "./verify-slr-signed-attestation.mjs";
import { LOCK_PATHS } from "./validate-slr-103-codebook-lock.mjs";
import { gitEvidence, main, verifySlrProvenanceLifecycle } from "./verify-slr-provenance-lifecycle.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const repo = "Little-Boy-s-ArchSync/archsync-paper";
const recordPath = "research/slr-review-record.md";
const timestamp = "2026-09-12T12:00:00Z";
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");

async function fixture(t) {
  const directory = await mkdtemp(join(tmpdir(), "archsync-synthetic-lifecycle-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const run = (...args) => execFileSync("git", args, { cwd: directory, encoding: "utf8",
    env: { ...process.env, GIT_AUTHOR_DATE: "2026-09-12T11:00:00Z", GIT_COMMITTER_DATE: "2026-09-12T11:00:00Z" }, stdio: ["ignore", "pipe", "pipe"] }).trim();
  const write = async (path, bytes) => { await mkdir(dirname(join(directory, path)), { recursive: true }); await writeFile(join(directory, path), bytes); };
  const commit = (message) => { run("add", "."); run("commit", "-m", message); return run("rev-parse", "HEAD"); };
  run("init", "-b", "main"); run("config", "user.name", "Synthetic test"); run("config", "user.email", "synthetic@example.invalid");
  run("config", "commit.gpgsign", "false");
  // Keep synthetic Git-object bytes platform-neutral. A developer's global
  // core.autocrlf setting must not rewrite signed fixture bytes on checkout.
  run("config", "core.autocrlf", "false");
  const candidate = await loadSlrCandidateFixture();
  const source = { ...candidate, ...createSentinelEvidenceFixture() };
  for (const [key, path] of Object.entries({ baseline: "research/RESEARCH.md", traceability: "research/RQ-TRACEABILITY.md", bibliography: "references.bib" })) {
    source[key] = await readFile(join(root, path), "utf8"); await write(path, source[key]);
  }
  source.paper = await loadExpandedManuscript(root);
  await write("main.tex", source.paper);
  await write("research/literature-protocol.md", source.protocol);
  await write("research/decision-log.md", source.decisions);
  await write("research/literature-sentinel-recall.csv", source.sentinelRecall);
  for (const path of [
    "research/literature-screening-criteria.md",
    "research/literature-screening-criteria.csv",
    "research/literature-screening-calibration.json",
  ]) await write(path, await readFile(join(root, path)));
  for (const [path, bytes] of source.sentinelEvidenceArtifacts) await write(path, bytes);
  await write("research/phase-gate-register.csv", "gate_id,phase,decision,decision_date,owner,evidence,open_blocker,next_action\nPG-OLD,P0,HOLD,2026-09-11,Hiếu,pending,review,wait\n");
  await write("research/MEETING-CADENCE.md", "# Historical weekly decision\n2026-09-11: HOLD; freeze pending.\n");
  for (const path of ["research/EXTERNAL-BASELINE-PROTOCOL.md", "research/statistical-analysis-plan.md", "research/validate-research-quality-gates.mjs"]) {
    let bytes = await readFile(join(root, path), "utf8");
    // PR32 is immutable historical evidence. Later versioned amendments may
    // legitimately change the same metadata markers, so reconstruct only the
    // exact post-PR32 hunk bytes in this synthetic repository before replaying
    // the retained public patch. The patch and its pinned digest stay unchanged.
    if (path === "research/EXTERNAL-BASELINE-PROTOCOL.md") {
      bytes = bytes
        .replace("| Protocol version | 0.2.0 |", "| Protocol version | 0.1.1 |")
        .replace(
          /^Revision 0\.2\.0 \([^\n]+$/m,
          "Revision 0.1.1 (2026-09-12) synchronizes the operational task owner with the current main plan. Comparator selection, D3 freeze and Hiếu's required approval retain their existing gates. The protocol remains proposed and unexecuted.",
        );
    }
    if (path === "research/validate-research-quality-gates.mjs") {
      bytes = bytes.replace('"| Protocol version | 0.2.0 |"', '"| Protocol version | 0.1.1 |"');
    }
    await write(path, bytes);
  }
  const keys = generateKeyPairSync("ed25519");
  const publicKeyBytes = Buffer.from(keys.publicKey.export({ format: "pem", type: "spki" }));
  await write(SIGNED_REVIEW_PATHS.publicKey, publicKeyBytes);
  const reviewed = commit("Synthetic reviewed candidate and test-only public key");
  const attestationBytes = Buffer.from(JSON.stringify({ schema_version: "1.1.0", task: "SLR-101", reviewer: "Independent SLR Reviewer",
    reviewer_name: REVIEWER_NAME, reviewer_orcid: REVIEWER_ORCID, operator_login: REVIEWER_OPERATOR_LOGIN,
    protocol_author: false, review_decision: "Approved", review_commit: reviewed, review_timestamp: timestamp,
    search_results_inspected: false, sentinel_recall: "Passed", checklist: [...REVIEW_CHECKLIST] }) + "\n");
  const signatureBytes = Buffer.from(sign(null, attestationBytes, keys.privateKey).toString("base64") + "\n");
  const record = `# Synthetic SLR Review\n\n| Field | Value |\n| --- | --- |\n| Task | SLR-101 |\n| Protocol version | 1.0.0 |\n| Review mode | Signed attestation |\n| Review PR | https://github.com/${repo}/pull/26 |\n| Reviewer role | Independent SLR Reviewer |\n| Reviewer name | ${REVIEWER_NAME} |\n| Reviewer ORCID | ${REVIEWER_ORCID} |\n| Operator GitHub login | ${REVIEWER_OPERATOR_LOGIN} |\n| Protocol author | No |\n| Review decision | Approved |\n| Review commit | ${reviewed} |\n| Review timestamp | ${timestamp} |\n| Search results inspected | No |\n| Sentinel recall | Passed |\n| Review attestation | ${SIGNED_REVIEW_PATHS.attestation}#sha256=${digest(attestationBytes)} |\n| Review signature | ${SIGNED_REVIEW_PATHS.signature}#sha256=${digest(signatureBytes)} |\n| Reviewer public key | ${SIGNED_REVIEW_PATHS.publicKey}#sha256=${digest(publicKeyBytes)} |\n`;
  source.reviewRecord = record;
  const frozen = freezeLiteratureProtocol(source);
  assert.deepEqual(frozen.issues, []);
  run("switch", "-c", "freeze");
  await write(recordPath, record); await write(SIGNED_REVIEW_PATHS.attestation, attestationBytes); await write(SIGNED_REVIEW_PATHS.signature, signatureBytes);
  await write("research/literature-protocol.md", frozen.protocol); await write("research/decision-log.md", frozen.decisions);
  const freeze = commit("Synthetic five-file freeze");
  run("switch", "main");
  await write("README.md", "Independent administrative work\n"); commit("Concurrent main change");
  run("merge", "--no-ff", "freeze", "-m", "Synthetic accepted merge");
  const merged = run("rev-parse", "HEAD");
  run("switch", "-c", "follow-up");
  await write("README.md", "Later administrative work\n");
  const current = commit("Subsequent PR");
  const originalPull = { number: 26, state: "closed", merged: true, head: { sha: freeze }, merge_commit_sha: merged,
    base: { ref: "main", repo: { full_name: repo }, sha: reviewed } };
  const currentPull = { number: 32, user: { login: "synthetic-author" }, state: "open", merged: false, head: { sha: current }, merge_commit_sha: current,
    base: { ref: "main", repo: { full_name: repo }, sha: merged } };
  const approval = (head, login = "test-reviewer") => ({ state: "APPROVED", commit_id: head, user: { login }, author_association: "MEMBER" });
  const requests = [];
  const requestJson = async (path) => {
    requests.push(path);
    if (path.endsWith("/pulls/26")) return originalPull;
    if (path.endsWith("/pulls/32")) return currentPull;
    if (path.includes("/pulls/26/reviews?")) return [approval(originalPull.head.sha)];
    if (path.includes("/pulls/32/reviews?")) return [approval(currentPull.head.sha, "L1nkinPark")];
    if (path.endsWith(`/commits/${reviewed}`)) return { sha: reviewed, commit: { committer: { date: "2026-09-12T11:00:00Z" } } };
    if (path.includes("/commits/") && path.includes("/pulls?")) return [];
    if (path.endsWith("/branches/main")) return { commit: { sha: currentPull.base.sha } };
    if (path.includes("/compare/")) return { status: "ahead", files: [...Object.values(SIGNED_REVIEW_PATHS).filter((p) => p !== SIGNED_REVIEW_PATHS.publicKey), recordPath, "research/decision-log.md", "research/literature-protocol.md"].map((filename) => ({ filename })) };
    throw new Error(`unexpected API path ${path}`);
  };
  const environment = { GITHUB_EVENT_NAME: "pull_request", SLR_CURRENT_PR: "32", SLR_CURRENT_COMMIT: current };
  const verify = (overrides = {}) => verifySlrProvenanceLifecycle({ environment, requestJson, git: gitEvidence(directory), ...overrides });
  const change = async (path, value) => { await write(path, value); const next = commit(`Synthetic change ${path}`); currentPull.head.sha = next; currentPull.merge_commit_sha = next; environment.SLR_CURRENT_COMMIT = next; return next; };
  return { directory, run, write, commit, change, source, frozen, record, reviewed, freeze, merged, current, originalPull, currentPull, approval, requests, requestJson, environment, verify };
}
const invalid = (result, pattern) => { assert.ok(result.issues.length > 0); assert.match(result.issues.join("\n"), pattern); };

async function mainPhaseSyncFixture(t) {
  const f = await fixture(t);
  f.run("switch", "-c", "phase-correction", f.merged);
  for (const [path, addition] of [
    ["research/MEETING-CADENCE.md", `\n2026-09-13: freeze accepted; HOLD retained. https://github.com/${repo}/pull/40\n`],
    ["research/phase-gate-register.csv", `PG-NEW,P0,HOLD,2026-09-13,Hiếu,https://github.com/${repo}/pull/40,search incomplete,wait\n`],
  ]) await f.write(path, await readFile(join(f.directory, path), "utf8") + addition);
  const phaseHead = f.commit("Phase correction approved in a separate PR");
  f.run("switch", "main");
  f.run("merge", "--no-ff", "phase-correction", "-m", "Accepted owner-approved correction");
  const phaseMerge = f.run("rev-parse", "HEAD");
  // The imported main parent may be later than the original phase PR merge.
  await f.write("main-admin.md", "Unrelated work after phase acceptance\n");
  const mainParent = f.commit("Main advances without another phase decision");
  f.run("switch", "follow-up");
  f.run("merge", "--no-ff", "main", "-m", "Sync approved main into owner-authored PR");
  const sync = f.run("rev-parse", "HEAD");
  const setHead = (head) => {
    f.currentPull.head.sha = head; f.currentPull.merge_commit_sha = head;
    f.environment.SLR_CURRENT_COMMIT = head;
  };
  setHead(sync);
  f.currentPull.user.login = "L1nkinPark";
  f.currentPull.base.sha = mainParent;
  const phasePull = { number: 40, user: { login: "another-author" }, state: "closed", merged: true,
    head: { sha: phaseHead }, merge_commit_sha: phaseMerge,
    base: { ref: "main", repo: { full_name: repo }, sha: f.merged } };
  let ownerReviewReads = 0;
  const requestJson = async (path) => {
    if (path.endsWith("/pulls/40")) return phasePull;
    if (path.includes("/pulls/40/reviews?")) {
      ownerReviewReads += 1;
      return [f.approval(phaseHead, "L1nkinPark")];
    }
    if (path.includes("/pulls/32/reviews?")) return [f.approval(f.currentPull.head.sha, "independent-reviewer")];
    if ([phaseHead, phaseMerge].some((commit) => path.includes(`/commits/${commit}/pulls?`))) return [{ number: 40 }];
    if (path.includes(`/commits/${sync}/pulls?`)) return [{ number: 32 }];
    return f.requestJson(path);
  };
  return { ...f, phaseHead, phaseMerge, mainParent, sync, phasePull, setHead, requestJson,
    ownerReviewReads: () => ownerReviewReads };
}

test("real Git merge history permits PR32-style proposed owner metadata and preserves the signed source", async (t) => {
  const f = await fixture(t);
  // Exact public PR32 delta from 159ea31 to 287ca6b, applied to synthetic history.
  const patchPath = join(root, "research/test-support/pr32-owner-metadata.patch");
  assert.equal(digest(await readFile(patchPath)), "54fdaca35b2b76bb5d7b82f31f00237c8b95ec53ae20d900b949fe1d00ea1e25");
  // Replay against retained pre-PR32 bytes, not evolving proposed protocols.
  // This preserves the public patch and its digest after later protocol revisions.
  const historicalRoot = join(root, "research/test-support/pr32-before-owner-metadata");
  const historical = JSON.parse(await readFile(join(historicalRoot, "provenance.json"), "utf8"));
  assert.equal(historical.source_commit, "159ea318aa8ab17a499e29462fe2dbb8bcdaa7d0");
  for (const [name, hash] of Object.entries(historical.sha256)) {
    const bytes = await readFile(join(historicalRoot, name));
    assert.equal(digest(bytes), hash, name);
    await writeFile(join(f.directory, "research", name), bytes);
  }
  f.commit("Restore exact pre-PR32 test inputs");
  f.run("apply", "--check", patchPath);
  f.run("apply", patchPath);
  const current = f.commit("Apply exact published PR32 owner metadata patch");
  f.currentPull.head.sha = current; f.currentPull.merge_commit_sha = current; f.environment.SLR_CURRENT_COMMIT = current;
  const result = await f.verify(); assert.deepEqual(result.issues, []); assert.equal(result.mode, "historical"); assert.equal(result.reviewed, f.reviewed);
  assert.equal(await readFile(join(f.directory, recordPath), "utf8"), f.record);
});

test("initial freeze retains live open-PR/head checks and the strict five-file scope", async (t) => {
  const f = await fixture(t); f.run("checkout", "--detach", f.freeze);
  Object.assign(f.originalPull, { state: "open", merged: false, merge_commit_sha: f.freeze });
  const environment = { ...f.environment, SLR_CURRENT_PR: "26", SLR_CURRENT_COMMIT: f.freeze };
  assert.deepEqual((await f.verify({ environment })).issues, []);
  const requestJson = async (path) => path.includes("/compare/") ? { status: "ahead", files: [{ filename: "README.md" }] } : f.requestJson(path);
  invalid(await f.verify({ environment, requestJson }), /new review is required/);
  f.originalPull.state = "closed";
  invalid(await f.verify({ environment }), /open PR/);
});

test("actual main push, dispatch and GitHub PR test-merge checkout contexts", async (t) => {
  const f = await fixture(t);
  f.currentPull.base.sha = f.current;
  for (const event of ["push", "workflow_dispatch"]) {
    assert.deepEqual((await f.verify({ environment: { GITHUB_EVENT_NAME: event, GITHUB_REF: "refs/heads/main", SLR_CURRENT_COMMIT: f.current } })).issues, []);
  }
  f.currentPull.base.sha = f.merged;
  f.run("checkout", "--detach", f.merged); f.run("merge", "--no-ff", "follow-up", "-m", "Synthetic GitHub test merge");
  f.currentPull.merge_commit_sha = f.run("rev-parse", "HEAD");
  assert.deepEqual((await f.verify()).issues, []);
  await f.write("research/literature-protocol.md", f.frozen.protocol + "\nDisguised merge method change\n");
  f.currentPull.merge_commit_sha = f.commit("Alter test merge");
  invalid(await f.verify(), /frozen method\/evidence changed/);
});

test("regenerated GitHub test merge accepts only the same full tree and exact current parents", async (t) => {
  const f = await fixture(t);
  const tree = f.run("rev-parse", `${f.current}^{tree}`);
  const merge = (parents, message, contentTree = tree) => f.run("commit-tree", contentTree,
    ...parents.flatMap((parent) => ["-p", parent]), "-m", message);
  const parents = [f.merged, f.current];
  const eventMerge = merge(parents, "Original event merge");
  const latestMerge = merge(parents, "Regenerated API merge");
  assert.notEqual(eventMerge, latestMerge);
  f.currentPull.merge_commit_sha = latestMerge;
  f.run("checkout", "--detach", eventMerge);
  assert.deepEqual((await f.verify()).issues, []);

  for (const badParents of [[f.reviewed, f.current], [f.merged, f.freeze],
    [f.current, f.merged], [f.current], [f.merged, f.current, f.reviewed]]) {
    f.run("checkout", "--detach", merge(badParents, "Wrong checkout parents"));
    invalid(await f.verify(), /checkout is neither/);
  }
  f.run("checkout", "--detach", eventMerge);
  f.currentPull.merge_commit_sha = merge([f.reviewed, f.current], "Wrong API merge parents");
  invalid(await f.verify(), /checkout is neither/);
  f.currentPull.merge_commit_sha = latestMerge;
  await f.write("README.md", "Changed unprotected bytes still invalidate merge equivalence\n");
  f.run("add", "README.md");
  const changedTree = f.run("write-tree");
  f.run("checkout", "--detach", "--force", merge(parents, "Wrong checkout tree", changedTree));
  invalid(await f.verify(), /checkout is neither/);
  f.run("checkout", "--detach", eventMerge);
  f.currentPull.merge_commit_sha = merge(parents, "Wrong API merge tree", changedTree);
  invalid(await f.verify(), /checkout is neither/);
  f.currentPull.merge_commit_sha = latestMerge;
  f.environment.SLR_CURRENT_COMMIT = f.freeze;
  invalid(await f.verify(), /current event does not identify/);
});

test("regenerated merge preserves exact-head approval and phase-owner review gates", async (t) => {
  const f = await fixture(t);
  const path = "research/MEETING-CADENCE.md";
  await f.write(path, await readFile(join(f.directory, path), "utf8") +
    `\n2026-09-13: correction; HOLD retained. https://github.com/${repo}/pull/26\n`);
  const head = f.commit("Owner-reviewed phase correction");
  f.currentPull.head.sha = head; f.environment.SLR_CURRENT_COMMIT = head;
  const tree = f.run("rev-parse", `${head}^{tree}`);
  const merge = (message) => f.run("commit-tree", tree, "-p", f.merged, "-p", head, "-m", message);
  const eventMerge = merge("Original phase event merge");
  f.currentPull.merge_commit_sha = merge("Regenerated phase API merge");
  f.run("checkout", "--detach", eventMerge);
  assert.deepEqual((await f.verify()).issues, []);
  const requestJson = async (path) => path.includes("/pulls/32/reviews?") ? [] : f.requestJson(path);
  invalid(await f.verify({ requestJson }), /accepted exact-head GitHub approval/);
  const ordinaryReview = async (path) => path.includes("/pulls/32/reviews?") ?
    [f.approval(head)] : f.requestJson(path);
  invalid(await f.verify({ requestJson: ordinaryReview }), /requires Hiếu's exact-head approval/);
});

test("approved phase correction survives an exact GitHub PR test merge", async (t) => {
  const f = await fixture(t);
  const path = "research/MEETING-CADENCE.md";
  const original = await readFile(join(f.directory, path), "utf8");
  const addition = `\n2026-09-13: correction to pending-freeze statement; HOLD retained. https://github.com/${repo}/pull/26\n`;
  await f.write(path, original + addition);
  const phaseHead = f.commit("Phase correction on current PR");
  f.currentPull.base.sha = f.merged;
  f.currentPull.head.sha = phaseHead;
  f.environment.SLR_CURRENT_COMMIT = phaseHead;
  f.run("checkout", "--detach", f.merged);
  f.run("merge", "--no-ff", "follow-up", "-m", "Synthetic GitHub test merge with phase correction");
  const testMerge = f.run("rev-parse", "HEAD");
  f.currentPull.merge_commit_sha = testMerge;
  assert.deepEqual((await f.verify()).issues, []);

  await f.write(path, original + addition + "Unreviewed merge resolution.\n");
  const altered = f.commit("Unreviewed test-merge phase resolution");
  f.currentPull.merge_commit_sha = altered;
  invalid(await f.verify(), /requires Hiếu's exact-head approval/);
});

test("a separately reviewed exact SLR-103 codebook lock may be appended without changing frozen rules", async (t) => {
  const f = await fixture(t);
  for (const path of LOCK_PATHS) await f.write(path, await readFile(join(root, path)));
  const current = f.commit("Append exact reviewed SLR-103 codebook release lock");
  f.currentPull.head.sha = current;
  f.currentPull.merge_commit_sha = current;
  f.environment.SLR_CURRENT_COMMIT = current;
  const accepted = await f.verify();
  assert.deepEqual(accepted.issues, []);

  await f.write(LOCK_PATHS[0], Buffer.concat([await readFile(join(f.directory, LOCK_PATHS[0])), Buffer.from("\nChanged after review.\n")]));
  const tampered = f.commit("Tamper with the release-lock explanation");
  f.currentPull.head.sha = tampered;
  f.currentPull.merge_commit_sha = tampered;
  f.environment.SLR_CURRENT_COMMIT = tampered;
  invalid(await f.verify(), /invalid SLR-103 codebook lock/);
});

test("candidate contexts skip only while both trusted base and event have no freeze", async (t) => {
  const f = await fixture(t); f.run("checkout", "--detach", f.reviewed);
  Object.assign(f.currentPull, { head: { sha: f.reviewed }, merge_commit_sha: f.reviewed, base: { ...f.currentPull.base, sha: f.reviewed } });
  f.environment.SLR_CURRENT_COMMIT = f.reviewed;
  assert.equal((await f.verify()).mode, "candidate");
  f.currentPull.base.sha = f.merged;
  invalid(await f.verify(), /record was removed/);
});

test("unmerged, wrong-repository, wrong-base and unrelated freeze evidence fail closed", async (t) => {
  const f = await fixture(t);
  const original = structuredClone(f.originalPull);
  for (const [patch, pattern] of [[{ merged: false }, /not accepted/], [{ state: "open" }, /not accepted/],
    [{ number: 99 }, /not accepted/], [{ base: { ref: "other", repo: { full_name: repo } } }, /not accepted/],
    [{ base: { ref: "main", repo: { full_name: "someone/else" } } }, /not accepted/],
    [{ merge_commit_sha: f.current }, /unrelated/], [{ head: { sha: "bad" } }, /not accepted/]]) {
    Object.assign(f.originalPull, original, patch); invalid(await f.verify(), pattern);
  }
  Object.assign(f.originalPull, original);
  f.currentPull.base.sha = f.reviewed; invalid(await f.verify(), /unrelated/);
});

test("exact accepted review, pagination, unresolved changes and API failure are checked", async (t) => {
  const f = await fixture(t);
  for (const reviews of [[], [f.approval(f.reviewed)], [{ ...f.approval(f.freeze), author_association: "NONE" }],
    [f.approval(f.freeze), { ...f.approval(f.freeze), state: "DISMISSED" }],
    [f.approval(f.freeze), { ...f.approval(f.reviewed, "other"), state: "CHANGES_REQUESTED" }]]) {
    invalid(await f.verify({ requestJson: (path) => path.includes("/pulls/26/reviews?") ? reviews : f.requestJson(path) }), /approval|changes-requested/);
  }
  const requestJson = (path) => path.includes("/pulls/26/reviews?") ? (path.endsWith("page=1") ? Array.from({ length: 100 }, (_, i) => ({ state: "COMMENTED", user: { login: `user-${i}` } })) : [f.approval(f.freeze)]) : f.requestJson(path);
  assert.deepEqual((await f.verify({ requestJson })).issues, []);
  invalid(await f.verify({ requestJson: async () => { throw new Error("API offline"); } }), /API offline/);
});

test("tampered original records, keys, signatures, attestations and frozen methods cannot inherit approval", async (t) => {
  const f = await fixture(t);
  for (const path of [recordPath, ...Object.values(SIGNED_REVIEW_PATHS), "research/literature-protocol.md", "research/literature-sentinel-recall.csv", "research/evidence/slr-new-method.json"]) {
    f.run("checkout", "--detach", f.current);
    await f.change(path, "Tampered administrative assertion\n");
    invalid(await f.verify(), /invalid original freeze PR|frozen method\/evidence changed/);
  }
  f.run("checkout", "--detach", f.current);
  await f.change(recordPath, f.record.replace("/pull/26", "/pull/99"));
  invalid(await f.verify(), /unexpected API/);
});

test("self-consistent replacement of original signed artifacts does not establish an accepted freeze", async (t) => {
  const f = await fixture(t);
  f.run("checkout", "--detach", f.freeze);
  await f.write(SIGNED_REVIEW_PATHS.signature, "AAAA\n");
  const record = f.record.replace(/(Review signature \| [^#]+#sha256=)[0-9a-f]+/, `$1${digest(Buffer.from("AAAA\n"))}`);
  await f.write(recordPath, record);
  const tampered = f.commit("Synthetic signature forgery");
  f.originalPull.head.sha = tampered;
  f.originalPull.merge_commit_sha = tampered;
  f.currentPull.base.sha = tampered; f.currentPull.head.sha = tampered; f.currentPull.merge_commit_sha = tampered; f.environment.SLR_CURRENT_COMMIT = tampered;
  invalid(await f.verify(), /Ed25519 signature verification failed/);
});

test("same-file method edits during the original five-file transition are rejected", async (t) => {
  const f = await fixture(t);
  f.run("checkout", "--detach", f.freeze);
  await f.change("research/literature-protocol.md", f.frozen.protocol + "\nUnauthorized criteria disguised as freeze bookkeeping.\n");
  f.originalPull.head.sha = f.environment.SLR_CURRENT_COMMIT;
  f.originalPull.merge_commit_sha = f.environment.SLR_CURRENT_COMMIT; f.currentPull.base.sha = f.environment.SLR_CURRENT_COMMIT;
  invalid(await f.verify(), /non-mechanical original freeze/);
});

test("phase corrections retain historical HOLD and need Hiếu's actual exact-head decision", async (t) => {
  const f = await fixture(t);
  const path = "research/MEETING-CADENCE.md";
  const original = await readFile(join(f.directory, path), "utf8");
  await f.change(path, original + "\n2026-09-13 correction to 2026-09-11 freeze-pending statement: freeze accepted; P0 remains HOLD pending owner decision. https://github.com/" + repo + "/pull/26\n");
  assert.deepEqual((await f.verify()).issues, []);
  const requestJson = (path) => path.includes("/pulls/32/reviews?") ? [f.approval(f.currentPull.head.sha, "someone-else")] : f.requestJson(path);
  invalid(await f.verify({ requestJson }), /requires Hiếu's exact-head approval/);
  await f.change(path, original.replace("HOLD", "GO"));
  invalid(await f.verify(), /historical phase decisions/);
});

test("named phase-owner approval remains valid when workflow membership metadata is unavailable", async (t) => {
  const f = await fixture(t);
  const path = "research/MEETING-CADENCE.md";
  const original = await readFile(join(f.directory, path), "utf8");
  await f.change(path, original + "\n2026-09-13 correction to freeze status; P0 remains HOLD. https://github.com/" + repo + "/pull/32\n");
  const requestJson = (requestPath) => requestPath.includes("/pulls/32/reviews?")
    ? [{ ...f.approval(f.currentPull.head.sha, "L1nkinPark"), author_association: "NONE" }]
    : f.requestJson(requestPath);
  assert.deepEqual((await f.verify({ requestJson })).issues, []);
});

test("main retains accountable review for inherited phase corrections", async (t) => {
  const f = await fixture(t);
  const path = "research/phase-gate-register.csv";
  const original = await readFile(join(f.directory, path), "utf8");
  const current = await f.change(path, original + `PG-NEW,P0,HOLD,2026-09-13,Hiếu,https://github.com/${repo}/pull/26,owner decision pending,wait\n`);
  f.currentPull.merged = true; f.currentPull.state = "closed"; f.currentPull.base.sha = current;
  const requestJson = (path) => path.includes("/commits/") && path.includes("/pulls?") ? [{ number: 32 }] : f.requestJson(path);
  assert.deepEqual((await f.verify({ requestJson, environment: { GITHUB_EVENT_NAME: "push", GITHUB_REF: "refs/heads/main", SLR_CURRENT_COMMIT: current } })).issues, []);
});

test("owner-authored PR inherits unchanged main phase state and rechecks the original owner review", async (t) => {
  const f = await mainPhaseSyncFixture(t);
  const git = gitEvidence(f.directory);
  assert.ok((await git.phaseCommits(f.merged, f.sync)).includes(f.sync));
  // This is the previous first-parent failure: the sync commit belongs only
  // to the owner-authored PR, where no owner self-approval is available.
  const withoutInheritance = { ...git, identity: async (commit) => {
    const identity = await git.identity(commit);
    return commit === f.sync ? { ...identity, parents: [] } : identity;
  } };
  invalid(await f.verify({ requestJson: f.requestJson, git: withoutInheritance }), /requires Hiếu's exact-head approval/);
  assert.deepEqual((await f.verify({ requestJson: f.requestJson })).issues, []);
  assert.ok(f.ownerReviewReads() > 0, "the original owner approval must actually be fetched again");

  // Main's later push must preserve the same inherited proof without a
  // fabricated self-review on the subsequently accepted administrative PR.
  f.currentPull.merged = true; f.currentPull.state = "closed"; f.currentPull.base.sha = f.sync;
  assert.deepEqual((await f.verify({ requestJson: f.requestJson, environment: {
    GITHUB_EVENT_NAME: "push", GITHUB_REF: "refs/heads/main", SLR_CURRENT_COMMIT: f.sync,
  } })).issues, []);
});

test("main-sync inheritance cannot launder missing, dismissed, stale, or rejected owner approval", async (t) => {
  const f = await mainPhaseSyncFixture(t);
  const originalApproval = f.approval(f.phaseHead, "L1nkinPark");
  for (const reviews of [[], [{ ...originalApproval, state: "DISMISSED" }],
    [{ ...originalApproval, commit_id: f.merged }],
    [originalApproval, { ...originalApproval, state: "CHANGES_REQUESTED" }]]) {
    const requestJson = (path) => path.includes("/pulls/40/reviews?") ? reviews : f.requestJson(path);
    invalid(await f.verify({ requestJson }), /requires Hiếu's exact-head approval/);
  }
});

test("main-sync inheritance still requires independent approval of the current exact head", async (t) => {
  const f = await mainPhaseSyncFixture(t);
  for (const reviews of [[], [f.approval(f.sync, "L1nkinPark")], [f.approval(f.phaseHead, "independent-reviewer")]]) {
    const requestJson = (path) => path.includes("/pulls/32/reviews?") ? reviews : f.requestJson(path);
    invalid(await f.verify({ requestJson }), /accepted exact-head GitHub approval/);
  }
});

test("a phase-identical parent outside authenticated main cannot grant inheritance", async (t) => {
  const f = await mainPhaseSyncFixture(t);
  f.currentPull.base.sha = f.merged;
  invalid(await f.verify({ requestJson: f.requestJson }), /requires Hiếu's exact-head approval/);
});

test("main-sync inheritance rejects phase merge resolutions changing either document or a file mode", async (t) => {
  const f = await mainPhaseSyncFixture(t);
  const paths = ["research/MEETING-CADENCE.md", "research/phase-gate-register.csv"];
  for (const changed of [...paths, "mode"]) {
    f.run("checkout", f.mainParent, "--", ...paths);
    if (changed === "mode") f.run("update-index", "--chmod=+x", paths[0]);
    else {
      await f.write(changed, await readFile(join(f.directory, changed), "utf8") + "Unreviewed merge resolution.\n");
      f.run("add", changed);
    }
    f.run("commit", "--amend", "--no-edit");
    f.setHead(f.run("rev-parse", "HEAD"));
    invalid(await f.verify({ requestJson: f.requestJson }), changed === "mode"
      ? /phase correction must remain a regular document/ : /requires Hiếu's exact-head approval/);
  }
});

test("a new phase correction after an unchanged main sync still requires its own accountable review", async (t) => {
  const f = await mainPhaseSyncFixture(t);
  const path = "research/MEETING-CADENCE.md";
  await f.change(path, await readFile(join(f.directory, path), "utf8") +
    `\n2026-09-14: another proposed correction. https://github.com/${repo}/pull/32\n`);
  invalid(await f.verify({ requestJson: f.requestJson }), /requires Hiếu's exact-head approval/);
});

test("invalid event identities, missing objects and CLI outcomes remain fail closed", async (t) => {
  const f = await fixture(t);
  for (const patch of [{ SLR_CURRENT_COMMIT: "bad" }, { SLR_CURRENT_PR: "bad" }, { GITHUB_EVENT_NAME: "push", GITHUB_REF: "refs/heads/other" }]) invalid(await f.verify({ environment: { ...f.environment, ...patch } }), /unavailable|context/);
  f.currentPull.head.sha = f.reviewed; invalid(await f.verify(), /current event/); f.currentPull.head.sha = f.current;
  f.run("checkout", "--detach", f.reviewed); invalid(await f.verify(), /checkout/); f.run("checkout", "--detach", f.current);
  const output = []; const errors = []; let code;
  const options = { environment: f.environment, repositoryDirectory: f.directory, requestJson: f.requestJson,
    log: (line) => output.push(line), error: (line) => errors.push(line), setExitCode: (value) => { code = value; } };
  await main(options); assert.match(output[0], /VALID.*historical/); assert.equal(code, undefined);
  await main({ ...options, environment: {} }); assert.equal(code, 1); assert.match(errors[0], /INVALID/);
  invalid(await f.verify({ git: gitEvidence(join(f.directory, "missing")) }), /ENOENT/);
});

test("a later PR's editable assertions and its author's approval cannot replace independent review", async (t) => {
  const f = await fixture(t);
  for (const reviews of [[], [f.approval(f.reviewed)], [f.approval(f.current, "synthetic-author")],
    [{ ...f.approval(f.current), author_association: "CONTRIBUTOR" }]]) {
    invalid(await f.verify({ requestJson: (path) => path.includes("/pulls/32/reviews?") ? reviews : f.requestJson(path) }), /exact-head GitHub approval/);
  }
  await f.change(recordPath, f.record + "\nAdministrative: approved for PR32\n");
  invalid(await f.verify(), /original review record bytes changed/);
});

test("replacing key and re-signing the original attestation still violates reviewed-key provenance", async (t) => {
  const f = await fixture(t); f.run("checkout", "--detach", f.freeze);
  const keys = generateKeyPairSync("ed25519");
  const publicKey = Buffer.from(keys.publicKey.export({ format: "pem", type: "spki" }));
  const attestation = await readFile(join(f.directory, SIGNED_REVIEW_PATHS.attestation));
  const signature = Buffer.from(sign(null, attestation, keys.privateKey).toString("base64") + "\n");
  await f.write(SIGNED_REVIEW_PATHS.publicKey, publicKey); await f.write(SIGNED_REVIEW_PATHS.signature, signature);
  await f.write(recordPath, f.record.replace(/(Reviewer public key \| [^#]+#sha256=)[0-9a-f]+/, `$1${digest(publicKey)}`).replace(/(Review signature \| [^#]+#sha256=)[0-9a-f]+/, `$1${digest(signature)}`));
  const forged = f.commit("Synthetic attacker key and matching signature");
  f.originalPull.head.sha = forged; f.originalPull.merge_commit_sha = forged;
  f.currentPull.head.sha = forged; f.currentPull.merge_commit_sha = forged; f.currentPull.base.sha = forged; f.environment.SLR_CURRENT_COMMIT = forged;
  invalid(await f.verify(), /strict five-file transition/);
});

test("accepted source identity and signature timestamp cannot be swapped", async (t) => {
  const f = await fixture(t);
  for (const commit of [{ sha: f.freeze, commit: { committer: { date: "2026-09-12T11:00:00Z" } } },
    { sha: f.reviewed, commit: { committer: { date: "2026-09-12T13:00:00Z" } } },
    { sha: f.reviewed, commit: {} }]) {
    invalid(await f.verify({ requestJson: (path) => path.endsWith(`/commits/${f.reviewed}`) ? commit : f.requestJson(path) }), /timestamp or identity/);
  }
});

test("phase text without date or accountable evidence and altered file modes fail", async (t) => {
  const f = await fixture(t);
  const path = "research/MEETING-CADENCE.md";
  const before = await readFile(join(f.directory, path), "utf8");
  await f.change(path, before + "\nFreeze accepted, proceed.\n");
  invalid(await f.verify(), /dated, linked accountable decision/);
  f.run("checkout", "--detach", f.current);
  f.run("update-index", "--chmod=+x", "research/literature-protocol.md");
  f.run("commit", "-m", "Synthetic executable mode change");
  const current = f.run("rev-parse", "HEAD");
  f.currentPull.head.sha = current; f.currentPull.merge_commit_sha = current; f.environment.SLR_CURRENT_COMMIT = current;
  invalid(await f.verify(), /frozen method\/evidence changed/);
});

test("workflow invokes the lifecycle gate with actual PR-head and main event bindings", async () => {
  const workflow = await readFile(join(root, ".github/workflows/build-paper.yml"), "utf8");
  assert.match(workflow, /fetch-depth: 0/);
  assert.match(workflow, /if: github.event_name == 'pull_request' \|\| github.ref == 'refs\/heads\/main'/);
  assert.match(workflow, /SLR_CURRENT_COMMIT: \$\{\{ github.event.pull_request.head.sha \|\| github.sha \}\}/);
  assert.match(workflow, /SLR_CURRENT_PR: \$\{\{ github.event.pull_request.number \}\}/);
  assert.match(workflow, /run: node research\/verify-slr-provenance-lifecycle.mjs/);
  assert.match(workflow, /--test-coverage-include=research\/verify-slr-provenance-lifecycle.mjs/);
});

test("a phase correction introduced only in a merge cannot bypass accountable review", async (t) => {
  const f = await fixture(t);
  f.run("checkout", "--detach", f.merged);
  f.run("merge", "--no-ff", "--no-commit", "follow-up");
  const path = "research/MEETING-CADENCE.md";
  const original = await readFile(join(f.directory, path), "utf8");
  await f.write(path, original + `\n2026-09-13: correction to pending-freeze statement; HOLD retained. https://github.com/${repo}/pull/26\n`);
  f.currentPull.merge_commit_sha = f.commit("Unreviewed correction injected only during merge");
  invalid(await f.verify(), /requires Hiếu's exact-head approval/);
});

test("squashed owner-approved phase correction passes on main but altered merge bytes fail", async (t) => {
  const f = await fixture(t);
  const path = "research/MEETING-CADENCE.md";
  const original = await readFile(join(f.directory, path), "utf8");
  const addition = `\n2026-09-13: correction to pending-freeze statement; HOLD retained. https://github.com/${repo}/pull/26\n`;
  await f.change(path, original + addition);
  f.run("checkout", "--detach", f.merged);
  f.run("merge", "--squash", "follow-up");
  const squashed = f.commit("Owner-reviewed phase correction squashed on main");
  f.currentPull.merged = true; f.currentPull.state = "closed"; f.currentPull.merge_commit_sha = squashed; f.currentPull.base.sha = squashed;
  const requestJson = (path) => path.includes("/commits/") && path.includes("/pulls?") ? [{ number: 32 }] : f.requestJson(path);
  const environment = { GITHUB_EVENT_NAME: "push", GITHUB_REF: "refs/heads/main", SLR_CURRENT_COMMIT: squashed };
  assert.deepEqual((await f.verify({ requestJson, environment })).issues, []);
  await f.write(path, original + addition + "Owner supposedly declared GO.\n");
  const altered = f.commit("Unreviewed merge resolution");
  f.currentPull.merge_commit_sha = altered; f.currentPull.base.sha = altered; environment.SLR_CURRENT_COMMIT = altered;
  invalid(await f.verify({ requestJson, environment }), /requires Hiếu's exact-head approval/);
});

test("squashed original freeze still binds the original signed source", async (t) => {
  const f = await fixture(t);
  f.run("checkout", "--detach", f.reviewed);
  f.run("merge", "--squash", "freeze");
  const squash = f.commit("Synthetic original freeze accepted by squash");
  f.originalPull.merge_commit_sha = squash;
  f.currentPull.base.sha = squash; f.currentPull.head.sha = squash; f.currentPull.merge_commit_sha = squash; f.environment.SLR_CURRENT_COMMIT = squash;
  assert.deepEqual((await f.verify()).issues, []);
});

test("missing historical objects fetch only the trusted full SHA from the fixed repository", async () => {
  const commit = "a".repeat(40); const calls = []; let present = false;
  const git = gitEvidence("/synthetic", { fetchMissing: true, execGit: async (command, args) => {
    assert.equal(command, "git"); assert.equal(args[0], "--no-replace-objects"); calls.push(args);
    if (args[1] === "cat-file" && !present) throw new Error("missing object");
    if (args[1] === "fetch") present = true;
    return { stdout: Buffer.from("") };
  } });
  await git.tree(commit); await git.tree(commit);
  assert.deepEqual(calls.filter((args) => args[1] === "fetch"), [["--no-replace-objects", "fetch", "--no-tags", "--no-write-fetch-head", "--no-recurse-submodules", `https://github.com/${repo}.git`, commit]]);
  await assert.rejects(git.tree("refs/heads/untrusted"), /invalid Git object identity/);
});

test("Git tree parsing preserves a tab inside a NUL-delimited filename", async () => {
  const commit = "b".repeat(40);
  const blob = "c".repeat(40);
  const shadowPath = "research/literature-protocol.md\tshadow";
  const git = gitEvidence("/synthetic", { execGit: async (_command, args) => {
    if (args[1] === "cat-file") return { stdout: Buffer.alloc(0) };
    assert.equal(args[1], "ls-tree");
    return { stdout: Buffer.from(`100644 blob ${blob}\t${shadowPath}\0`) };
  } });
  const tree = await git.tree(commit);
  assert.equal(tree.get(shadowPath), `100644 blob ${blob}`);
});

test("tab-containing shadow filenames cannot mask changed frozen methods",
  { skip: process.platform === "win32" ?
    "Windows filesystems cannot materialize control-character filenames; parser coverage runs above" : false },
  async (t) => {
    const f = await fixture(t);
    await f.change("research/literature-protocol.md", f.frozen.protocol + "\nUnauthorized method change.\n");
    const shadowPath = "research/literature-protocol.md\tshadow";
    await f.write(shadowPath, f.frozen.protocol);
    const current = f.commit("Synthetic tab-containing shadow path");
    f.currentPull.head.sha = current; f.currentPull.merge_commit_sha = current; f.environment.SLR_CURRENT_COMMIT = current;
    invalid(await f.verify(), /frozen method\/evidence changed/);
    const tree = await gitEvidence(f.directory).tree(f.environment.SLR_CURRENT_COMMIT);
    assert.ok(tree.has(shadowPath));
    assert.notEqual(tree.get("research/literature-protocol.md"), tree.get(shadowPath));
  });

test("deleting the record on main cannot masquerade as a pre-freeze candidate", async (t) => {
  const f = await fixture(t); f.run("rm", recordPath); const current = f.commit("Delete inherited record on main");
  f.currentPull.base.sha = current;
  invalid(await f.verify({ environment: { GITHUB_EVENT_NAME: "push", GITHUB_REF: "refs/heads/main", SLR_CURRENT_COMMIT: current } }), /record was removed/);
});

test("owner-approved ordinary phase merge returns only commit identities and passes main", async (t) => {
  const f = await fixture(t); const path = "research/MEETING-CADENCE.md";
  const before = await readFile(join(f.directory, path), "utf8");
  await f.change(path, before + `\n2026-09-13 correction to pending freeze; HOLD retained. https://github.com/${repo}/pull/26\n`);
  f.run("checkout", "--detach", f.merged); f.run("merge", "--no-ff", "follow-up", "-m", "Owner-approved ordinary merge");
  const current = f.run("rev-parse", "HEAD");
  f.currentPull.merged = true; f.currentPull.state = "closed"; f.currentPull.merge_commit_sha = current; f.currentPull.base.sha = current;
  const commits = await gitEvidence(f.directory).phaseCommits(f.merged, current);
  assert.ok(commits.length >= 2); assert.ok(commits.every((commit) => /^[0-9a-f]{40}$/.test(commit)));
  const requestJson = (path) => path.includes("/commits/") && path.includes("/pulls?") ? [{ number: 32 }] : f.requestJson(path);
  assert.deepEqual((await f.verify({ requestJson, environment: { GITHUB_EVENT_NAME: "push", GITHUB_REF: "refs/heads/main", SLR_CURRENT_COMMIT: current } })).issues, []);
});

test("initial merge is the accepted baseline, not a new phase correction on the later PR", async (t) => {
  const f = await fixture(t);
  // Reconstruct a pre-review main with older phase text, then merge the reviewed
  // freeze as a second parent. This models PR26's pre-freeze phase maintenance.
  f.run("checkout", "--detach", f.reviewed);
  await f.write("research/MEETING-CADENCE.md", "# Older main phase state\nHOLD\n");
  const olderMain = f.commit("Older main phase snapshot");
  const tree = f.run("rev-parse", `${f.freeze}^{tree}`);
  const merged = f.run("commit-tree", tree, "-p", olderMain, "-p", f.freeze, "-m", "Accepted original merge includes reviewed phase baseline");
  f.run("checkout", "--detach", merged);
  await f.write("README.md", "Later admin only\n"); const current = f.commit("Ordinary later PR");
  f.originalPull.merge_commit_sha = merged; f.currentPull.base.sha = merged; f.currentPull.head.sha = current; f.currentPull.merge_commit_sha = current; f.environment.SLR_CURRENT_COMMIT = current;
  const requestJson = (path) => path.includes("/pulls/32/reviews?") ? [f.approval(current, "ordinary-independent-reviewer")] : f.requestJson(path);
  assert.deepEqual((await f.verify({ requestJson })).issues, []);
});
