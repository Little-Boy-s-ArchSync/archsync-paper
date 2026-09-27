# Submission metadata — draft only

ArchSync: Evidence-Backed Conformance Checking for TypeScript Service Architectures

Service changes can introduce architectural drift while preserving functional behavior, leaving maintainers without a clear link between a violated design rule and the code responsible. ArchSync combines an explicit architectural contract, provenance-aware extraction of selected TypeScript service interactions, and a Git gate that distinguishes introduced violations from changes requiring an architecture decision. We investigate implementation correctness using co-developed patches and detector signals, followed by finite rule checking and adversarial testing. All 20 development patches match their declared classifications, but targeted adversarial inputs expose extraction and incremental-analysis defects that require repair. Retained failing inputs and repaired outputs make these interventions inspectable. The contribution is a reproducible integration of established conformance concepts with service-level evidence and change-time decisions. The results establish bounded development behavior, not real-world accuracy or superiority over existing tools; independent repository evaluation and an executed external comparison remain necessary.

Keywords: architecture conformance, service-oriented systems, static analysis, architecture drift, reproducibility

Latest owner-supplied ICIIT block (2026-09-27):

Vo Duc Hieu, Tran Minh Hoang, Le Van Kiet, Ha Hoang Bach,
Hoang Nguyen-The, and Minh Tam Phan *

Faculty of Software Engineering, FPT University HCMC,
Ho Chi Minh City, 70000, Vietnam

1. Vo Duc Hieu - voduchieu42@gmail.com; ORCID 0009-0007-5389-5177
2. Tran Minh Hoang - andyjobs2023@gmail.com; ORCID 0009-0000-0302-1841
3. Le Van Kiet - levankiet1212.2004@gmail.com; ORCID 0009-0007-8434-882X
4. Ha Hoang Bach - hahoangbach2005@gmail.com; ORCID 0009-0000-5118-0660
5. Hoang Nguyen-The - hoangnt20@fe.edu.vn; ORCID not supplied
6. Minh Tam Phan - tampm@fe.edu.vn; corresponding author (*); ORCID not supplied

All six structured records use the shared affiliation explicitly supplied by the
owner. ORCIDs remain in source/metadata and are not added to the pictured block.
This latest instruction supersedes the earlier ICIIT order, affiliation,
faculty-name spelling and corresponding-author designation. Historical IEEE
working manuscripts and frozen research evidence are not rewritten by this
venue-only presentation change.

No author approval, exclusivity, conflict or funding declaration is inferred from this metadata.
