# Submission metadata — draft only

ArchSync: Evidence-Backed Conformance Checking for TypeScript Service Architectures

Service changes can introduce architectural drift while preserving functional behavior. ArchSync provides deterministic conformance checking for TypeScript service architectures through three integrated capabilities: a typed architectural contract, provenance-aware extraction of HTTP, PostgreSQL, Redis and AMQP relationships, and an evidence-backed Git gate that maps introduced findings to PASS, BLOCK or REVIEW. Evaluation covers 20 architecture patches and 40 annotated detector signals, with all 20 patch classifications matching their development labels and incremental execution matching full scans in all 20 replay cases. A separate reliability campaign checks 786,432 finite rule–graph combinations against a matrix oracle; the hardened implementation passes 126 Core and 315 Guardian regression tests. The resulting workflow connects pull-request decisions to explicit rules and inspectable evidence, supporting reproducible architecture checks. Results are limited to controlled, co-developed datasets and developer-authored reliability checks; broader validation is future work.

Keywords: architecture conformance, service-oriented systems, static analysis, architecture drift, reproducibility

1. Vo Duc Hieu — FPT University, Ho Chi Minh City, Vietnam; voduchieu42@gmail.com (corresponding author); ORCID 0009-0007-5389-5177
2. Ha Hoang Bach — FPT University, Ho Chi Minh City, Vietnam; hahoangbach2005@gmail.com; ORCID 0009-0000-5118-0660
3. Hoang Nguyen The — FPT University, Ho Chi Minh City, Vietnam; hoangnt20@fe.edu.vn; ORCID not supplied in existing manuscript
4. Minh Tam Phan — FPT University, Ho Chi Minh City, Vietnam; tampm@fe.edu.vn; ORCID not supplied in existing manuscript
5. Tran Minh Hoang — VNUK Institute for Research and Executive Education, The University of Danang, Da Nang, Vietnam; andyjobs2023@gmail.com; ORCID 0009-0000-0302-1841
6. Le Van Kiet — VNUK Institute for Research and Executive Education, The University of Danang, Da Nang, Vietnam; levankiet1212.2004@gmail.com; ORCID 0009-0007-8434-882X

No author approval, exclusivity, conflict or funding declaration is inferred from this metadata.
