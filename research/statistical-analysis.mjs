function finiteNumber(value) {
  return Number.isFinite(value);
}

function median(values) {
  const ordered = [...values].sort((a, b) => a - b);
  const middle = Math.floor(ordered.length / 2);
  return ordered.length % 2 === 0 ? (ordered[middle - 1] + ordered[middle]) / 2 : ordered[middle];
}

export function wilsonInterval(successes, total, z = 1.96) {
  if (!Number.isInteger(successes) || !Number.isInteger(total) || successes < 0 || total < 0 || successes > total) {
    throw new Error("successes and total must be valid integer counts");
  }
  if (!finiteNumber(z) || z <= 0) throw new Error("z must be positive");
  if (total === 0) return { estimate: null, low: null, high: null, successes, total };
  const estimate = successes / total;
  const z2 = z * z;
  const adjusted = 1 + z2 / total;
  const center = (estimate + z2 / (2 * total)) / adjusted;
  const margin = z * Math.sqrt((estimate * (1 - estimate) + z2 / (4 * total)) / total) / adjusted;
  return {
    estimate,
    low: Math.max(0, center - margin),
    high: Math.min(1, center + margin),
    successes,
    total,
  };
}

export function cliffsDelta(first, second) {
  if (!Array.isArray(first) || !Array.isArray(second) || first.length === 0 || second.length === 0 || !first.every(finiteNumber) || !second.every(finiteNumber)) {
    throw new Error("Cliff's delta requires two non-empty finite samples");
  }
  let greater = 0;
  let less = 0;
  for (const left of first) {
    for (const right of second) {
      if (left > right) greater += 1;
      else if (left < right) less += 1;
    }
  }
  return { estimate: (greater - less) / (first.length * second.length), greater, less, pairs: first.length * second.length };
}

function generator(seed) {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

function statistic(values, kind) {
  if (kind === "median") return median(values);
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function quantile(ordered, probability) {
  return ordered[Math.min(ordered.length - 1, Math.max(0, Math.ceil(probability * ordered.length) - 1))];
}

export function pairedBootstrapDifference(pairs, options = {}) {
  const iterations = options.iterations ?? 2000;
  const seed = options.seed ?? 20260826;
  const kind = options.statistic ?? "median";
  if (!Array.isArray(pairs) || pairs.length < 2 || !pairs.every((pair) => pair && finiteNumber(pair.control) && finiteNumber(pair.treatment))) {
    throw new Error("paired bootstrap requires at least two finite control/treatment pairs");
  }
  if (!Number.isInteger(iterations) || iterations < 100) throw new Error("iterations must be an integer of at least 100");
  if (!Number.isInteger(seed) || seed < 0) throw new Error("seed must be a non-negative integer");
  if (!["mean", "median"].includes(kind)) throw new Error("statistic must be mean or median");
  const random = generator(seed);
  const differences = pairs.map((pair) => pair.treatment - pair.control);
  const estimates = [];
  for (let iteration = 0; iteration < iterations; iteration += 1) {
    const sample = [];
    for (let index = 0; index < pairs.length; index += 1) sample.push(differences[Math.floor(random() * differences.length)]);
    estimates.push(statistic(sample, kind));
  }
  estimates.sort((a, b) => a - b);
  return {
    estimate: statistic(differences, kind),
    low: quantile(estimates, 0.025),
    high: quantile(estimates, 0.975),
    confidence: 0.95,
    method: `paired cluster bootstrap (${kind})`,
    iterations,
    seed,
    n_pairs: pairs.length,
  };
}

export function benjaminiHochberg(rows, alpha = 0.05) {
  if (!Array.isArray(rows) || rows.length === 0 || !finiteNumber(alpha) || alpha <= 0 || alpha >= 1) throw new Error("p-values and alpha are required");
  const ids = new Set();
  const ordered = rows.map((row) => {
    if (!row || typeof row.id !== "string" || row.id.length === 0 || ids.has(row.id) || !finiteNumber(row.p_value) || row.p_value < 0 || row.p_value > 1) {
      throw new Error("invalid or duplicate p-value row");
    }
    ids.add(row.id);
    return { id: row.id, p_value: row.p_value };
  }).sort((a, b) => a.p_value - b.p_value || a.id.localeCompare(b.id));
  let running = 1;
  for (let index = ordered.length - 1; index >= 0; index -= 1) {
    running = Math.min(running, ordered[index].p_value * ordered.length / (index + 1));
    ordered[index].adjusted_p_value = running;
    ordered[index].reject = running <= alpha;
  }
  return ordered.sort((a, b) => a.id.localeCompare(b.id));
}

export function summarizeAnalysisPopulation(rows) {
  if (!Array.isArray(rows) || rows.length === 0) throw new Error("analysis rows are required");
  const statuses = { completed: 0, failed: 0, inconclusive: 0, excluded: 0 };
  const ids = new Set();
  for (const row of rows) {
    if (!row || typeof row.id !== "string" || row.id.length === 0 || ids.has(row.id) || !Object.hasOwn(statuses, row.status)) throw new Error("invalid or duplicate analysis row");
    if (row.status === "excluded" && (row.predeclared_exclusion !== true || typeof row.exclusion_reason !== "string" || row.exclusion_reason.length === 0)) {
      throw new Error("exclusions must be predeclared with a reason");
    }
    ids.add(row.id);
    statuses[row.status] += 1;
  }
  return {
    n: rows.length,
    statuses,
    analyzed_n: rows.length - statuses.excluded,
    completion_rate: (statuses.completed) / (rows.length - statuses.excluded),
  };
}

export function validateStatisticalAnalysisPlan(text) {
  if (typeof text !== "string" || text.length === 0) return ["plan text is required"];
  const issues = [];
  for (const [pattern, message] of [
    [/^\| Task \| STAT-101 \|$/m, "Task metadata must be STAT-101"],
    [/^\| Status \| PROPOSED /m, "Status must remain PROPOSED"],
    [/EXP-101; RQ-102; EXP-103/, "Blocking dependencies must be explicit"],
    [/^## Units of analysis and clustering$/m, "Units and clustering section is required"],
    [/^## Outcomes and estimands$/m, "Outcomes and estimands section is required"],
    [/^## Analysis populations, failure and missingness$/m, "Failure and missingness section is required"],
    [/^## Effect sizes and uncertainty$/m, "Effect sizes and uncertainty section is required"],
    [/^## Multiple comparisons$/m, "Multiple-comparison section is required"],
    [/^## Freeze and change control$/m, "Freeze section is required"],
    [/failed and inconclusive runs remain in their original assigned condition/iu, "Failures must remain in assigned conditions"],
    [/No result, threshold, sample size, or primary comparison is frozen by this draft/iu, "Draft must not claim a result or freeze"],
    [/V-RQ4 must replace the completion-time-only candidate with one\s+joint decision criterion[\s\S]*architecture-drift benefit[\s\S]*productivity non-inferiority[\s\S]*margin[\s\S]*unresolved pending human approval/iu, "V-RQ4 joint benefit/non-inferiority criterion and margin must remain unresolved"],
    [/atomic STAT-101\/EXP-103 co-freeze is the candidate coordination mechanism and remains pending human approval/iu, "Atomic STAT-101/EXP-103 co-freeze must remain a human-pending candidate"],
  ]) {
    if (!pattern.test(text)) issues.push(message);
  }
  return issues;
}
