import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import test from "node:test";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

import {
  loadSentinelEvidenceHashes,
  main as runLiteratureProtocolValidator,
  validateLiteratureProtocol,
} from "./validate-literature-protocol.mjs";

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

const source = {
  protocol,
  decisions,
  baseline,
  traceability,
  paper,
  bibliography,
};

function validate(overrides = {}) {
  return validateLiteratureProtocol({ ...source, ...overrides });
}

function assertIssue(result, fragment) {
  assert.ok(
    result.issues.some((issue) => issue.includes(fragment)),
    `expected issue containing '${fragment}', received:\n${result.issues.join("\n")}`,
  );
}

function frozenProtocol() {
  return protocol
    .replace("| Protocol version | 0.1.0 |", "| Protocol version | 1.0.0 |")
    .replace("| Status | Review candidate |", "| Status | Frozen |")
    .replace(
      "| Search authorization | Blocked |",
      "| Search authorization | Authorized |",
    )
    .replace(
      "| Freeze decision | D-008 pending independent review |",
      "| Freeze decision | D-008 accepted; review evidence: https://github.com/Little-Boy-s-ArchSync/archsync-paper/pull/5 |",
    )
    .replace(
      /The protocol is deliberately a review candidate\.[\s\S]*?no candidate-paper list may be screened or used to change criteria\./,
      "This protocol is frozen at version 1.0.0 after independent method review and\nsentinel-query calibration. Official search is authorized under D-008, but has\nnot started and no result list has been inspected. All later amendments follow\nSection 17 and may not silently change the frozen criteria.",
    )
    .replace(
      "## 20. Candidate version history",
      "## 20. Protocol version history",
    )
    .replace(
      "| 0.1.0 | 2026-08-16 | D-008 proposed |",
      "| 1.0.0 | 2026-08-16 | D-008 accepted | Independent review and sentinel recall approved in https://github.com/Little-Boy-s-ArchSync/archsync-paper/pull/5; review commit 0123456789abcdef0123456789abcdef01234567; governed evidence hashes verified |\n| 0.1.0 | 2026-08-16 | D-008 proposed |",
    )
    .replaceAll("- [ ]", "- [x]");
}

