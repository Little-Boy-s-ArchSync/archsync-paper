"""Post-hoc decomposition of the frozen D1 location measure; no new labels.

Usage: python research/derive-reporting.py BENCHMARK_AT_24d63eb OUTPUT_JSON
Uses only the Python standard library. Fails closed on mixed/unknown case types.
"""
import hashlib
import json
import pathlib
import sys
import math
import statistics


def derive(ground_truth, phase2, phase3):
    p2 = {c['id']: c for c in phase2['result']['cases']}
    p3 = {c['id']: c for c in phase3['cases']}
    rows = []
    for case in ground_truth['cases']:
        findings = case['expected']['findings']
        if not findings:
            continue
        kinds = {f['kind'] for f in findings}
        anchors = {'required-edge', 'required-path'}
        calls = {'deny-rule', 'allow-rule', 'architecture-evolution'}
        if kinds <= anchors:
            metric = 'anchor_agreement'
        elif kinds <= calls:
            metric = 'call_site_localization'
        else:
            raise ValueError(f"Mixed or unknown finding kinds: {case['id']}: {kinds}")
        expected = [{k: e[k] for k in ('file', 'line')} for e in case['expected']['evidence']]
        if not expected:
            raise ValueError('Finding-bearing case has no location oracle')
        # The historical P2 artifact retains aggregated matched-finding evidence,
        # not the complete finding objects. Preserve that case-level unit.
        actual2 = p2[case['id']]['actual_evidence']
        # Historical P3 flattened all introduced evidence. Here restrict it to
        # the declared finding kind/rule or evolution endpoints before matching.
        matched = []
        for finding in p3[case['id']]['introduced_findings']:
            for oracle in findings:
                if finding['kind'] != oracle['kind']:
                    continue
                if oracle['kind'] == 'architecture-evolution':
                    edge = finding.get('edge', '').split('|')
                    if len(edge) != 3 or (edge[0], edge[2]) != (oracle['from'], oracle['to']):
                        continue
                elif finding.get('rule_id') != oracle['id']:
                    continue
                matched.extend(finding['source_evidence'])
                break
        def score(actual):
            return {
                'file': all(any(a['file'] == e['file'] for a in actual) for e in expected),
                'exact_line': all(any(a['file'] == e['file'] and a['line'] == e['line'] for a in actual) for e in expected),
            }
        rows.append({'id': case['id'], 'metric': metric, 'oracle_kinds': sorted(kinds),
                     'expected': expected, 'phase2_actual_evidence': actual2,
                     'phase3_matched_evidence': matched, 'phase2': score(actual2), 'phase3': score(matched)})
    summary = {}
    for metric in ('call_site_localization', 'anchor_agreement'):
        group = [r for r in rows if r['metric'] == metric]
        summary[metric] = {'denominator': len(group), 'case_ids': [r['id'] for r in group]}
        for phase in ('phase2', 'phase3'):
            summary[metric][phase] = {s: sum(r[phase][s] for r in group) for s in ('file', 'exact_line')}
    return {'unit': 'finding-bearing D1 case; all declared locations must have a match',
            'interpretation': 'Post-hoc reporting decomposition, not independent validation or per-finding recall',
            'summary': summary, 'cases': rows}


if __name__ == '__main__':
    root, output = map(pathlib.Path, sys.argv[1:])
    paths = ['order-platform/ground-truth.json', 'evidence/phase-2-results.json', 'evidence/phase-3-results.json']
    raw = [(root / p).read_bytes() for p in paths]
    inputs = [json.loads(b) for b in raw]
    result = derive(*inputs)
    performance = inputs[2]['performance']
    result['latency'] = {'unit': 'milliseconds; one sequential cold/warm observation per D1 case',
                         'quantile_method': 'nearest rank; sorted[ceil(p*n)-1]'}
    for mode in ('cold', 'warm'):
        samples = performance[mode + '_total_ms']
        if len(samples) != 20 or any(not isinstance(x, (int, float)) or x < 0 for x in samples):
            raise ValueError('Invalid historical latency samples')
        ranked = sorted(samples)
        p50, p95 = (ranked[math.ceil(p * len(samples)) - 1] for p in (0.5, 0.95))
        if p50 != performance[mode + '_median_ms'] or p95 != performance[mode + '_p95_ms']:
            raise ValueError('Reported historical percentile differs from raw observations')
        result['latency'][mode] = {'raw_ms': samples, 'nearest_rank_p50_ms': p50,
                                  'nearest_rank_p95_ms': p95,
                                  'arithmetic_median_ms': statistics.median(samples)}
    result['latency']['p50_reduction_percent'] = 100 * (1 - result['latency']['warm']['nearest_rank_p50_ms'] /
                                                      result['latency']['cold']['nearest_rank_p50_ms'])
    result['benchmark_commit'] = '24d63ebf2fc3075a1d64f1eaff38cdc0b7f586fb'
    result['input_sha256'] = {p: hashlib.sha256(b).hexdigest() for p, b in zip(paths, raw)}
    result['script_sha256'] = hashlib.sha256(pathlib.Path(__file__).read_bytes()).hexdigest()
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(result, indent=2) + '\n', encoding='utf8')
    print(json.dumps(result['summary'], indent=2))
