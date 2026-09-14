# Round 2 metadata amendment — unaccepted proposal

This draft corrects only CAL-013's abstract and CAL-018's publication date.
The other seven candidate records remain byte-identical. Review the
[current candidate manifest](../../slr-screening-calibration-round-2-candidates/manifest.json),
[mandatory delivered provenance](AMENDMENT-PROVENANCE.json) and
[source review and limitations](CHANGE_REVIEW.md) together.

Both reviewers' personal inspection, independence confirmation and fresh
explicit acceptance of the same exact manifest, delivered provenance and common
selection remain outstanding. The proposed packet retains CAL-010 through
CAL-018; this delivery makes no pilot selection. No acceptance of an older
manifest or provenance carries over, and further byte changes require review.

| Artifact | SHA-256 |
| --- | --- |
| Proposed candidate manifest | `0dc44715da2113112eb51e7262073a7fefe5237f0e66f775705b5ba96d6943ae` |
| Mandatory delivered provenance | `45ca6f35cd86406c7624423b6983fa1775c7bae46bea7747178bb2a8e9123861` |
| Historical original candidate manifest | `9639d49ef127a84ec87b293cfc458a0b6b37698bef0ba14637b16a2588f3dd4e` |
| Historical preparation provenance | `21bb1e8f46bdd871c816aa2ebc71d1387a98d0007e121162d9007332fb8ace22` |
| Complete retained local archive's SHA256SUMS | `1bc24cbac21ac479b8773e5dfaf697d8854bcebb0c0c77b2f550a2e2c041fdf9` |

The canonical candidate README and record `evidence_location` and
`captured_at_utc` fields retain their original API snapshot lineage. They do
not attribute the repaired fields to those old API responses. The companion
provenance identifies the primary sources, actual retrieval times, exact source
hashes and extraction methods for the corrections.

The original metadata packet remains in Git ancestry at PR26 base commit
`d233fc2e84e3f3507d815793e6fe69fd0342a802`. The complete preparation archive,
including full source captures, the linked paper, original/proposed metadata,
source extraction scripts and historical check results, remains in the
operator workspace at `preparation/2026-09-08/slr-repair/`. Full publisher pages
and the paper are not included in this repository delivery. All source paths
inside the provenance refer to that retained local archive. Reviewers need that
archive for source re-extraction and must not treat the repository verifier as
independent source verification.

[RETAINED-ARCHIVE-SHA256SUMS](RETAINED-ARCHIVE-SHA256SUMS) is the unchanged
checksum inventory of that local archive, not this directory's file inventory.
The delivered provenance preserves the original field/source hashes and
retrieval times, adds the original provenance and archive identities, and
clarifies local source-path semantics. Its changed bytes have the new delivered
provenance digest above.

From the repository root, check public packet/provenance integrity and
structural compatibility using Python 3 and Node 22.16.0:

```sh
python3 -B research/evidence/slr-screening-calibration-round-2-amendments/2026-09-08/verify-amendment.py
node research/validate-slr-calibration-round-2-candidates.mjs
node research/validate-screening-criteria.mjs
node --test research/validate-slr-calibration-candidates.test.mjs research/validate-slr-calibration-round-2-candidates.test.mjs research/validate-screening-criteria.test.mjs
```

The existing CI and local paper gate run the Round 2 validator and its tests.
They enforce the exact candidate manifest, delivered provenance and retained
archive-inventory bytes, including rejection of parse-equivalent JSON changes.

For the separate complete local archive integrity and source re-extraction
check, supply the actual retained archive directory:

```sh
python3 -B research/evidence/slr-screening-calibration-round-2-amendments/2026-09-08/verify-amendment.py --archive /path/to/preparation/2026-09-08/slr-repair
```

The candidate root retains its required inventory of only `README.md`,
`manifest.json` and `records/`. Keep the proposed packet and this companion
provenance together for review and any future governed representation. Only
after both reviewers' fresh acceptance may the governed pilot and fresh private
decisions and nonces be created under the
[reviewer runbook](../../../SLR-REVIEWER-RUNBOOK.md#4-calibration-tiêu-chí-screening-slr-103).

These checks do not establish source completeness, human acceptance, reviewer
independence, passing calibration or protocol readiness. SLR-103 and SLR-REV-101
remain unfinished. This proposal adds no official search results, human
decisions, commitments, reveals, reconciliation, signed review or freeze evidence.
