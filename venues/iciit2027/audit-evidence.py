"""Independent reporting audit of retained observations, not a new experiment.
Usage: python audit-evidence.py PATH_TO_BENCHMARK_REPO [OUTPUT_JSON]
No network, predictions, labels, signatures or frozen inputs are changed.
"""
import collections, hashlib, json, math, re, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
COMMIT = '24d63ebf2fc3075a1d64f1eaff38cdc0b7f586fb'
repo = Path(sys.argv[1]).resolve()
out = Path(sys.argv[2]) if len(sys.argv) > 2 else ROOT/'review-audit.json'
hashes = {}
def pinned(path):
    raw = subprocess.check_output(['git', '-C', str(repo), 'show', COMMIT + ':' + path])
    hashes[path] = hashlib.sha256(raw).hexdigest()
    return json.loads(raw)

truth = pinned('order-platform/ground-truth.json')
p2 = pinned('evidence/phase-2-results.json')
p3 = pinned('evidence/phase-3-results.json')
old = pinned('evidence/typescript-pattern-baseline-v0.1.json')
new = pinned('evidence/typescript-pattern-results.json')
cases = p2['result']['cases']
assert len({c['id'] for c in cases}) == len(cases) == 20
assert {c['id'] for c in cases} == {c['id'] for c in truth['cases']} == {c['id'] for c in p3['cases']}
d1 = {
    'systems': 1,
    'classification': [sum(c['actual'] == c['expected'] for c in cases), len(cases)],
    'label_distribution': dict(collections.Counter(c['category'] for c in truth['cases'])),
}
for kind in ('nodes', 'edges'):
    expected = actual = matched = 0
    for c in cases:
        for direction in ('added', 'removed'):
            e, a = set(c['expected_'+direction+'_'+kind]), set(c['actual_'+direction+'_'+kind])
            expected += len(e); actual += len(a); matched += len(e & a)
    d1['changed_'+kind] = {'matched': matched, 'expected': expected, 'actual': actual}
violations = [c for c in cases if c['expected'] == 'violation']
d1['violation_rule_sets'] = [sum(set(c['expected_rule_ids']) == set(c['actual_rule_ids']) for c in violations), len(violations)]
groups = {'call_sites': [], 'missing_relation_anchors': []}
indexed = {c['id']: c for c in cases}
for c in truth['cases']:
    findings = c['expected']['findings']
    if not findings:
        continue
    types = {f['kind'] for f in findings}
    key = 'missing_relation_anchors' if types <= {'required-edge', 'required-path'} else 'call_sites'
    expected = c['expected']['evidence']
    actual = indexed[c['id']]['actual_evidence']
    ok = all(any(x['file'] == y['file'] and x['line'] == y['line'] for y in actual) for x in expected)
    groups[key].append({'case': c['id'], 'all_declared_locations_matched': ok})
d1['locations'] = {k: {'matches': sum(x['all_declared_locations_matched'] for x in v), 'cases': len(v), 'case_ids': [x['case'] for x in v]} for k,v in groups.items()}
assert d1['classification'] == [20,20] and d1['violation_rule_sets'] == [7,7]
assert d1['changed_nodes'] == {'matched':5,'expected':5,'actual':5}
assert d1['changed_edges'] == {'matched':12,'expected':12,'actual':12}
replay = {
 'decisions': [sum(c['expected_decision'] == c['actual_decision'] for c in p3['cases']), len(p3['cases'])],
 'incremental_parsed_file_instances': sum(c['incremental_scanned_files'] for c in p3['cases']),
 'full_head_file_instances': sum(c['head_scanned_files'] for c in p3['cases']),
 'reported_exact_delta_matches': sum(c['architecture_delta_match'] for c in p3['cases']),
 'reported_full_scan_matches': sum(c['incremental_full_scan_match'] for c in p3['cases']),
 'reported_deterministic_cases': sum(c['deterministic'] for c in p3['cases']),
}
assert replay['incremental_parsed_file_instances'] == 57 and replay['full_head_file_instances'] == 189
d2 = {}
fields = ['true_positive','false_positive','false_negative','true_negative']
for name, result in [('v0.1', old['result']), ('v0.2', new['result'])]:
    summed = {k:sum(v[k] for v in result['metrics']['by_detector'].values()) for k in fields}
    assert summed == {k:result['metrics']['overall'][k] for k in fields}
    assert sum(summed.values()) == 40
    d2[name] = summed
latency = {}
for mode in ('cold', 'warm'):
    observations = sorted(p3['performance'][mode+'_total_ms'])
    latency[mode] = {q:observations[math.ceil(p*len(observations))-1] for q,p in [('p50',.5),('p95',.95)]}
assert latency == {'cold':{'p50':518.51,'p95':531.05},'warm':{'p50':242.62,'p95':249.30}}
development = {}
for phase, folder in [('initial','mutations-initial'),('final','mutations')]:
    path = ROOT/'evidence/archsync-core/evidence/rigor-2026-09-26'/folder/'summary.json'
    data = json.loads(path.read_text(encoding='utf-8'))
    runs = [r for r in data['runs'] if r['id'] != 'baseline']
    counts = dict(collections.Counter(r['status'] for r in runs))
    development[phase] = {'mutants':len(runs),'statuses':counts}
    assert counts['assertion-failure'] == data['killed']
for name in ['before','after']:
    path = ROOT/'evidence/guardian-0.4'/f'{name}.log'
    text = path.read_text(encoding='utf-8')
    counts = re.findall(r'(?m)^\s+Tests\s+([^\r\n]+)', text)
    development['adversarial_'+name] = counts
report = {
 'status':'retained-observation-audit-not-new-experimental-evidence',
 'benchmark_commit':COMMIT, 'input_sha256':hashes,
 'D1':d1, 'P3':replay, 'D2_group_reconciliation':d2,
 'nearest_rank_latency_ms':latency,
 'finite_domain_arithmetic':{'graphs':2**12,'rule_configurations':4*4*4*3,'evaluations':2**12*4*4*4*3,'independent_samples':False},
 'retained_failure_receipts':development,
 'limitations':[
  'No analyzer was rerun; no new labels or benchmark observations were created.',
  'D1 classification, changed-item sets and declared locations recomputed from retained per-case fields.',
  'P3 exact-delta/full-scan/determinism entries sum recorded booleans; complete raw paired graphs are not re-derived here.',
  'D2 confusion counts reconcile detector groups with aggregate receipts, not independently relabeled source programs.',
  'Hashes establish identity, not correctness of ground truth.',
  'No independent holdout, executed comparator, population confidence interval or practitioner outcome is supplied.'
 ]
}
out.write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8',newline='\n')
print(json.dumps(report,indent=2))
