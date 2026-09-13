import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";
import { freezeLiteratureProtocol } from "./freeze-literature-protocol.mjs";
import { loadExpandedManuscript } from "./load-manuscript.mjs";
import { githubRequestJson, verifySlrReviewProvenance } from "./verify-slr-review-provenance.mjs";
import { SIGNED_REVIEW_PATHS, verifySignedReviewAttestation } from "./verify-slr-signed-attestation.mjs";

const exec = promisify(execFile);
const REPOSITORY = "Little-Boy-s-ArchSync/archsync-paper";
const API = `/repos/${REPOSITORY}`;
const RECORD = "research/slr-review-record.md";
const PHASE_PATHS = ["research/phase-gate-register.csv", "research/MEETING-CADENCE.md"];
const ASSOCIATIONS = new Set(["OWNER", "MEMBER", "COLLABORATOR"]);
const TRANSITION = new Set([RECORD, SIGNED_REVIEW_PATHS.attestation, SIGNED_REVIEW_PATHS.signature,
  "research/literature-protocol.md", "research/decision-log.md"]);
const sha = (value) => /^[0-9a-f]{40}$/.test(value ?? "");
const field = (record, name) => record.match(new RegExp(`^\\| ${name} \\| ([^|]+) \\|$`, "m"))?.[1].trim();
const requireThat = (condition, message) => { if (!condition) throw new Error(message); };

// Git objects, not an editable manifest, bind every protected byte and file mode.
export function gitEvidence(directory, { fetchMissing = false, execGit = exec } = {}) {
  const run = async (args) => (await execGit("git", ["--no-replace-objects", ...args], {
    cwd: directory, encoding: "buffer", maxBuffer: 64 * 1024 * 1024,
  })).stdout;
  const available = new Set();
  const ensure = async (commit) => {
    requireThat(sha(commit), "invalid Git object identity");
    if (available.has(commit)) return;
    try { await run(["cat-file", "-e", `${commit}^{commit}`]); }
    catch (error) {
      if (!fetchMissing) throw error;
      // A squash merge can leave the accepted head outside a fresh main clone.
      // Fetch only an identity already supplied by the event or trusted API.
      await run(["fetch", "--no-tags", "--no-write-fetch-head", "--no-recurse-submodules",
        `https://github.com/${REPOSITORY}.git`, commit]);
      await run(["cat-file", "-e", `${commit}^{commit}`]);
    }
    available.add(commit);
  };
  return {
    head: async () => (await run(["rev-parse", "HEAD"])).toString().trim(),
    tree: async (commit) => {
      await ensure(commit);
      const result = new Map();
      for (const line of (await run(["ls-tree", "-rz", commit])).toString().split("\0").filter(Boolean)) {
        const separator = line.indexOf("\t");
        const metadata = line.slice(0, separator);
        const path = line.slice(separator + 1);
        result.set(path, metadata);
      }
      return result;
    },
    read: async (commit, path) => {
      requireThat(sha(commit) && !path.includes(":"), "invalid Git file identity");
      await ensure(commit);
      return run(["show", `${commit}:${path}`]);
    },
    ancestor: async (ancestor, descendant) => {
      requireThat(sha(ancestor) && sha(descendant), "invalid Git ancestry identity");
      await ensure(ancestor); await ensure(descendant);
      try { await run(["merge-base", "--is-ancestor", ancestor, descendant]); return true; }
      catch (error) { if (error.code === 1) return false; throw error; }
    },
    hasFreezeHistory: async (commit) => (await run([
      "log", "--format=%H", "--full-history", "--diff-filter=A", "--no-renames", commit, "--", RECORD,
    ])).length > 0,
    phaseCommits: async (freeze, current) => (await run([
      "log", "--format=%H", "--full-history", "--diff-merges=first-parent", "--no-patch", `${freeze}..${current}`, "--", ...PHASE_PATHS,
    ])).toString().trim().split("\n").filter(Boolean),
  };
}

function protectedPath(path) {
  return /^research\/(?:literature-|slr-)/.test(path) && !path.endsWith(".mjs") ||
    /^research\/evidence\/slr/.test(path) ||
    ["research/decision-log.md", "research/RESEARCH.md", "research/RQ-TRACEABILITY.md", "research/GLOSSARY.md"].includes(path);
}

