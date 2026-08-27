# Contributing to the ArchSync Research Paper

## Nguồn chính duy nhất

Nhánh `main` của repository GitHub này là nguồn LaTeX chính thức. Overleaf là
bản mirror để đọc, comment và kiểm tra theo milestone; Overleaf không phải một
lịch sử chỉnh sửa thứ hai. Không được tải một bản Overleaf cũ rồi ghi đè lên
GitHub.

Các file có vai trò cố định:

- `main.tex` chứa preamble, metadata tác giả, CCS metadata và thứ tự `\input`;
- `main-anonymous.tex` chỉ là wrapper double-blind;
- `sections/*.tex` chứa nội dung manuscript;
- `references.bib` là bibliography dùng chung;
- `research/` chứa protocol, evidence contract, ledger và decision log.

Không đưa nội dung section trở lại `main.tex`. Dùng `\input`, không dùng
`\include`, vì `\include` có thể thêm page break và làm thay đổi layout.

## Bản đồ file và phạm vi chỉnh sửa

| Nội dung | File chính | Người review nội dung |
| --- | --- | --- |
| Abstract | `sections/abstract.tex` | Reviewer của các claim bị ảnh hưởng |
| Introduction | `sections/introduction.tex` | Hiếu |
| Background / Related Work | `sections/related-work.tex` | Hiếu |
| Problem, RQ và Proposed Approach | `sections/approach.tex` | Hiếu |
| System Architecture | `sections/architecture.tex` | Hiếu + reviewer implementation |
| Implementation / reproducibility | `sections/implementation.tex` | Thành viên 1 |
| Evaluation methodology | `sections/evaluation.tex` | Thành viên 3 |
| Results | `sections/results.tex` | Thành viên 3 + evidence reviewer |
| Discussion | `sections/discussion.tex` | Hiếu |
| Threats to Validity | `sections/threats-to-validity.tex` | Thành viên 3 |
| Conclusion | `sections/conclusion.tex` | Hiếu |
| Named contribution block | `sections/author-information.tex` | Hiếu |

`main.tex`, `references.bib`, `sections/abstract.tex` và mọi file trong
`research/` là file dùng chung có nguy cơ conflict cao. Mỗi thời điểm chỉ một PR
được phép chỉnh trực tiếp cùng một file dùng chung.

## Làm song song không tạo conflict

1. Đồng bộ `main`, sau đó tạo branch `paper/<section>-<muc-tieu>`.
2. Mở **draft pull request ngay khi bắt đầu** và điền mục `Editing reservation`:
   file sẽ sửa, claim/RQ liên quan và thời gian dự kiến bàn giao. Draft PR là cơ
   chế giữ phạm vi; không giữ file bằng chat riêng vì thành viên khác không nhìn
   thấy.
3. Kiểm tra các PR đang mở. Nếu một PR đã giữ cùng file, chia phạm vi sang file
   khác hoặc chờ PR đó merge. Không sửa song song hai đoạn trong cùng một file.
4. Một branch chỉ nên có một mục tiêu nội dung chính. Thay đổi tooling hoặc
   research contract không liên quan phải ở PR khác.
5. Trước khi chuyển PR sang ready, cập nhật từ `origin/main`, chỉ giải quyết
   conflict trong phạm vi đã giữ, rồi chạy toàn bộ gate bên dưới.

Nếu cần thay đổi nhiều section cho cùng một claim, chọn một người làm integration
owner. Các thành viên còn lại review hoặc gửi commit theo từng file; không tạo
nhiều PR cùng sửa `abstract`, `results` và `conclusion` độc lập.

## Gate trước pull request

Chạy structural và research validators:

```bash
node scripts/validate-devcontainer.mjs
node --test scripts/validate-devcontainer.test.mjs
node scripts/validate-paper-structure.mjs
node research/validate-baseline.mjs
node research/validate-decision-log.mjs
node research/validate-slr-calibration-candidates.mjs
node research/validate-rq-traceability.mjs
node research/validate-claim-evidence.mjs
node research/validate-literature-protocol.mjs
node research/validate-search-queries.mjs
node research/validate-screening-criteria.mjs
node research/validate-literature-matrix.mjs
node research/validate-reference-quality-policy.mjs
node research/verify-evaluation-report-scaffold.mjs
node --test research/*.test.mjs
```

Biên dịch cả hai biến thể, không chỉ file đang mở trong editor:

```bash
latexmk -pdf -file-line-error -halt-on-error -interaction=nonstopmode main.tex
latexmk -pdf -file-line-error -halt-on-error -interaction=nonstopmode main-anonymous.tex
node scripts/verify-pdf-variants.mjs
```

`verify-pdf-variants.mjs` cần `pdftotext` từ Poppler. Devcontainer đã cài sẵn.
Nếu máy local chưa có TeX/Poppler, dùng **Reopen in Container** hoặc Codespaces;
container tự chạy đúng các lệnh trên khi được tạo.

Không được đổi image từ dạng `image@sha256:digest` về tag đơn, đổi Action SHA về
tag, bỏ frozen lockfile, hoặc thêm `--skip-post-create` vào CI. Job
`Devcontainer smoke` phải build/start đúng config, chạy `postCreateCommand` và
xuất fresh challenge evidence cùng hai PDF. Evidence này xác minh lifecycle bằng
máy; review bằng giao diện Codespaces của con người vẫn là một hoạt động riêng
nếu reviewer yêu cầu.

