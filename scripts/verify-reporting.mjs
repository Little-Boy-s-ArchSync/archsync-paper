import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export function verifyReporting(data, script) {
  assert.equal(data.benchmark_commit, "24d63ebf2fc3075a1d64f1eaff38cdc0b7f586fb");
  assert.equal(data.script_sha256, createHash("sha256").update(script).digest("hex"));
  assert.deepEqual(Object.keys(data.input_sha256), ["order-platform/ground-truth.json", "evidence/phase-2-results.json", "evidence/phase-3-results.json"]);
  for (const hash of Object.values(data.input_sha256)) assert.match(hash, /^[a-f0-9]{64}$/);
  assert.equal(data.cases.length, 11);
  assert.equal(new Set(data.cases.map(x => x.id)).size, 11);
  for (const [metric, n] of [["call_site_localization", 9], ["anchor_agreement", 2]]) {
    const rows = data.cases.filter(x => x.metric === metric);
    const summary = data.summary[metric];
    assert.equal(rows.length, n);
    assert.equal(summary.denominator, n);
    assert.deepEqual(summary.case_ids, rows.map(x => x.id));
    for (const phase of ["phase2", "phase3"]) for (const score of ["file", "exact_line"]) {
      assert.equal(summary[phase][score], rows.filter(x => x[phase][score]).length);
      assert.equal(summary[phase][score], n);
    }
  }
  assert.deepEqual(data.summary.anchor_agreement.case_ids, ["case-08", "case-17"]);
  for (const [mode, p50, p95] of [["cold", 518.51, 531.05], ["warm", 242.62, 249.30]]) {
    const d = data.latency[mode], ranked = [...d.raw_ms].sort((a,b) => a-b);
    assert.equal(ranked.length, 20);
    assert.ok(ranked.every(x => Number.isFinite(x) && x >= 0));
    assert.equal(d.nearest_rank_p50_ms, ranked[9]);
    assert.equal(d.nearest_rank_p95_ms, ranked[18]);
    assert.equal(d.nearest_rank_p50_ms, p50);
    assert.equal(d.nearest_rank_p95_ms, p95);
    assert.equal(d.arithmetic_median_ms, (ranked[9] + ranked[10]) / 2);
    assert.notEqual(d.arithmetic_median_ms, d.nearest_rank_p50_ms);
  }
  assert.ok(Math.abs(data.latency.p50_reduction_percent - 100 * (1 - 242.62 / 518.51)) < 1e-10);
  return true;
}

export function fromDisk() {
  return verifyReporting(
    JSON.parse(readFileSync(new URL("../supplementary/reporting/rq3-decomposition.json", import.meta.url), "utf8")),
    readFileSync(new URL("../research/derive-reporting.py", import.meta.url)),
  );
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  fromDisk();
  console.log("VERIFIED REPORTING: historical 9 call-site / 2 anchor cases; nearest-rank latency; no new experiment");
}
