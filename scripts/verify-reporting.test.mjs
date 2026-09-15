import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { verifyReporting, fromDisk } from "./verify-reporting.mjs";
const original = JSON.parse(readFileSync(new URL("../supplementary/reporting/rq3-decomposition.json", import.meta.url)));
const script = readFileSync(new URL("../research/derive-reporting.py", import.meta.url));
test("real retained reporting derivation is internally consistent", () => assert.equal(fromDisk(), true));
test("retained PDF and complete-source bytes match the validation manifest", () => {
  const manifest = JSON.parse(readFileSync(new URL("../supplementary/length-variant-validation.json", import.meta.url)));
  assert.equal(manifest.status, "PASS");
  assert.deepEqual(manifest.variants.map(x => x.pages), [8, 12]);
  for (const item of manifest.variants) for (const [extension, field] of [["pdf", "pdf_sha256"], ["tex", "source_sha256"]]) {
    const bytes = readFileSync(new URL("../" + item.file + "." + extension, import.meta.url));
    assert.equal(item[field], createHash("sha256").update(bytes).digest("hex"));
  }
});
for (const [name, mutate] of [
  ["anchor counted as call-site", d => d.summary.call_site_localization.denominator = 11],
  ["duplicate location case", d => d.cases[0].id = d.cases[1].id],
  ["wrong latency observation", d => d.latency.cold.raw_ms[0] = 0],
  ["median relabeled as p50", d => d.latency.cold.nearest_rank_p50_ms = d.latency.cold.arithmetic_median_ms],
  ["different measurement revision", d => d.benchmark_commit = "0".repeat(40)],
  ["changed derivation source", d => d.script_sha256 = "0".repeat(64)],
]) test("rejects " + name, () => {
  const data = structuredClone(original);
  mutate(data);
  assert.throws(() => verifyReporting(data, script));
});
test("both manuscripts retain model-conditioned and finite-sample boundaries", () => {
  for (const name of ["archsync-8page.tex", "archsync-12page.tex"]) {
    const source = readFileSync(new URL("../" + name, import.meta.url), "utf8");
    assert.ok(source.includes("A(S;M)"));
    assert.match(source, /nearest-rank/);
    assert.match(source, /9\/9/);
    assert.match(source, /2\/2/);
    assert.ok(source.includes("External comparison remains future work"));
    assert.doesNotMatch(source, /[\u2014\u27f6\u201c\u201d]/u);
  }
});
