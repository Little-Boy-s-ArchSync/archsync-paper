# Narrative review amendment evidence

This branch changes manuscript positioning to a purposive narrative review by design. Fifteen recent references augment ten existing references: 25 unique citations, including four pre-2022 concept-origin works. Sources were selected from the retained keyword-search corpus; backward/forward snowballing is not claimed because it was not documented for this pass.

`selection.json` binds the 15 additions to retained record IDs, source hashes and selection rationale. Seven BibTeX records were retrieved from Crossref; eight requests were rate-limited and use retained bibliographic metadata instead. Optional unverified fields are omitted for those records. `metadata-retrieval.json` records each outcome. The review uses bounded descriptions from retained abstracts and prior source-backed citation checks; it does not assert a new full-text quality appraisal.

Claim-evidence audit: research/claim-evidence.csv has no novelty or positioning claim depending on a completed or pending SLR; its empirical and planned claims are unchanged. Abstract, RQs and Conclusion were checked and require no SLR-framing edits. The Introduction now qualifies the motivating gap to teams without executable architecture checks, avoiding a field-wide absence claim. Existing mentions of systematic reviews describe the cited publications, not the method of this paper. Research governance remains outside the manuscript and is not asserted as evidence of review completeness.

The decision-log amendment is proposed on this branch, not falsely marked as an accepted change to main. Empirical RQs, metrics, datasets, definitions and results are unchanged.

Follow-up Crossref REST captures resolved all eight initial rate limits (verified-metadata/). Relevant bibliographic fields are populated; the taxonomy uses its 2024 first-online date without mixing in 2025 issue locators.