function differences(before, after) {
  return [...new Set([...before.keys(), ...after.keys()])].filter((path) => before.get(path) !== after.get(path));
}

async function artifactsAt(git, commit) {
  return Object.fromEntries(await Promise.all(Object.entries(SIGNED_REVIEW_PATHS).map(async ([key, path]) =>
    [`${key}Bytes`, await git.read(commit, path)])));
}

async function allPages(requestJson, path) {
  const rows = [];
  for (let page = 1; ; page += 1) {
    const result = await requestJson(`${path}?per_page=100&page=${page}`);
    requireThat(Array.isArray(result), "incomplete GitHub review/PR listing");
    rows.push(...result);
    if (result.length < 100) return rows;
  }
}

async function approved(requestJson, pull, login, independent = false) {
  const reviews = await allPages(requestJson, `${API}/pulls/${pull.number}/reviews`);
  const latest = new Map();
  for (const review of reviews) {
    if (["APPROVED", "CHANGES_REQUESTED", "DISMISSED"].includes(review.state)) latest.set(review.user?.login, review);
  }
  requireThat(![...latest.values()].some((review) => review.state === "CHANGES_REQUESTED"),
    "unresolved changes-requested review");
  requireThat([...latest.values()].some((review) => review.state === "APPROVED" &&
    review.commit_id === pull.head.sha && ASSOCIATIONS.has(review.author_association) &&
    (!login || review.user?.login === login) &&
    (!independent || (pull.user?.login && review.user?.login !== pull.user.login))), "accepted exact-head GitHub approval is required");
}

export async function verifyMechanicalFreeze(git, reviewed, freeze, record) {
  const before = await git.tree(reviewed);
  const after = await git.tree(freeze);
  requireThat(!before.has(RECORD), "reviewed source already contains a freeze record");
  requireThat(differences(before, after).every((path) => TRANSITION.has(path)),
    "original freeze exceeds the strict five-file transition");
  for (const path of TRANSITION) requireThat(after.get(path)?.startsWith("100644 blob "), `invalid freeze file mode: ${path}`);
  const read = async (path) => (await git.read(reviewed, path)).toString();
  const sentinelRecall = await read("research/literature-sentinel-recall.csv");
  const hashes = new Map();
  const artifacts = new Map();
  for (const path of before.keys()) {
    if (/^research\/evidence\/slr-sentinel\/S-[0-9]{3}\.json$/.test(path)) {
      const bytes = await git.read(reviewed, path);
      artifacts.set(path, bytes);
      hashes.set(path, createHash("sha256").update(bytes).digest("hex"));
    }
  }
  const root = resolve("/synthetic-git-snapshot");
  const frozen = freezeLiteratureProtocol({
    protocol: await read("research/literature-protocol.md"), decisions: await read("research/decision-log.md"),
    baseline: await read("research/RESEARCH.md"), traceability: await read("research/RQ-TRACEABILITY.md"),
    bibliography: await read("references.bib"),
    paper: await loadExpandedManuscript(root, { readText: (path) => read(relative(root, path)) }),
    reviewRecord: record, sentinelRecall, sentinelEvidenceHashes: hashes, sentinelEvidenceArtifacts: artifacts,
  });
  requireThat(frozen.issues.length === 0, `invalid original mechanical freeze: ${frozen.issues.join("; ")}`);
  for (const [path, expected] of [["research/literature-protocol.md", frozen.protocol], ["research/decision-log.md", frozen.decisions]]) {
    requireThat((await git.read(freeze, path)).equals(Buffer.from(expected)), `non-mechanical original freeze: ${path}`);
  }
}

