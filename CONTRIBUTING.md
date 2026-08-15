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

## Double-blind

Giữ `anonymous` trong `acmart`; không thêm tên, email, affiliation, URL nhận diện,
acknowledgement hoặc metadata có thể lộ nhóm. Repository phải giữ private cho đến
khi chính sách của venue cho phép công khai.
