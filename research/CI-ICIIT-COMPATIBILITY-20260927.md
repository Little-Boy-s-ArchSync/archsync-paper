# ICIIT template and hosted TeX compatibility

Observed failure: PR #50 head `36cd4267df0b1bc319b8f5b11bc0a938ec4e503b`,
[Build paper run 36303692274](https://github.com/Little-Boy-s-ArchSync/archsync-paper/actions/runs/36303692274),
job 108586332096. Both IEEE documents compiled, then the first venue profile
failed with `hyperref must be loaded before hyperxmp` under TeX Live 2024.
The venue-supplied acmart 1.90a loads hyperxmp before hyperref.

The first attempted repair used a separate TeX Live 2023 venue build. Actual
[run 36307594517](https://github.com/Little-Boy-s-ArchSync/archsync-paper/actions/runs/36307594517)
failed with the same hyperxmp load-order error. That attempt is not a success.

The revised candidate keeps TeX Live 2024 and applies a venue-only latexmk
configuration, scripts/iciit-latexmkrc. It prepends the LaTeX package/before
hook so hyperref loads before hyperxmp, with the exact bookmarksnumbered and
unicode options requested by the supplied class. The hook executes during
class loading after the underlying amsart class, not before documentclass.
The IEEE builds do not use it. It does not edit the official class/BST, remove
a profile, suppress a compiler error, or relax PDF/evidence/redaction checks.
The action remains pinned to the same full commit. Existing retained PDFs
were built with Tectonic and are not silently replaced by hosted PDFs.

This is a compatibility repair candidate. Its hosted run must actually pass;
the successful local Tectonic build is not evidence that this hosted image
works. Required exact-head approval remains separate. The failure above stays
in the GitHub run history and does not become a successful observation.