## Nội dung pull request và review

PR phải ghi:

- file/section đã giữ và file thực tế đã sửa;
- RQ, claim ID và evidence liên quan;
- thay đổi citation, figure, table, number hoặc interpretation;
- lệnh tái tạo evidence và checksum/manifest khi có;
- ảnh hoặc PDF artifact đã kiểm tra;
- AI assistance đã dùng và nguồn thật mà người phụ trách đã xác minh.

Không push trực tiếp lên `main`. `Build paper` phải xanh, cả `main.pdf` và
`main-anonymous.pdf` phải được tạo, và ít nhất một thành viên không phải tác giả
chính của thay đổi phải review nội dung, citation, figure/table và cách diễn
giải. Hiếu thực hiện merge cuối.

Không resolve comment bằng cách thay đổi claim ngoài phạm vi PR. Nếu review phát
hiện cần đổi RQ, ground truth, metric, acceptance criterion hoặc architecture
contract, thêm entry vào `research/decision-log.md` và yêu cầu đúng owner review.

## Xử lý rebase và conflict

- Không dùng bản PDF hoặc Overleaf để chọn “phiên bản mới hơn”. So sánh commit
  Git và evidence artifact.
- Không chọn toàn bộ `ours` hoặc `theirs` cho section có claim định lượng.
- Giữ nguyên cả hai nguồn citation khi chưa có reviewer quyết định; không xóa
  citation chỉ để hết conflict.
- File sinh từ automation phải được tái tạo bằng lệnh của nó, không sửa tay để
  khớp conflict.
- Sau rebase, chạy lại structural validator, research tests và cả hai PDF build.

## Đồng bộ Overleaf theo milestone

Chỉ designated sync steward thực hiện đồng bộ sau khi một milestone đã merge:

1. ghi exact Git commit SHA được đồng bộ;
2. tạo checkpoint có tên commit trong Overleaf;
3. upload source từ commit đã merge, gồm `sections/`, không lấy source từ một
   working tree chưa commit;
4. compile `main-anonymous.tex` và so sánh với GitHub Actions artifact;
5. ghi commit SHA vào mô tả/checkpoint Overleaf;
6. sau đó chỉ comment trên Overleaf cho tới lần sync tiếp theo.

Nếu ai đó lỡ sửa source trên Overleaf, steward tải diff đó về một Git branch mới
và mở PR bình thường. Không import trực tiếp vào `main` và không ghi đè các file
section đã thay đổi trên GitHub.

GitHub Actions và local clean-worktree bundle theo
`research/LOCAL-VERIFICATION.md` là hai execution provider hợp lệ cho
deterministic gate. Local PASS không thay review, approval hoặc research
evidence được yêu cầu riêng trong Definition of Done.

## Quy tắc research integrity

- Mọi thành viên được phép nhờ AI hỗ trợ lên ý tưởng, viết code, soạn thảo,
  dịch, tóm tắt, chuẩn hóa metadata, đề xuất screening/extraction và kiểm tra
  chất lượng theo `research/AI-EVIDENCE-POLICY.md`.
- Thành viên được phép giao AI thực hiện workflow kỹ thuật bằng browser, CLI và
  phiên database thật đã được cấp quyền, bao gồm tạo artifact, ledger, hash,
  validator, PR và chuẩn bị freeze. Thành viên không phải tự gõ lại các bước cơ
  học nếu bundle có đủ source capture và provenance để kiểm tra.
- AI output chỉ là đề xuất chưa xác minh, không phải evidence. Người được giao
  việc phải đối chiếu từng thông tin evidence với nguồn thật và chịu trách nhiệm
  cho artifact cuối cùng.
- Không dùng AI để bịa DOI/URL, citation, quote, số lượng kết quả, timestamp,
  hash, metric, reviewer decision, approval, signature hoặc tuyên bố đã chạy một
  thao tác không thực sự xảy ra.
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
- Paper mới đề xuất cho Background, Related Work hoặc Discussion phải tuân thủ
  `research/REFERENCE-QUALITY-POLICY.md`: ưu tiên journal Q1, xem Q1/Q2 là nhóm
  xếp hạng cao, ưu tiên công bố trong 2022--2026 và chỉ dùng paper cũ hơn khi có
  lý do nền tảng được ghi bằng evidence thật.
- Rapid Journal Quality Check là extension hỗ trợ kiểm tra ban đầu, không phải
  evidence cuối. Phải ghi nguồn ranking, năm, category và URL chính thức; với
  conference phải ghi quartile không áp dụng và kiểm tra venue/indexing riêng.
- Không dùng tuổi paper hoặc quartile để tự ý loại record khỏi systematic review.

## SLR và double-blind

Không chạy official SLR search hoặc xem result list khi protocol còn ở trạng
thái `Review candidate`. Independent SLR Reviewer làm theo
`research/SLR-REVIEWER-RUNBOOK.md`; AI chỉ được gọi automation ký sau khi reviewer
phê duyệt exact commit, attestation, UTC time và exact signing action. Không đọc,
hiển thị, sao chép hoặc commit private key.

`main.tex` là bản làm việc có tên; `main-anonymous.tex` là wrapper double-blind.
Không để PDF ẩn danh hiển thị tên, email, affiliation, URL nhận diện hoặc
acknowledgement. Repository phải giữ private đến khi chính sách venue cho phép
công khai. Chỉ nộp artifact `main-anonymous.pdf` đã được kiểm tra từ commit merge.