function acceptedDecisions() {
  return decisions
    .replace(
      "## D-008: Propose Systematic Literature Review Protocol 0.1.0 for Independent Review",
      "## D-008: Freeze Systematic Literature Review Protocol 1.0.0 after Independent Review",
    )
    .replace(/(^## D-008:[\s\S]*?^- Status:) Proposed$/m, "$1 Accepted")
    .replace(
      /- Required review: Member 3 reviews method and sentinel recall as a non-author\.[\s\S]*?  evidence\./,
      "- Independent review: Member 3 approved the method and sentinel recall as a non-author in https://github.com/Little-Boy-s-ArchSync/archsync-paper/pull/5\n  at commit `0123456789abcdef0123456789abcdef01234567` on 2026-08-16T08:00:00Z.\n- Freeze evidence: `slr-review-record.md` and\n  `literature-sentinel-recall.csv`; referenced JSON SHA-256 values are verified\n  by CI before search authorization.",
    );
}

function frozenPaper() {
  return paper
    .replace(
      "The candidate protocol predeclares",
      "The frozen protocol predeclares",
    )
    .replace(
      "protocol version \\texttt{0.1.0} is a review candidate. The official search has not started, and no result list has been inspected.",
      "protocol version \\texttt{1.0.0} is frozen. The official search is authorized but has not started, and no result list has been inspected.",
    )
    .replace(
      "Search remains blocked until a non-author reviewer validates the method and sentinel recall and the protocol is frozen.",
      "Official search may begin only from the frozen queries and governed evidence workflow.",
    );
}

const reviewRecord = `# SLR-101 Independent Review Record

| Field | Value |
| --- | --- |
| Task | SLR-101 |
| Protocol version | 1.0.0 |
| Review PR | https://github.com/Little-Boy-s-ArchSync/archsync-paper/pull/5 |
| Review URL | https://github.com/Little-Boy-s-ArchSync/archsync-paper/pull/5#pullrequestreview-12345 |
| Reviewer | Member 3 |
| Reviewer GitHub login | teikv |
| Review decision | Approved |
| Review commit | 0123456789abcdef0123456789abcdef01234567 |
| Review timestamp | 2026-08-16T08:00:00Z |
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

test("accepts the governed review-candidate protocol", () => {
  const result = validate();
  assert.deepEqual(result.issues, []);
  assert.equal(result.version, "0.1.0");
  assert.equal(result.searchAuthorization, "Blocked");
});

test("rejects premature search authorization", () => {
  const result = validate({
    protocol: protocol.replace(
      "| Search authorization | Blocked |",
      "| Search authorization | Authorized |",
    ),
  });
  assertIssue(result, "governed 0.1.0 candidate state");
});

test("rejects search execution or result inspection during SLR-101", () => {
  const result = validate({
    protocol: protocol
      .replace(
        "| Official search execution | Not started |",
        "| Official search execution | Started |",
      )
      .replace(
        "| Search results inspected | No |",
        "| Search results inspected | Yes |",
      ),
  });
  assertIssue(result, "official search must remain Not started");
  assertIssue(result, "search results must not be inspected");
});

test("rejects removal of a required database or query family", () => {
  const result = validate({
    protocol: protocol
      .replace(
        "| Scopus | Broad multidisciplinary index",
        "| Removed index | Broad multidisciplinary index",
      )
      .replace("### Search-C:", "### Removed-C:"),
  });
  assertIssue(result, "missing required primary source Scopus");
  assertIssue(result, "missing query family Search-C");
});

test("rejects removal of a sentinel, eligibility criterion, or workflow stage", () => {
  const result = validate({
    protocol: protocol
      .replace("10.1002/smr.2423", "missing-sentinel-doi")
      .replace("- E7:", "- Removed-E7:")
      .replace("### Stage 4: full-text screening", "### Removed Stage 4"),
  });
  assertIssue(result, "missing predeclared sentinel DOI 10.1002/smr.2423");
  assertIssue(result, "missing eligibility criterion E7");
  assertIssue(result, "missing governed workflow Stage 4: full-text screening");
});

test("rejects removal of an execution artifact or research-integrity guard", () => {
  const result = validate({
    protocol: protocol
      .replace("| `literature-screening.csv` |", "| `removed-screening.csv` |")
      .replace(
        "must not see each other's decisions until both have completed the round",
        "may share decisions during screening",
      ),
  });
  assertIssue(
    result,
    "missing required execution artifact literature-screening.csv",
  );
  assertIssue(result, "missing a research-integrity guard");
});

test("rejects a decision-log state that disagrees with the candidate", () => {
  const result = validate({
    decisions: decisions.replace(
      /(^## D-008:[\s\S]*?^- Status:) Proposed$/m,
      "$1 Accepted",
    ),
  });
  assertIssue(result, "D-008 must be Proposed");
});

test("rejects a textual freeze without independent review artifacts", () => {
  const result = validate({
    protocol: frozenProtocol(),
    decisions: acceptedDecisions(),
    paper: frozenPaper(),
  });
  assertIssue(result, "slr-review-record.md: required");
  assertIssue(result, "literature-sentinel-recall.csv: required");
});

test("rejects review artifacts while metadata still declares a candidate", () => {
  const result = validate({
    reviewRecord,
    sentinelRecall,
    sentinelEvidenceHashes,
  });
  assertIssue(
    result,
    "must not exist while the protocol remains a review candidate",
  );
});

test("accepts a fully evidenced synthetic frozen state", () => {
  const result = validate({
    protocol: frozenProtocol(),
    decisions: acceptedDecisions(),
    paper: frozenPaper(),
    reviewRecord,
    sentinelRecall,
    sentinelEvidenceHashes,
  });
  assert.deepEqual(result.issues, []);
  assert.equal(result.version, "1.0.0");
  assert.equal(result.searchAuthorization, "Authorized");
});

test("rejects self-review and malformed sentinel evidence", () => {
  const result = validate({
    protocol: frozenProtocol(),
    decisions: acceptedDecisions(),
    paper: frozenPaper(),
    reviewRecord: reviewRecord.replace(
      "| Reviewer | Member 3 |",
      "| Reviewer | Hiếu |",
    ),
    sentinelRecall: sentinelRecall
      .replaceAll(",Member 3,", ",Hiếu,")
      .replace(
        "ACM Digital Library;Scopus,ACM Digital Library,retrieved",
        "ACM Digital Library,Scopus,retrieved",
      ),
    sentinelEvidenceHashes,
  });
  assertIssue(result, "Reviewer must be 'Member 3'");
  assertIssue(result, "must be verified by Member 3");
  assertIssue(result, "retrieved sources must be a subset of indexed sources");
});

test("rejects a frozen protocol with an unchecked review item", () => {
  const result = validate({
    protocol: frozenProtocol().replace("- [x] Objective", "- [ ] Objective"),
    decisions: acceptedDecisions(),
    paper: frozenPaper(),
    reviewRecord,
    sentinelRecall,
    sentinelEvidenceHashes,
  });
  assertIssue(result, "10 checked and 0 unchecked");
});

test("rejects a sentinel identity mismatch or forged artifact digest", () => {
  const forgedHashes = new Map(sentinelEvidenceHashes);
  forgedHashes.set("research/evidence/slr-sentinel/S-001.json", "0".repeat(64));
  const result = validate({
    protocol: frozenProtocol(),
    decisions: acceptedDecisions(),
    paper: frozenPaper(),
    reviewRecord,
    sentinelRecall: sentinelRecall.replace(
      "S-001,10.1145/222124.222136",
      "S-001,10.1109/WICSA.2007.1",
    ),
    sentinelEvidenceHashes: forgedHashes,
  });
  assertIssue(result, "S-001 must map to DOI 10.1145/222124.222136");
  assertIssue(result, "S-001 evidence SHA-256 does not match");
});

test("rejects duplicate or incomplete sentinel rows", () => {
  const lines = sentinelRecall.trim().split(/\r?\n/);
  const mutated = `${lines.slice(0, -1).join("\n")}\n${lines[1]}\n`;
  const result = validate({
    protocol: frozenProtocol(),
    decisions: acceptedDecisions(),
    paper: frozenPaper(),
    reviewRecord,
    sentinelRecall: mutated,
    sentinelEvidenceHashes,
  });
  assertIssue(result, "sentinel_id values must be unique");
  assertIssue(result, "DOI values must be unique");
  assertIssue(result, "missing S-006");
  assertIssue(result, "missing sentinel DOI 10.1002/smr.2423");
});

test("rejects missing paper disclosures, method citations and protocol metadata", () => {
  const result = validate({
    protocol: protocol
      .replace("| Owner | Hiếu |", "| Owner | Unknown |")
      .replace("### SLR-RQ1:", "### Removed-RQ1:")
      .replace(
        "## 20. Candidate version history",
        "## Removed version history",
      ),
    paper: paper
      .replace(
        "The preceding synthesis positions ArchSync against selected foundational, secondary, and empirical studies. It is not the outcome of a completed systematic literature review",
        "The literature is complete",
      )
      .replace(
        "The current Related Work synthesis is narrative and may reflect source-selection and interpretation bias",
        "There is no literature-selection risk",
      )
      .replaceAll("kitchenham2007slr", "removed-method-citation"),
    bibliography: bibliography.replaceAll(
      "kitchenham2007slr",
      "removed-method-entry",
    ),
  });
  for (const fragment of [
    "not a completed systematic review",
    "literature-positioning validity risk",
    "missing literature-method citation kitchenham2007slr",
    "missing entry kitchenham2007slr",
    "Owner must be 'Hiếu'",
    "SLR-RQ1 must have one canonical heading",
    "Candidate version history",
  ]) {
    assertIssue(result, fragment);
  }
});

test("rejects a protocol and baseline that lose an RQ traceability link", () => {
  const result = validate({
    protocol: protocol.replaceAll("F-RQ1", "REMOVED-RQ1"),
    baseline: baseline.replaceAll("F-RQ1", "REMOVED-RQ1"),
    traceability: traceability.replaceAll("F-RQ1", "REMOVED-RQ1"),
  });
  assertIssue(result, "missing link to F-RQ1");
  assertIssue(result, "missing governed RQ F-RQ1");
});

test("rejects malformed review identity, timestamp and PR linkage", () => {
  const malformedReview = reviewRecord
    .replace("/pull/5", "/pull/6")
    .replace("0123456789abcdef0123456789abcdef01234567", "short-commit")
    .replace("2026-08-16T08:00:00Z", "2026-99-99T99:99:99Z");
  const result = validate({
    protocol: frozenProtocol(),
    decisions: acceptedDecisions(),
    paper: frozenPaper(),
    reviewRecord: malformedReview,
    sentinelRecall,
    sentinelEvidenceHashes,
  });
  assertIssue(result, "freeze decision must cite the approved Review PR");
  assertIssue(result, "Review commit must be a full Git commit SHA");
  assertIssue(result, "Review timestamp must be an ISO-8601 UTC timestamp");
});

test("rejects frozen metadata while the paper retains candidate language", () => {
  const result = validate({
    protocol: frozenProtocol(),
    decisions: acceptedDecisions(),
    paper,
    reviewRecord,
    sentinelRecall,
    sentinelEvidenceHashes,
  });
  assertIssue(result, "frozen status must match reviewed protocol 1.0.0");
  assertIssue(
    result,
    "must not retain candidate or pre-review blocking language",
  );
});

test("rejects malformed sentinel CSV schema, row width and unknown sources", () => {
  const malformed = sentinelRecall
    .replace("sentinel_id,doi", "id,doi")
    .replace("ACM Digital Library;Scopus", "Unknown Index")
    .replace(
      `,research/evidence/slr-sentinel/S-006.json#sha256=${"6".repeat(64)}`,
      "",
    );
  const result = validate({
    protocol: frozenProtocol(),
    decisions: acceptedDecisions(),
    paper: frozenPaper(),
    reviewRecord,
    sentinelRecall: malformed,
    sentinelEvidenceHashes,
  });
  assertIssue(result, "header order does not match the governed schema");
  assertIssue(result, "row 7 has 6 fields; expected 7");
  assertIssue(result, "uses unknown source 'Unknown Index'");
});

