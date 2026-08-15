# ArchSync Research Baseline

## Trạng thái nghiên cứu hiện tại

Paper hiện báo cáo evidence đã hoàn tất cho Phase 1--3:

- Phase 1: architecture contract, schema, graph và deterministic conformance.
- Phase 2: TypeScript/Node.js source analyzer, finding evidence và controlled
  detector corpus.
- Phase 3: Git-diff gate, incremental/full-scan equivalence và PASS/BLOCK/REVIEW.

Code--IaC--Runtime--AI là tầm nhìn nghiên cứu dài hạn. Phase 4--6 chưa có kết quả
thực nghiệm và chỉ được mô tả là planned work hoặc future work cho đến khi có
evidence gate riêng.

## Mục tiêu và câu hỏi nghiên cứu đang được báo cáo

- RQ1: độ chính xác khi tái dựng component và relationship từ TypeScript source.
- RQ2: độ chính xác khi phân biệt no-impact, violation và evolution.
- RQ3: độ chính xác của evidence localization theo file và line.
- RQ4: determinism, reproducibility, incremental/full-scan equivalence, phạm vi
  parse và latency quan sát được của Git-diff gate.

Mỗi RQ phải có unit of analysis, dataset, metric, denominator, acceptance rule và
evidence artifact. Thay đổi RQ phải cập nhật `claim-evidence.csv`, protocol và
decision log trong cùng pull request.

## Đối tượng thực nghiệm

- D1 Order Platform: 20 patch, gồm 9 no-impact, 7 violation và 4 evolution. D1 là
  development benchmark và regression oracle, không phải blinded holdout.
- D2 TypeScript detector challenge: 20 positive và 20 hard-negative signals. D2
  được tạo để kiểm tra failure modes của v0.1 nên không phải ước lượng tổng quát.
- D3 independent holdout: chưa được xây dựng. Repository, commit, license,
  sampling, annotation rubric và ground truth phải freeze trước inference.

## Thuật ngữ chuẩn

- Architecture Model: tài liệu machine-readable mô tả intent được phê duyệt.
- Expected Graph: graph sinh từ Architecture Model.
- Observed Graph: graph tái dựng từ evidence triển khai.
- Architecture drift: sai khác giữa intent được phê duyệt và implementation.
- Violation: finding phá một hard rule và ánh xạ sang BLOCK.
- Evolution: thay đổi topology không vi phạm hard rule nhưng cần REVIEW.
- No-impact: thay đổi không tạo finding kiến trúc mới và ánh xạ sang PASS.
- Finding: kết quả có identity, severity, rule/model location và source evidence.
- Evidence: artifact có nguồn, vị trí hoặc hash để người khác kiểm tra lại.
- Reproducible result: kết quả có input, environment, version, command, raw output,
  normalized output và verifier đủ để chạy lại độc lập.

## Evidence gate

Một claim chỉ được chuyển sang `verified` khi có đủ:

1. protocol và ground truth đã version/freeze;
2. source commit hoặc package artifact đã pin;
3. input/data manifest và checksum;
4. raw output và normalized result;
5. script tái tạo cùng verifier;
6. environment/toolchain được ghi lại;
7. một reviewer độc lập đối chiếu claim với evidence;
8. CI hoặc clean-environment rerun thành công.

Không dùng output sinh ngẫu nhiên, số tự nhập hoặc kết quả mock làm research
evidence. Output CLI cục bộ chỉ là evidence khi được đưa vào evidence bundle với
provenance và verifier.

## Quy trình từ protocol đến paper

1. Chốt RQ, hypothesis, metric, denominator và acceptance rule.
2. Chốt sampling, inclusion/exclusion, annotation và adjudication.
3. Freeze data/ground truth trước inference.
4. Pin code, dependency, environment và provider/model nếu có.
5. Chạy experiment; giữ raw output và failure, không chỉ giữ run tốt nhất.
6. Verify hash, normalization, derived metric và rerun determinism.
7. Cập nhật `claim-evidence.csv` rồi mới cập nhật paper.
8. Reviewer không phải người tạo kết quả đối chiếu bảng và artifact.
9. Freeze release bundle và chạy independent reproduction trước submission.

## Ethics, security và data governance

- Chỉ dùng repository/dataset có license phù hợp và lưu license snapshot.
- Không đưa secret, token, PII hoặc private source ra provider hay public artifact.
- Phase 4 phải có redaction tests, cost cap, retention review, provider failure
  policy và incident stop switch trước khi gọi real provider.
- Prompt injection hoặc model output không được thay đổi deterministic decision,
  ground truth hay Architecture Model đã phê duyệt.
- High-risk architecture evolution luôn cần human approval và audit trail.

## Vai trò

- Hiếu: research lead, RQ/protocol, scope, claim approval và final merge.
- Thành viên 1: CLI, release, reproducibility environment, security và MCP sau P4.
- Thành viên 2: AI contracts, safety, provider evaluation và human review.
- Thành viên 3: holdout, IaC/runtime experiment, statistics và reproduction.

Chi tiết task, dependency, Definition of Done và trạng thái được quản lý trong
Google Sheet của nhóm. File này định nghĩa research policy; không thay thế task
tracker.
