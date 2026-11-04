# Submission metadata — draft only

ArchSync: Evidence-Backed Conformance Checking for TypeScript Service Architectures

Service changes can introduce architectural drift while preserving functional behavior, leaving maintainers without a clear link between a violated design rule and the code responsible. ArchSync combines an explicit architectural contract, provenance-aware extraction of selected TypeScript service interactions, and a Git gate that distinguishes introduced violations from changes requiring an architecture decision. We investigate implementation correctness using co-developed patches and detector signals, followed by finite rule checking and adversarial testing. All 20 development patches match their declared classifications, but targeted adversarial inputs expose extraction and incremental-analysis defects that require repair. Retained failing inputs and repaired outputs make these interventions inspectable. The contribution is a reproducible integration of established conformance concepts with service-level evidence and change-time decisions. The results establish bounded development behavior, not real-world accuracy or superiority over existing tools; independent repository evaluation and an executed external comparison remain necessary.

Keywords: architecture conformance, service-oriented systems, static analysis, architecture drift, reproducibility

Latest owner correction (2026-09-29):

Vo Duc Hieu *, Tran Minh Hoang, Le Van Kiet, and Ha Hoang Bach

1. Vo Duc Hieu — Software Engineering, FPT University, Ho Chi Minh City, 70000, Vietnam — voduchieu42@gmail.com; corresponding author (*); ORCID 0009-0007-5389-5177
2. Tran Minh Hoang — Computer Science and Engineering, VNUK Institute for Research and Executive Education, The University of Danang, Da Nang, Vietnam — andyjobs2023@gmail.com; ORCID 0009-0000-0302-1841
3. Le Van Kiet — Software Engineering, VNUK Institute for Research and Executive Education, The University of Danang, Da Nang, Vietnam — levankiet1212.2004@gmail.com; ORCID 0009-0007-8434-882X
4. Ha Hoang Bach — Information Assurance, FPT University, Ho Chi Minh City, 70000, Vietnam — hahoangbach2005@gmail.com; ORCID 0009-0000-5118-0660
The structured records use the per-author affiliations confirmed by the owner.
Hoàng and Kiệt are at VNUK; their departments are Computer Science and
Engineering and Software Engineering respectively. Hiếu is in Software
Engineering and Bách is in Information Assurance at FPT University. ORCIDs
remain bound to the same authors. This correction supersedes the shared-
affiliation block dated 2026-09-27. Historical research evidence is unchanged.
The owner removed Hoang Nguyen-The and Minh Tam Phan from the active author
list on 2026-09-29 and transferred the corresponding-author designation to
Vo Duc Hieu. This is an owner instruction, not evidence of the removed
individuals' consent or a completed venue authorship declaration.

No author approval, exclusivity, conflict or funding declaration is inferred from this metadata.
