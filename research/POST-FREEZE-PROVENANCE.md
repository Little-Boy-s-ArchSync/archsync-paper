# SLR provenance after the initial freeze

Status: implementation proposed for independent review. This document does not
approve an amendment, a phase decision, a research run, or a changed method.

The original signed source, review record, attestation, signature and public key
retain their original identities. In particular, the published PR26 freeze
`8d61423b20fbff136a79cf183723b96dedc0a3e6` remains signed against reviewed source
`1d84bc58614eeec0d9cc469276d3f362d697deec`. A later PR never acquires that signature.

## Verification boundary

`verify-slr-provenance-lifecycle.mjs` runs for pull requests to main, pushes to
main, and manual runs on main. It uses the event's head SHA, checks GitHub's
current PR/head/base identity, and checks the actual checkout, including GitHub's
temporary PR merge. If a squash merge left an accepted source outside a fresh
clone, Git fetches only its full SHA from the fixed official repository, without
writing refs or FETCH_HEAD. Unavailable objects or API evidence fail closed.
Branch pushes are covered by their PR gate; they do not establish acceptance.

A candidate can skip only when neither its event tree nor trusted base nor
checkout contains a frozen review record, and the trusted base history has never
introduced one. Deleting an inherited record fails, including on main.
The initial freeze PR still calls the original live verifier unchanged: its
open PR, exact head, reviewed ancestor, review/signature, timestamp and original
five-file transition restrictions remain in force. No allowlist was expanded.

A later PR or main run must independently establish all of the following:

- The original record names a real PR accepted and merged into this repository's
  main branch. Its final head identifies the original frozen tree. Its merge
  commit must be in the trusted base, event head and checkout ancestry. Squash
  merge is supported without pretending the reviewed SHA was relabeled.
- GitHub retains an eligible exact-freeze-head approval and no unresolved
  changes-requested review. Listings are paginated. A signed review verifies
  against the original artifacts and key; its timestamp cannot predate the
  reviewed source commit.
- The reviewed source is an ancestor of that freeze. A full local Git tree
  comparison, with replacement objects disabled, proves the five-file scope.
  Replaying the existing freeze generator from the reviewed source must reproduce
  the original protocol and decision-log bytes exactly. This catches method
  edits inside an otherwise allowed filename.
- Every frozen SLR document and SLR evidence path remains byte- and mode-identical
  at the accepted merge, base, later event head and checkout. Protection includes
  new/deleted SLR paths, the original review artifacts, the research baseline,
  glossary, RQ traceability, and decision log. Executable tooling and its tests
  remain subject to ordinary code review; changing this verifier is a policy
  boundary requiring explicit review.
- A later open PR needs an eligible non-author exact-head GitHub approval with
  no unresolved changes request. CI can be rerun after that review arrives; a
  green historical signature is never counted as approval of the later PR.

The current historical path supports the signed freeze. A different historical
approval mode fails with a request for a separately reviewed migration.

## Administrative work and phase corrections

Paper PR32's owner/version metadata concerns proposed external-baseline and
statistical protocols outside the frozen SLR. It can inherit the original SLR
provenance after the accepted freeze is in its history and the administrative
PR is independently reviewed. The verifier does not approve those proposed
methods, D3, experiments, or outputs. An SLR method/evidence change in the same
PR still fails, regardless of its title or assertions that it is administrative.

Historical phase-register and cadence bytes, including the dated P0 HOLD,
are immutable. Corrections append a date and a GitHub evidence link. Every
commit introducing a correction also needs Hiếu's exact-head approval
(`L1nkinPark`, the existing CODEOWNERS identity), verified through the current PR
or a merged associated PR. Main runs recheck the associated approval for inherited
corrections, including squash/rebase histories. Merge-only corrections are
checked too; an accepted merge must preserve the owner-approved phase bytes. A correction is not a GO decision inferred by this tool; only the
accountable owner's actual reviewed decision can change the later state.
No existing phase record is changed by this implementation.

## Remaining governance gates

Protocol Section 17 requires a stopped review, timestamp, reason, affected
records, reviewer approval and rerun decision for operational corrections;
semantic scope/eligibility changes require a separately versioned review/update.
Those obligations remain unchanged. There is no accepted machine-verifiable
post-freeze amendment schema or version migration in the existing policy.
Consequently this implementation rejects changes to frozen SLR method/evidence
and asks for that governed process; an editable amendment file is never trusted
as approval. Automating acceptance of such changes requires a separately reviewed
policy and verifier change. This is deliberately a bounded historical-provenance
fix, not a new research amendment policy.

This implementation itself requires independent policy/code review. Production
historical success additionally requires the original freeze PR's real protected
merge. At preparation time PR26 was still open with Kiệt's outstanding changes
request despite Hoàng's exact-head approval. Integration fixtures model accepted
merges using temporary repositories and synthetic keys; they are not receipts
for a production merge or human decision.

## Verification

The integration suite creates real Git histories and test-only Ed25519 keys. It
covers the initial PR, subsequent PR, GitHub test merge, main push and manual
contexts, owner metadata, missing/unaccepted/unrelated history, tampered artifacts,
method changes, review pagination, API failures and accountable dated corrections.
It runs in the existing local and hosted research coverage gates with Node 22.16.0.
No production private key or new production signature is used.