test("rejects malformed sentinel CSV quoting", () => {
  const result = validate({
    protocol: frozenProtocol(),
    decisions: acceptedDecisions(),
    paper: frozenPaper(),
    reviewRecord,
    sentinelRecall: 'sentinel_id,doi\n"unterminated',
    sentinelEvidenceHashes,
  });
  assertIssue(result, "unterminated quoted CSV field");
});

test("accepts documented not-indexed sentinels and rejects contradictory classifications", () => {
  const notIndexed = sentinelRecall.replace(
    "ACM Digital Library;Scopus,ACM Digital Library,retrieved",
    "none,none,not-indexed",
  );
  const accepted = validate({
    protocol: frozenProtocol(),
    decisions: acceptedDecisions(),
    paper: frozenPaper(),
    reviewRecord,
    sentinelRecall: notIndexed,
    sentinelEvidenceHashes,
  });
  assert.deepEqual(accepted.issues, []);

  const contradictory = validate({
    protocol: frozenProtocol(),
    decisions: acceptedDecisions(),
    paper: frozenPaper(),
    reviewRecord,
    sentinelRecall: sentinelRecall
      .replace(
        "ACM Digital Library;Scopus,ACM Digital Library,retrieved",
        "ACM Digital Library,ACM Digital Library,not-indexed",
      )
      .replace(
        "IEEE Xplore;Scopus,IEEE Xplore,retrieved",
        "none,none,retrieved",
      )
      .replace(
        "Scopus;Web of Science Core Collection,Scopus,retrieved",
        "Scopus,Scopus,invalid",
      ),
    sentinelEvidenceHashes,
  });
  assertIssue(contradictory, "not-indexed classification requires 'none'");
  assertIssue(
    contradictory,
    "retrieved classification requires indexed and retrieved sources",
  );
  assertIssue(contradictory, "classification must be retrieved or not-indexed");
});

