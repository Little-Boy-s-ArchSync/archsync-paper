import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  benjaminiHochberg,
  cliffsDelta,
  pairedBootstrapDifference,
  summarizeAnalysisPopulation,
  validateStatisticalAnalysisPlan,
  wilsonInterval,
} from "./statistical-analysis.mjs";

test("statistical plan is complete but remains visibly unfrozen", async () => {
  const text = await readFile(new URL("statistical-analysis-plan.md", import.meta.url), "utf8");
  assert.deepEqual(validateStatisticalAnalysisPlan(text), []);
  assert.deepEqual(validateStatisticalAnalysisPlan(""), ["plan text is required"]);
  const issues = validateStatisticalAnalysisPlan("draft");
  assert.equal(issues.length, 13);
});

test("statistical plan keeps the V-RQ4 joint criterion and atomic co-freeze unresolved", async () => {
  const text = await readFile(new URL("statistical-analysis-plan.md", import.meta.url), "utf8");
  for (const mutation of [
    text.replace("joint decision criterion", "completion-time criterion"),
    text.replace("non-inferiority endpoint and margin", "productivity summary"),
    text.replace("remains pending human approval", "is approved"),
  ]) assert.notDeepEqual(validateStatisticalAnalysisPlan(mutation), []);
});

test("Wilson intervals retain exact numerators and denominators", () => {
  const interval = wilsonInterval(5, 10);
  assert.equal(interval.estimate, 0.5);
  assert.equal(interval.successes, 5);
  assert.equal(interval.total, 10);
  assert.ok(Math.abs(interval.low - 0.23658959361548731) < 1e-12);
  assert.ok(Math.abs(interval.high - 0.7634104063845126) < 1e-12);
  assert.deepEqual(wilsonInterval(0, 0), { estimate: null, low: null, high: null, successes: 0, total: 0 });
  for (const counts of [[-1, 1], [2, 1], [1.5, 2], [1, 1.5]]) assert.throws(() => wilsonInterval(...counts), /valid integer/);
  for (const z of [0, Number.NaN]) assert.throws(() => wilsonInterval(1, 2, z), /positive/);
});

test("Cliff's delta counts greater, lesser and tied pairs", () => {
  assert.deepEqual(cliffsDelta([1, 2], [2, 3]), { estimate: -0.75, greater: 0, less: 3, pairs: 4 });
  assert.deepEqual(cliffsDelta([3], [1]), { estimate: 1, greater: 1, less: 0, pairs: 1 });
  for (const samples of [[[], [1]], [[1], []], [[Number.NaN], [1]], [null, [1]]]) assert.throws(() => cliffsDelta(...samples), /non-empty finite/);
});

test("paired bootstrap is seeded, paired and formula checked", () => {
  const pairs = [
    { control: 10, treatment: 8 },
    { control: 12, treatment: 9 },
    { control: 8, treatment: 8 },
    { control: 15, treatment: 10 },
  ];
  const first = pairedBootstrapDifference(pairs, { iterations: 500, seed: 7, statistic: "mean" });
  const second = pairedBootstrapDifference(pairs, { iterations: 500, seed: 7, statistic: "mean" });
  assert.deepEqual(first, second);
  assert.equal(first.estimate, -2.5);
  assert.equal(first.n_pairs, 4);
  assert.equal(pairedBootstrapDifference(pairs, { iterations: 100, seed: 0 }).method, "paired cluster bootstrap (median)");
  assert.equal(pairedBootstrapDifference(pairs.slice(0, 3), { iterations: 100, seed: 1 }).estimate, -2);
  for (const invalid of [[], [{ control: 1, treatment: 1 }], [null, null], [{ control: Number.NaN, treatment: 1 }, { control: 1, treatment: 1 }]]) assert.throws(() => pairedBootstrapDifference(invalid), /at least two/);
  assert.throws(() => pairedBootstrapDifference(pairs, { iterations: 99 }), /iterations/);
  assert.throws(() => pairedBootstrapDifference(pairs, { iterations: 100.5 }), /iterations/);
  assert.throws(() => pairedBootstrapDifference(pairs, { iterations: 100, seed: -1 }), /seed/);
  assert.throws(() => pairedBootstrapDifference(pairs, { iterations: 100, statistic: "mode" }), /mean or median/);
});

test("Benjamini-Hochberg correction is monotone and ID-stable", () => {
  assert.deepEqual(benjaminiHochberg([
    { id: "c", p_value: 0.04 },
    { id: "a", p_value: 0.01 },
    { id: "b", p_value: 0.03 },
  ]), [
    { id: "a", p_value: 0.01, adjusted_p_value: 0.03, reject: true },
    { id: "b", p_value: 0.03, adjusted_p_value: 0.04, reject: true },
    { id: "c", p_value: 0.04, adjusted_p_value: 0.04, reject: true },
  ]);
  assert.deepEqual(benjaminiHochberg([{ id: "b", p_value: 0.5 }, { id: "a", p_value: 0.5 }]).map((row) => row.id), ["a", "b"]);
  for (const [rows, alpha] of [[[], 0.05], [[{ id: "a", p_value: 0.1 }], 0], [[{ id: "a", p_value: 0.1 }], 1]]) assert.throws(() => benjaminiHochberg(rows, alpha), /required/);
  for (const invalid of [null, { id: "", p_value: 0.1 }, { id: "a", p_value: -1 }, { id: "a", p_value: Number.NaN }]) assert.throws(() => benjaminiHochberg([invalid]), /invalid/);
  assert.throws(() => benjaminiHochberg([{ id: "a", p_value: 0.1 }, { id: "a", p_value: 0.2 }]), /duplicate/);
});

test("analysis population retains failures and only predeclared exclusions", () => {
  assert.deepEqual(summarizeAnalysisPopulation([
    { id: "a", status: "completed" },
    { id: "b", status: "failed" },
    { id: "c", status: "inconclusive" },
    { id: "d", status: "excluded", predeclared_exclusion: true, exclusion_reason: "ineligible baseline" },
  ]), {
    n: 4,
    statuses: { completed: 1, failed: 1, inconclusive: 1, excluded: 1 },
    analyzed_n: 3,
    completion_rate: 1 / 3,
  });
  assert.throws(() => summarizeAnalysisPopulation([]), /required/);
  for (const invalid of [null, { id: "", status: "failed" }, { id: "a", status: "unknown" }]) assert.throws(() => summarizeAnalysisPopulation([invalid]), /invalid/);
  assert.throws(() => summarizeAnalysisPopulation([{ id: "a", status: "failed" }, { id: "a", status: "completed" }]), /duplicate/);
  for (const row of [{ id: "x", status: "excluded" }, { id: "x", status: "excluded", predeclared_exclusion: true, exclusion_reason: "" }]) assert.throws(() => summarizeAnalysisPopulation([row]), /predeclared/);
});
