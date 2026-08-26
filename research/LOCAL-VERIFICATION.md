# Local Verification Policy

## Decision

A clean local verification bundle and a remote CI run are accepted execution
providers for deterministic checks. This policy prevents hosted-runner quota
from changing task truth while preserving the evidence requirements of the
research.

Run the paper gate from the repository root:

```powershell
node scripts/local-verify.mjs
```

The gate validates author/anonymous source settings, the research baseline, RQ
traceability, claim evidence, SLR contracts, reference-quality rules, test
coverage, both LaTeX builds, PDF redaction and generated-source cleanliness.

The default bundle is ignored under `artifacts/local-verification/`. After the
target commit has been reviewed, an owner can write a tracked milestone bundle:

```powershell
node scripts/local-verify.mjs --publish
```

Tracked bundles live at
`research/evidence/local-verification/<commit>/` and must not be edited after
creation.

## Acceptance

A task may cite local verification instead of GitHub Actions when:

- every deterministic gate relevant to the task passed;
- the bundle points to the exact clean commit and UTC interval;
- environment, command, exit code, raw log and SHA-256 provenance are retained;
- the generated PDFs and anonymous redaction check passed when paper source was
  affected; and
- every non-computational task condition is independently satisfied.

Local verification never substitutes for independent review, an accepted ADR,
a signature, database/search output, protocol freeze, human annotation, real
provider execution, Codespaces behavior, branch protection or publication of a
release. Those requirements remain factual conditions of the task.