test("rejects removal of D-008 or its pre-search integrity guard", () => {
  const missingDecision = validate({
    decisions: decisions.replace(
      "## D-008: Propose Systematic Literature Review Protocol 0.1.0 for Independent Review",
      "## Removed D-008",
    ),
  });
  assertIssue(missingDecision, "missing D-008 literature protocol decision");

  const missingGuard = validate({
    decisions: decisions.replace(
      "Search remains blocked while the protocol is a review",
      "Search may start while the protocol is a review",
    ),
  });
  assertIssue(missingGuard, "must preserve the pre-search review gate");
});

test("loads and hashes a real sentinel evidence artifact", async (context) => {
  const repository = await mkdtemp(join(tmpdir(), "archsync-slr-evidence-"));
  context.after(() => rm(repository, { recursive: true, force: true }));
  const evidenceDirectory = join(
    repository,
    "research",
    "evidence",
    "slr-sentinel",
  );
  await mkdir(evidenceDirectory, { recursive: true });
  const artifact = '{"sentinel":"S-001","retrieved":true}\n';
  await writeFile(join(evidenceDirectory, "S-001.json"), artifact, "utf8");
  const digest = createHash("sha256").update(artifact).digest("hex");
  const recall = `sentinel_id,doi,indexed_sources,retrieved_sources,classification,reviewer,evidence\nS-001,10.1145/222124.222136,ACM Digital Library,ACM Digital Library,retrieved,Member 3,research/evidence/slr-sentinel/S-001.json#sha256=${digest}\n`;
  const hashes = await loadSentinelEvidenceHashes(repository, recall);
  assert.equal(hashes.get("research/evidence/slr-sentinel/S-001.json"), digest);
  assert.deepEqual(
    await loadSentinelEvidenceHashes(repository, '"unterminated'),
    new Map(),
  );
});

test("runs the real candidate protocol through the CLI entry point", async () => {
  const output = [];
  const errors = [];
  let exitCode = null;
  await runLiteratureProtocolValidator({
    log: (message) => output.push(message),
    error: (message) => errors.push(message),
    setExitCode: (code) => {
      exitCode = code;
    },
  });
  assert.equal(exitCode, null);
  assert.deepEqual(errors, []);
  assert.ok(output.some((message) => message.includes("search blocked")));
});
