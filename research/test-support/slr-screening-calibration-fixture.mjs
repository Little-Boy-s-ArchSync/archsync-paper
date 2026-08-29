import {
  RECONCILIATION_HEADERS,
  reconciliationSha256,
  CALIBRATION_PATHS,
  CALIBRATION_ROOT,
  canonicalCsv,
  canonicalJson,
  DECISION_HEADERS,
  decisionCommitmentSha256,
  decisionSha256,
  evaluateSlrScreeningCalibration,
  REVIEWERS,
  sha256,
} from "../verify-slr-screening-calibration.mjs";

function decisionRow({
  record,
  reviewerRole,
  reviewerId,
  decision,
  evidenceClass,
  primaryReason = "",
  secondaryReasons = "",
  decidedAt,
}) {
  const value = {
    record_id: record.record_id,
    round: "title-abstract",
    protocol_version: "0.2.2",
    criteria_version: "0.2.0",
    reviewer_role: reviewerRole,
    reviewer_id: reviewerId,
    decision,
    evidence_class: evidenceClass,
    primary_reason_code: primaryReason,
    secondary_reason_codes: secondaryReasons,
    evidence_location: `https://api.crossref.org/works/${record.record_id}`,
    factual_note:
      decision === "exclude" ? `Excluded ${record.record_id}` : "",
    decided_at_utc: decidedAt,
    record_sha256: record.record_sha256,
    decision_sha256: "",
  };
  value.decision_sha256 = decisionSha256(value);
  return value;
}

function csvFromObjects(headers, values) {
  return Buffer.from(
    canonicalCsv([
      [...headers],
      ...values.map((value) => headers.map((header) => String(value[header]))),
    ]),
    "utf8",
  );
}

