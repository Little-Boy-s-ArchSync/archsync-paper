# Contributing to the ArchSync Research Paper

Repository này là nguồn chỉnh sửa chính cho paper. Overleaf chỉ được dùng để
đọc, nhận xét hoặc đồng bộ theo mốc; không được tạo một lịch sử chỉnh sửa song
song rồi ghi đè lại GitHub.

## Quy trình bắt buộc

1. Đồng bộ `main` và tạo branch có dạng `paper/<section>-<muc-tieu>`.
2. Chỉ một người chỉnh trực tiếp cùng một vùng trong `main.tex` tại một thời
   điểm. Nếu cần làm song song, thống nhất phạm vi dòng hoặc section trước.
3. Biên dịch bằng `latexmk` nếu máy có TeX. Khi không có TeX cục bộ, push branch
   và dùng artifact của workflow `Build paper` làm bằng chứng compile.
4. Mở pull request, khai báo section đã sửa, claim bị ảnh hưởng và evidence liên
   quan. Không push trực tiếp lên `main`.
5. Một thành viên không phải tác giả chính của thay đổi phải review nội dung,
   biểu đồ, citation và cách diễn giải kết quả. Hiếu thực hiện merge cuối.
6. Sau merge, nếu cần đồng bộ Overleaf thì tải source/PDF từ commit đã merge;
   không import file phụ hoặc bản cũ ngược vào repository.

## Quy tắc research integrity

- Mọi thành viên được phép nhờ AI hỗ trợ lên ý tưởng, viết code, soạn thảo,
  dịch, tóm tắt, chuẩn hóa metadata, đề xuất screening/extraction và kiểm tra
  chất lượng theo `research/AI-EVIDENCE-POLICY.md`.
- AI output chỉ là đề xuất chưa xác minh, không phải evidence. Người được giao
  việc phải đối chiếu từng thông tin evidence với nguồn thật và chịu trách
  nhiệm cho artifact cuối cùng.
- Không dùng AI để bịa DOI/URL, citation, quote, số lượng kết quả, timestamp,
  hash, metric, reviewer decision, approval, signature hoặc tuyên bố đã chạy
  một thao tác không thực sự xảy ra.
- Không thêm số liệu vào Abstract, Results, Discussion hoặc Conclusion nếu chưa
  có hàng tương ứng trong `research/claim-evidence.csv`.
- Mọi số liệu phải truy được đến raw/normalized artifact, commit hoặc package
  version, lệnh tái tạo và verifier. Kết quả mock không được dùng làm evidence.
- D1 và D2 là development/regression datasets, không được mô tả như holdout.
- Ground truth của holdout phải freeze trước khi chạy analyzer và không được sửa
  sau khi xem prediction. Bất đồng reviewer phải được lưu trước adjudication.
- Timing chỉ được báo cáo kèm môi trường và raw samples; không dùng timing của
  shared CI runner làm ngưỡng hiệu năng.
- Phase 4--6 là planned work cho đến khi evidence gate tương ứng hoàn tất. Không
  viết kết quả dự kiến như kết quả đã quan sát.

## Phân công review

- Hiếu: Introduction, Related Work, Research Questions, Discussion, paper scope.
- Thành viên 1: Implementation, reproducibility, release và artifact workflow.
- Thành viên 2: AI approach, AI safety, citation validation và human-review handoff.
- Thành viên 3: Evaluation, statistics, results tables và threats to validity.

Mỗi section phải có ít nhất một reviewer ngoài người viết chính. Thay đổi RQ,
ground truth, metric, acceptance criterion hoặc architecture contract cần được
ghi vào `research/decision-log.md` trước khi merge.

Đối với systematic literature review, không chạy tìm kiếm chính thức hoặc xem
danh sách kết quả khi protocol còn ở trạng thái `Review candidate`. Một thành
viên không phải tác giả phải review protocol, kiểm tra sentinel recall và chấp
thuận freeze version 1.0.0 trước khi search được chuyển sang `Authorized`. Mọi
thay đổi tiêu chí sau khi đã xem kết quả phải đi qua amendment có version và
không được ghi đè âm thầm lên protocol đã freeze. Người được phân công vai trò
Independent SLR Reviewer thực hiện phần review theo
`research/SLR-REVIEWER-RUNBOOK.md`; private key và thao tác ký không được chuyển
giao cho tác giả protocol.

Search strings của SLR-102 được version trong
`research/literature-search-queries.md`. Khi SLR-101 chưa freeze, file
`literature-search-log.template.csv` phải giữ trống query đã chạy, timestamp,
result count, export, hash và operator; không dùng `0` hoặc dữ liệu mock để làm
placeholder. Sau freeze, mỗi database-query pair phải ghi đúng expanded query,
filter, UTC timestamp, result count và immutable export hash trước khi mở danh
sách kết quả để screening.

Tiêu chí screening SLR-103 được version trong
`research/literature-screening-criteria.md` và
`literature-screening-criteria.csv`. Không thêm quyết định vào
`literature-screening.template.csv`; đây chỉ là schema. Khi SLR-101 chưa
freeze, không được dùng result thật hoặc dữ liệu mock để tuyên bố calibration.
Mọi exclusion sau khi được authorize phải có đúng một primary E-code, factual
note và evidence location; hai reviewer phải ghi quyết định độc lập trước khi
adjudication. AI có thể đề xuất quyết định hoặc E-code, nhưng mỗi reviewer phải
tự kiểm tra record/full text, tự lưu quyết định cuối cùng và khai báo phần hỗ
trợ AI có ảnh hưởng đáng kể.

`research/RESEARCH.md` và `research/GLOSSARY.md` là hai artifact versioned đã
freeze. Thay đổi target user, problem, scope hoặc nghĩa thuật ngữ phải tăng
version theo change rule trong baseline và thêm một decision được chấp nhận ở
cùng pull request. Trước khi mở PR, chạy:

```bash
node research/validate-baseline.mjs
node research/validate-rq-traceability.mjs
node research/validate-literature-protocol.mjs
node research/validate-search-queries.mjs
node research/validate-screening-criteria.mjs
```

## Double-blind

`main.tex` là bản làm việc có tên; `main-anonymous.tex` là wrapper double-blind.
Không để PDF tạo từ wrapper hiển thị tên, email, affiliation, URL nhận diện hoặc
acknowledgement có thể lộ nhóm. Metadata tác giả chỉ được lưu trong source
private. Repository phải giữ private cho đến khi chính sách của venue cho phép
công khai.
