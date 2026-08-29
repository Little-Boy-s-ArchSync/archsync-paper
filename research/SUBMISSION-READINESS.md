# PAPER-103 / ART-101 submission-readiness boundary

Status: **proposal only — NOT_READY — no submission or release authority**.

## Observed repository state

The GitHub repository API reported all seven ArchSync repositories as public at
`2026-08-29T19:21:39Z`. `archsync-paper` has a retained GitHub `PublicEvent` at
`2026-08-13T14:36:43Z`, and its public `main` history contains the named paper
source. Issue
[`archsync#45`](https://github.com/Little-Boy-s-ArchSync/archsync/issues/45)
retains the blocker and the SHA-256 of the exact API snapshot.

This conflicts with the existing private-until-venue-authorized policy. Zero
forks, stars, or subscribers does not prove that no clone, cache, index, or
access occurred. Making the repository private later cannot retract prior
public access. Anonymous PDF redaction therefore does not by itself establish
repository anonymity or submission readiness.

`main` is now protected in every ArchSync repository. That operational control
does not choose a venue, authorize public artifacts, prove anonymity, replace a
content review, or retroactively become Phase 1--3 research evidence.

## Current machine contract

[`submission-readiness.template.json`](submission-readiness.template.json) is
the only document accepted by the current validator. It records the public
state, contains no candidate hash, evidence, or approval, and declares every
blocker explicitly. Run:

```text
node research/validate-submission-readiness.mjs
```

A successful command means only that the committed proposal remains exactly
`NOT_READY`. The current `0.1.0-proposal` evaluator has no `READY` branch. It
always returns these permanent blockers:

- `AUTHORITATIVE_HUMAN_VERIFICATION_SOURCE_NOT_IMPLEMENTED`; and
- `REVIEWED_READINESS_CONTRACT_REVISION_REQUIRED`.

Even a syntactically complete JSON document carrying human-looking names,
approval URLs, hashes, and `source_verified: true` remains `NOT_READY`. Current
code can validate shapes and digest agreement, but it cannot authenticate the
source, prove that the named person acted, establish their authority, or adopt
their decision. Operator authorship, Git metadata, CI, CODEOWNERS, issue text,
and model output are not approval.

## Evidence a later reviewed revision must require

There is intentionally no upgrade command. Before a future contract revision
can introduce a readiness decision, humans with the relevant authority must
retain evidence bound to the same full source commit, anonymous PDF SHA-256,
submission-package SHA-256, and artifact-manifest SHA-256 for all of the
following:

1. the exact venue and its official anonymity/public-artifact policy;
2. the repository visibility decision and verification of resulting access and
   branch-protection controls;
3. acknowledgement and assessment of the prior public exposure;
4. inspection of the exact anonymous PDF, not merely a successful build;
5. verification that author names, e-mails, affiliations, ORCIDs,
   acknowledgements, identifying URLs, PDF metadata, and bundled files are
   redacted as the venue requires;
6. the artifact inventory, provenance, license, and permission decision; and
7. explicit public-release authorization for the exact artifact candidate.

The future implementation must verify each authorization from an authoritative
human-controlled source, bind it to exact candidate bytes, detect stale or
post-change decisions, preserve prior exposure, and undergo its own reviewed
contract revision. Filling the current template, removing blocker strings, or
changing `status` is invalid and cannot complete PAPER-103 or ART-101.

## Operational rule

Until that later revision is reviewed and the real evidence exists, do not
create or describe any artifact as an official anonymous submission, do not
claim repository anonymity, and do not publish or release the paper artifact.
The named and anonymous PDFs may continue to be built for technical validation;
those builds do not change task status.