export function createSlrScreeningCalibrationFixture({
  independentOverrides = {},
  allowFailed = false,
} = {}) {
  const recordArtifacts = new Map();
  const pilotRecords = [];
  for (let index = 1; index <= 8; index += 1) {
    const recordId = `CAL-${String(index).padStart(3, "0")}`;
    const path = `${CALIBRATION_ROOT}/records/${recordId}.json`;
    const pilotPath = `records/${recordId}.json`;
    const artifact = {
      schema_version: "1.1.0",
      record_id: recordId,
      title: `Calibration record ${index}`,
      abstract: `Immutable abstract snapshot for calibration record ${index}.`,
      publication_type: "journal article",
      publication_date: `202${index % 6}-01-01`,
      venue: `Calibration Venue ${index}`,
      persistent_locator: `https://doi.org/10.9999/calibration.${index}`,
      evidence_location: `https://api.crossref.org/works/10.9999%2Fcalibration.${index}`,
      captured_at_utc: "2026-08-25T00:00:00Z",
    };
    const bytes = Buffer.from(canonicalJson(artifact), "utf8");
    recordArtifacts.set(path, bytes);
    pilotRecords.push({
      record_id: recordId,
      record_path: pilotPath,
      record_sha256: sha256(bytes),
    });
  }
  const pilotSet = {
    schema_version: "1.2.0",
    task: "SLR-103",
    protocol_version: "0.2.2",
    criteria_version: "0.2.0",
    selected_at_utc: "2026-08-26T00:00:00Z",
    official_results_inspected: false,
    required_rounds: ["title-abstract"],
    selectors: [
      {
        reviewer_role: "Protocol author",
        reviewer_id: "Hiếu",
        selected_at_utc: "2026-08-25T23:58:00Z",
      },
      {
        reviewer_role: "Independent SLR Reviewer",
        reviewer_id: "Hoang",
        selected_at_utc: "2026-08-25T23:59:00Z",
      },
    ],
    records: pilotRecords,
  };
  const pilotSetBytes = Buffer.from(canonicalJson(pilotSet), "utf8");

  const hieuPlan = [
    ["include", "", ""],
    ["include", "", ""],
    ["include", "", ""],
    ["exclude", "", "E01"],
    ["exclude", "", "E02"],
    ["exclude", "", "E03"],
    ["uncertain", "", ""],
    ["include", "", ""],
  ];
  const independentPlan = hieuPlan.map((entry) => [...entry]);
  independentPlan[6] = ["include", "", ""];
  for (const [recordId, override] of Object.entries(independentOverrides)) {
    const index = Number(recordId.slice(-3)) - 1;
    independentPlan[index] = [
      override.decision,
      override.evidenceClass ?? "",
      override.primaryReason ?? "",
    ];
  }
  const hieuRows = pilotRecords.map((record, index) =>
    decisionRow({
      record,
      reviewerRole: REVIEWERS.hieu.role,
      reviewerId: "Hiếu",
      decision: hieuPlan[index][0],
      evidenceClass: hieuPlan[index][1],
      primaryReason: hieuPlan[index][2],
      decidedAt: `2026-08-26T01:${String(index).padStart(2, "0")}:00Z`,
    }),
  );
  const independentRows = pilotRecords.map((record, index) =>
    decisionRow({
      record,
      reviewerRole: REVIEWERS.independent.role,
      reviewerId: "Hoang",
      decision: independentPlan[index][0],
      evidenceClass: independentPlan[index][1],
      primaryReason: independentPlan[index][2],
      decidedAt: `2026-08-26T02:${String(index).padStart(2, "0")}:00Z`,
    }),
  );
  const hieuDecisionsBytes = csvFromObjects(DECISION_HEADERS, hieuRows);
  const independentDecisionsBytes = csvFromObjects(
    DECISION_HEADERS,
    independentRows,
  );
  const hieuNonce = Buffer.from(
    Array.from({ length: 32 }, (_, index) => index + 1),
  );
  const independentNonce = Buffer.from(
    Array.from({ length: 32 }, (_, index) => index + 65),
  );
  const hieuCommitment = {
    schema_version: "1.2.0",
    task: "SLR-103",
    pilot_set_sha256: sha256(pilotSetBytes),
    reviewer_role: REVIEWERS.hieu.role,
    reviewer_id: "Hiếu",
    decision_path: CALIBRATION_PATHS.hieuDecisions,
    decision_commitment_sha256: decisionCommitmentSha256(
      hieuNonce,
      {
        pilotSetSha256: sha256(pilotSetBytes),
        reviewerRole: REVIEWERS.hieu.role,
        decisionPath: CALIBRATION_PATHS.hieuDecisions,
        decisionBytes: hieuDecisionsBytes,
      },
    ),
    row_count: 8,
    sealed_at_utc: "2026-08-26T03:00:00Z",
  };
  const independentCommitment = {
    schema_version: "1.2.0",
    task: "SLR-103",
    pilot_set_sha256: sha256(pilotSetBytes),
    reviewer_role: REVIEWERS.independent.role,
    reviewer_id: "Hoang",
    decision_path: CALIBRATION_PATHS.independentDecisions,
    decision_commitment_sha256: decisionCommitmentSha256(
      independentNonce,
      {
        pilotSetSha256: sha256(pilotSetBytes),
        reviewerRole: REVIEWERS.independent.role,
        decisionPath: CALIBRATION_PATHS.independentDecisions,
        decisionBytes: independentDecisionsBytes,
      },
    ),
    row_count: 8,
    sealed_at_utc: "2026-08-26T03:00:00Z",
  };
  const hieuCommitmentBytes = Buffer.from(canonicalJson(hieuCommitment), "utf8");
  const independentCommitmentBytes = Buffer.from(
    canonicalJson(independentCommitment),
    "utf8",
  );
  const hieuReveal = {
    schema_version: "1.2.0",
    task: "SLR-103",
    reviewer_role: REVIEWERS.hieu.role,
    reviewer_id: "Hiếu",
    decision_path: CALIBRATION_PATHS.hieuDecisions,
    decision_file_sha256: sha256(hieuDecisionsBytes),
    nonce_base64: hieuNonce.toString("base64"),
    decision_commitment_sha256: hieuCommitment.decision_commitment_sha256,
    revealed_at_utc: "2026-08-26T03:05:00Z",
  };
  const independentReveal = {
    schema_version: "1.2.0",
    task: "SLR-103",
    reviewer_role: REVIEWERS.independent.role,
    reviewer_id: "Hoang",
    decision_path: CALIBRATION_PATHS.independentDecisions,
    decision_file_sha256: sha256(independentDecisionsBytes),
    nonce_base64: independentNonce.toString("base64"),
    decision_commitment_sha256:
      independentCommitment.decision_commitment_sha256,
    revealed_at_utc: "2026-08-26T03:05:00Z",
  };
  const hieuRevealBytes = Buffer.from(canonicalJson(hieuReveal), "utf8");
  const independentRevealBytes = Buffer.from(
    canonicalJson(independentReveal),
    "utf8",
  );

  const reconciliations = [];
  for (let index = 0; index < hieuRows.length; index += 1) {
    const hieu = hieuRows[index];
    const independent = independentRows[index];
    const types = [];
    if (hieu.decision !== independent.decision) types.push("decision");
    if (hieu.evidence_class !== independent.evidence_class) {
      types.push("evidence_class");
    }
    if (
      hieu.decision === "exclude" &&
      independent.decision === "exclude" &&
      hieu.primary_reason_code !== independent.primary_reason_code
    ) {
      types.push("primary_reason");
    }
    if (types.length === 0) continue;
    const finalSource = hieu.decision === "uncertain" ? independent : hieu;
    const reconciliation = {
      record_id: hieu.record_id,
      round: "title-abstract",
      hieu_decision_sha256: hieu.decision_sha256,
      independent_decision_sha256: independent.decision_sha256,
      disagreement_types: types.join(";"),
      final_decision: finalSource.decision,
      final_evidence_class: finalSource.evidence_class,
      final_primary_reason_code: finalSource.primary_reason_code,
      final_secondary_reason_codes: finalSource.secondary_reason_codes,
      resolution_rationale: `Resolved ${hieu.record_id} from the retained snapshot.`,
      evidence_location: `https://api.crossref.org/works/10.9999%2Fcalibration.${index + 1}#method`,
      hieu_reviewer_id: "Hiếu",
      hieu_approved_at_utc: `2026-08-26T04:${String(index).padStart(2, "0")}:00Z`,
      independent_reviewer_id: "Hoang",
      independent_approved_at_utc: `2026-08-26T04:${String(index + 10).padStart(2, "0")}:00Z`,
      reconciliation_sha256: "",
    };
    reconciliation.reconciliation_sha256 = reconciliationSha256(reconciliation);
    reconciliations.push(reconciliation);
  }
  const reconciliationBytes = csvFromObjects(
    RECONCILIATION_HEADERS,
    reconciliations,
  );
  const commitmentCommit = "a".repeat(40);
  const commitmentFiles = new Map([
    [CALIBRATION_PATHS.pilotSet, pilotSetBytes],
    ...recordArtifacts,
    [CALIBRATION_PATHS.hieuCommitment, hieuCommitmentBytes],
    [CALIBRATION_PATHS.independentCommitment, independentCommitmentBytes],
  ]);
  const commitmentBoundary = {
    commit: commitmentCommit,
    isAncestor: true,
    isStrictAncestor: true,
    files: commitmentFiles,
    entries: new Map(
      [...commitmentFiles.keys()].map((path) => [
        path,
        { mode: "100644", type: "blob", oid: "b".repeat(40) },
      ]),
    ),
  };
  const inputs = {
    pilotSetBytes,
    recordArtifacts,
    hieuDecisionsBytes,
    independentDecisionsBytes,
    hieuCommitmentBytes,
    independentCommitmentBytes,
    hieuRevealBytes,
    independentRevealBytes,
    reconciliationBytes,
    commitmentCommit,
    commitmentBoundary,
  };
  const result = evaluateSlrScreeningCalibration(inputs);
  if (result.issues.length > 0 && !allowFailed) {
    throw new Error(`invalid calibration fixture:\n${result.issues.join("\n")}`);
  }
  return {
    ...inputs,
    summaryBytes: Buffer.from(result.summaryText, "utf8"),
    summary: result.summary,
    issues: result.issues,
    hieuRows,
    independentRows,
    reconciliations,
  };
}