async function verifyPhaseHistory({ git, freeze, current, currentPull, requestJson }) {
  const original = await git.tree(freeze);
  const target = await git.tree(current);
  for (const path of PHASE_PATHS) {
    if (original.get(path) === target.get(path)) continue;
    requireThat(target.get(path)?.startsWith("100644 blob "), `phase correction must remain a regular document: ${path}`);
    const before = (await git.read(freeze, path)).toString();
    const after = (await git.read(current, path)).toString();
    requireThat(after.startsWith(before), `historical phase decisions must remain byte-identical: ${path}`);
    const addition = after.slice(before.length);
    requireThat(/20\d{2}-\d{2}-\d{2}/.test(addition) && /https:\/\/github\.com\//.test(addition),
      "phase correction requires a dated, linked accountable decision");
  }
  // Each introducing commit needs accountable approval, including corrections inherited on main.
  for (const commit of await git.phaseCommits(freeze, current)) {
    let candidates = currentPull ? [currentPull] : [];
    candidates = [...candidates, ...await allPages(requestJson, `${API}/commits/${commit}/pulls`)];
    let accepted = false;
    for (const candidate of candidates) {
      const pull = await requestJson(`${API}/pulls/${candidate.number}`);
      if (pull.base?.repo?.full_name !== REPOSITORY || pull.base.ref !== "main" ||
          (!pull.merged && pull.number !== currentPull?.number)) continue;
      let coversCommit = await git.ancestor(commit, pull.head.sha);
      if (!coversCommit && pull.merged && sha(pull.merge_commit_sha) &&
          await git.ancestor(commit, pull.merge_commit_sha) && await git.ancestor(pull.merge_commit_sha, current)) {
        const acceptedTree = await git.tree(pull.merge_commit_sha);
        const approvedTree = await git.tree(pull.head.sha);
        // The rewritten commit of a squash/rebase (or normal merge) must retain
        // the owner's approved phase bytes, including file modes.
        coversCommit = PHASE_PATHS.every((path) => acceptedTree.get(path) === approvedTree.get(path));
      }
      if (!coversCommit) continue;
      try { await approved(requestJson, pull, "L1nkinPark"); accepted = true; break; } catch { /* Try another associated PR. */ }
    }
    requireThat(accepted, `phase correction ${commit} requires Hiếu's exact-head approval; no GO is inferred`);
  }
}

