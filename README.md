# ArchSync Research Paper

Nguồn LaTeX của bài nghiên cứu **ArchSync: Evidence-Backed Detection of Architecture Drift in TypeScript Systems**.

Repository này phải được giữ ở chế độ **private** trong thời gian bài báo được
phản biện ẩn danh. `main.tex` là bản làm việc có tên để nhóm kiểm tra metadata
trên Overleaf. `main-anonymous.tex` là wrapper double-blind được CI biên dịch;
nó truyền tùy chọn `anonymous` cho `acmart` và tạo PDF không hiển thị tên, đơn vị
hoặc email.

## Cấu trúc

```text
.
├── main.tex                    # Bản làm việc có metadata tác giả
├── main-anonymous.tex          # Wrapper tạo PDF double-blind
├── references.bib              # Tài liệu tham khảo
├── acmart.cls                  # ACM document class từ Overleaf
├── ACM-Reference-Format.bst    # ACM bibliography style
├── research/
│   ├── RESEARCH.md             # Research baseline, scope và evidence policy
│   ├── GLOSSARY.md             # Thuật ngữ chuẩn có version
│   ├── RQ-TRACEABILITY.md       # Giải thích mapping RQ paper và roadmap
│   ├── rq-traceability.csv      # Ma trận RQ máy đọc được
│   ├── literature-protocol.md   # Protocol SLR phải review/freeze trước search
│   ├── literature-search-queries.md # Search strings SLR-102 có version
│   ├── literature-search-log.template.csv # 24 run dự kiến, chưa phải evidence
│   ├── literature-screening-criteria.md # Codebook I/E của SLR-103
│   ├── literature-screening-criteria.csv # Mapping I/E và precedence máy đọc được
│   ├── literature-screening.template.csv # Schema quyết định, chưa phải evidence
│   ├── literature-matrix.md      # Contract SLR-104 và quy tắc audit DOI/URL
│   ├── literature-matrix.csv     # Ma trận có schema, hiện 0 paper theo protocol
│   ├── SLR-REVIEWER-RUNBOOK.md # Các bước evidence và ký cho Independent SLR Reviewer
│   ├── slr-sentinel-evidence.template.json # Schema ghi nhận calibration, không phải evidence
│   ├── claim-evidence.csv      # Claim-to-evidence ledger
│   ├── decision-log.md         # Quyết định và change control
│   └── risk-register.csv       # Rủi ro nghiên cứu
└── .github/workflows/
    └── build-paper.yml         # Biên dịch và kiểm tra trên GitHub Actions
```

Hai sơ đồ hệ thống và quy trình evaluation được viết trực tiếp bằng TikZ trong `main.tex`, vì vậy không cần chỉnh sửa một file ảnh độc lập. Paper báo cáo hai dataset: benchmark end-to-end gồm 20 patch độc lập và corpus detector gồm 20 tín hiệu dương cùng 20 hard negative. Phase 3 tái sử dụng 20 patch dưới dạng Git diff để đo pull-request decision, architecture-delta agreement, incremental/full-scan equivalence, cache, scan scope và latency; đây là một protocol bổ sung, không phải dataset độc lập thứ ba.

Research scope, thuật ngữ, evidence gate và phân công được khóa tại
`research/RESEARCH.md`; định nghĩa chuẩn nằm tại `research/GLOSSARY.md`. Mỗi
claim định lượng phải có hàng tương ứng trong
`research/claim-evidence.csv`; thay đổi RQ, ground truth, metric hoặc scope phải
được ghi trong `research/decision-log.md`. Xem `CONTRIBUTING.md` trước khi sửa
paper.

Kiểm tra baseline và glossary bằng:

```bash
node research/validate-baseline.mjs
node research/validate-rq-traceability.mjs
node --test research/validate-claim-evidence.test.mjs
node research/validate-claim-evidence.mjs
node research/validate-literature-protocol.mjs
node research/validate-search-queries.mjs
node research/validate-screening-criteria.mjs
node research/validate-literature-matrix.mjs
```

Sau khi người giữ vai trò Independent SLR Reviewer đã ghi đủ sáu artifact calibration thật, tạo và xác minh ledger
bằng `node research/build-slr-sentinel-ledger.mjs --write` rồi chạy lại với
`--check`. Công cụ này chỉ tính ledger/hash từ artifact đã có, không sinh kết
quả nghiên cứu. Quy trình thao tác, ký attestation và bàn giao lại cho owner nằm
tại `research/SLR-REVIEWER-RUNBOOK.md`.

## Biên dịch cục bộ

Cài TeX Live hoặc MiKTeX có `latexmk`. Biên dịch bản làm việc có tên bằng:

```bash
latexmk -pdf -file-line-error -halt-on-error -interaction=nonstopmode main.tex
```

Biên dịch bản gửi phản biện ẩn danh bằng:

```bash
latexmk -pdf -file-line-error -halt-on-error -interaction=nonstopmode main-anonymous.tex
```

Hai lệnh tạo lần lượt `main.pdf` và `main-anonymous.pdf`. Các file này không
được commit; GitHub Actions sẽ tạo PDF ẩn danh làm artifact cho mỗi lần push và
pull request.

Xóa các file build:

```bash
latexmk -C
```

## Quy trình cập nhật

1. Chỉnh nội dung trên một nhánh riêng.
2. Biên dịch và kiểm tra hình, bảng, citation và số trang.
3. Mở pull request để thành viên khác review.
4. Chỉ merge khi workflow `Build paper` thành công.
5. Nếu chỉnh trên Overleaf, tải source `.zip`, đối chiếu thay đổi rồi cập nhật `main.tex` và `references.bib`; không chép các file mẫu không dùng tới.

## Trước khi nộp bài

- Nộp PDF được tạo từ `main-anonymous.tex`, không nộp PDF có tên từ `main.tex`.
- Kiểm tra PDF phản biện hiển thị `Anonymous Author(s)` và không chứa email hoặc
  affiliation.
- Kiểm tra không có thông tin nhận diện trong nội dung, metadata, README hoặc lịch sử commit.
- Tải PDF artifact từ tab **Actions** và kiểm tra trực quan lần cuối.
- Chỉ công khai repository sau khi chính sách của venue cho phép.

## Nguồn đồng bộ

Source ban đầu được xuất từ dự án Overleaf `ArchSync Research Draft`. Bản GitHub được chuẩn hóa với `main.tex` và `references.bib`; sau mỗi thay đổi đã kiểm chứng, hai file này phải được đồng bộ trở lại Overleaf và compile không lỗi.