export async function verifySlrProvenanceLifecycle({ environment, requestJson, git }) {
  try {
    const event = environment.GITHUB_EVENT_NAME;
    const current = environment.SLR_CURRENT_COMMIT;
    requireThat(sha(current), "current event commit is unavailable");
    const checkedOut = await git.head();
    let currentPull = null;
    let base;
    if (event === "pull_request") {
      requireThat(/^[1-9][0-9]*$/.test(environment.SLR_CURRENT_PR ?? ""), "current PR is unavailable");
      currentPull = await requestJson(`${API}/pulls/${environment.SLR_CURRENT_PR}`);
      requireThat(currentPull.number === Number(environment.SLR_CURRENT_PR) && currentPull.head?.sha === current &&
        currentPull.state === "open" && currentPull.base?.repo?.full_name === REPOSITORY && currentPull.base.ref === "main",
      "current event does not identify an open PR to repository main");
      base = currentPull.base.sha;
      requireThat(checkedOut === current || checkedOut === currentPull.merge_commit_sha,
        "checkout is neither the PR head nor its GitHub test merge");
    } else {
      requireThat(["push", "workflow_dispatch"].includes(event) && environment.GITHUB_REF === "refs/heads/main",
        "historical verification requires a PR or main workflow context");
      base = (await requestJson(`${API}/branches/main`)).commit?.sha;
      requireThat(checkedOut === current && await git.ancestor(current, base), "event is not in trusted main history");
    }
    const tree = await git.tree(current);
    const baseTree = await git.tree(base);
    const checkoutTree = await git.tree(checkedOut);
    if (!tree.has(RECORD)) {
      requireThat(!baseTree.has(RECORD) && !checkoutTree.has(RECORD) && !await git.hasFreezeHistory(base), "inherited frozen review record was removed");
      return { issues: [], mode: "candidate" };
    }
    const record = (await git.read(current, RECORD)).toString();
    const number = field(record, "Review PR")?.match(/^https:\/\/github\.com\/Little-Boy-s-ArchSync\/archsync-paper\/pull\/([1-9][0-9]*)$/)?.[1];
    requireThat(number, "invalid original freeze PR identity");
    if (String(currentPull?.number) === number) {
      requireThat(!baseTree.has(RECORD), "an accepted freeze cannot re-enter the initial transition");
      requireThat(differences(tree, checkoutTree).filter(protectedPath).length === 0, "PR test merge changed frozen method/evidence");
      const result = await verifySlrReviewProvenance({ reviewRecord: record, currentPullRequest: number,
        currentCommit: current, requestJson, signedReviewArtifacts: field(record, "Review mode") === "Signed attestation" ? await artifactsAt(git, current) : undefined });
      return { ...result, mode: "initial" };
    }
    const freezePull = await requestJson(`${API}/pulls/${number}`);
    requireThat(freezePull.number === Number(number) && freezePull.merged === true && freezePull.state === "closed" &&
      freezePull.base?.repo?.full_name === REPOSITORY && freezePull.base.ref === "main" &&
      sha(freezePull.head?.sha) && sha(freezePull.merge_commit_sha), "original freeze PR is not accepted and merged into repository main");
    const freeze = freezePull.head.sha;
    const merged = freezePull.merge_commit_sha;
    requireThat(await git.ancestor(merged, base) && await git.ancestor(merged, current) && await git.ancestor(merged, checkedOut),
      "accepted freeze merge is unrelated to the base, head, or checkout");
    const originalRecord = (await git.read(freeze, RECORD)).toString();
    requireThat(record === originalRecord, "original review record bytes changed");
    requireThat(field(record, "Review mode") === "Signed attestation", "historical path currently requires the signed freeze; a separately reviewed migration is required");
    const reviewed = field(record, "Review commit");
    requireThat(sha(reviewed) && await git.ancestor(reviewed, freeze), "signed reviewed source is not the original freeze ancestor");
    const artifacts = await artifactsAt(git, freeze);
    const signed = verifySignedReviewAttestation({ reviewRecord: originalRecord, ...artifacts });
    requireThat(signed.issues.length === 0, signed.issues.join("; "));
    const commit = await requestJson(`${API}/commits/${reviewed}`);
    requireThat(commit.sha === reviewed && Number.isFinite(Date.parse(commit.commit?.committer?.date)) &&
      Date.parse(signed.attestation.review_timestamp) >= Date.parse(commit.commit.committer.date), "invalid reviewed commit timestamp or identity");
    await approved(requestJson, freezePull);
    await verifyMechanicalFreeze(git, reviewed, freeze, originalRecord);
    const frozenTree = await git.tree(freeze);
    for (const target of [merged, base, current, checkedOut]) {
      const changed = differences(frozenTree, await git.tree(target)).filter(protectedPath);
      requireThat(changed.length === 0, `frozen method/evidence changed (${changed.join(", ")}); Section 17 requires an approved timestamped amendment or separately versioned review; historical approval does not cover it`);
    }
    const acceptedTree = await git.tree(merged);
    requireThat(PHASE_PATHS.every((path) => frozenTree.get(path) === acceptedTree.get(path)),
      "initial accepted merge changed the reviewed phase documents");
    if (currentPull) await approved(requestJson, currentPull, undefined, true);
    await verifyPhaseHistory({ git, freeze: merged, current: checkedOut, currentPull, requestJson });
    return { issues: [], mode: "historical", freeze, reviewed, pullRequest: Number(number) };
  } catch (error) { return { issues: [`review lifecycle: ${error.message}`] }; }
}

export async function main({ environment = process.env, repositoryDirectory = dirname(dirname(fileURLToPath(import.meta.url))),
  requestJson = (path) => githubRequestJson(path, { token: environment.GITHUB_TOKEN }),
  log = console.log, error = console.error, setExitCode = (code) => { process.exitCode = code; },
} = {}) {
  const result = await verifySlrProvenanceLifecycle({ environment, requestJson, git: gitEvidence(repositoryDirectory, { fetchMissing: true }) });
  if (result.issues.length) {
    error(`INVALID SLR REVIEW LIFECYCLE\n${result.issues.map((issue) => `- ${issue}`).join("\n")}`);
    setExitCode(1);
  } else log(`VALID SLR REVIEW LIFECYCLE (${result.mode}${result.freeze ? `; original PR #${result.pullRequest}; freeze ${result.freeze}; signed source ${result.reviewed}` : ""})`);
  return result;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
