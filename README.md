# ArchSync Research Paper

Nguồn LaTeX của bài nghiên cứu **ArchSync: Evidence-Backed Detection of
Architecture Drift in TypeScript Systems**.

Repository này phải được giữ **private** trong thời gian phản biện ẩn danh. Nhánh
`main` trên GitHub là source of truth. Overleaf chỉ là mirror để đọc, comment và
kiểm tra theo milestone; quy trình đồng bộ nằm trong `CONTRIBUTING.md`.

## Hai biến thể paper

- `main.tex` là root có metadata tác giả để nhóm kiểm tra nội bộ.
- `main-anonymous.tex` là wrapper double-blind được dùng cho submission và luôn
  input cùng manuscript.

CI biên dịch cả hai file. Artifact `main-anonymous.pdf` phải không chứa tên,
email, affiliation hoặc contribution block; `main.pdf` phải giữ đủ metadata để
kiểm tra ownership.

## Cấu trúc repository

```text
.
├── main.tex                     # Preamble, author/CCS metadata, ordered inputs
├── main-anonymous.tex           # Minimal anonymous wrapper
├── references.bib               # Tài liệu tham khảo
├── acmart.cls                   # ACM document class từ Overleaf
├── ACM-Reference-Format.bst     # ACM bibliography style
├── sections/
│   ├── abstract.tex
│   ├── introduction.tex
│   ├── related-work.tex
│   ├── approach.tex             # Problem, RQ và Proposed Approach
│   ├── architecture.tex         # System diagram (TikZ)
│   ├── implementation.tex
│   ├── evaluation.tex           # Evaluation diagram (TikZ)
│   ├── results.tex
│   ├── discussion.tex
│   ├── threats-to-validity.tex
│   ├── conclusion.tex
│   └── author-information.tex   # Bị ẩn trong anonymous mode
├── research/
│   ├── RESEARCH.md              # Research baseline, scope và evidence policy
│   ├── GLOSSARY.md              # Thuật ngữ chuẩn có version
│   ├── AI-EVIDENCE-POLICY.md    # Ranh giới AI và evidence thật
│   ├── REFERENCE-QUALITY-POLICY.md
│   ├── REFERENCE-QUALITY-AUDIT.md
│   ├── RESEARCH-QUALITY-GATES.md
│   ├── EXTERNAL-BASELINE-PROTOCOL.md
│   ├── PROJECT-EVIDENCE-AUDIT.md
│   ├── RQ-TRACEABILITY.md
│   ├── rq-traceability.csv
│   ├── literature-protocol.md
│   ├── literature-search-queries.md
│   ├── literature-screening-criteria.md
│   ├── literature-screening-criteria.csv
│   ├── literature-matrix.md
│   ├── literature-matrix.csv
│   ├── SLR-REVIEWER-RUNBOOK.md
│   ├── claim-evidence.csv
│   ├── statistical-analysis-plan.md # STAT-101 draft; chưa freeze hoặc có result
│   ├── statistical-analysis.mjs
│   ├── holdout-report.template.md    # EVAL-111 scaffold; không có result
│   ├── paper-results-manifest.schema.json
│   ├── paper-results-manifest.template.json # ANALYSIS-101 handoff; không phải evidence
│   ├── decision-log.md
│   └── risk-register.csv
├── scripts/
│   ├── validate-paper-structure.mjs
│   └── verify-pdf-variants.mjs
├── .vscode/                     # LaTeX Workshop và spell-check settings
├── .devcontainer/               # TeX Live 2024 + Node 22 + Poppler
└── .github/workflows/build-paper.yml
```

`main.tex` dùng `\input`, không dùng `\include`, nên việc chia file không tạo
page break. Mỗi file trong `sections/` có magic root comment trỏ về `main.tex` để
LaTeX Workshop build đúng document khi đang sửa một section.

## Bắt đầu nhanh trong VS Code hoặc Codespaces

### Devcontainer / Codespaces

1. Mở repository trong Codespaces, hoặc chọn **Dev Containers: Reopen in
   Container** trong VS Code.
2. Container dùng TeX Live 2024, Node.js 22.16.0, `latexmk` và Poppler. Cả image
   TeX Live và image cung cấp Node đều được khóa trực tiếp bằng manifest
   SHA-256; version dễ đọc được ghi cạnh mỗi `FROM`; không có Dev Container
   Feature dùng mutable tag.
3. Lần tạo đầu tiên tự kiểm tra cấu trúc, build cả hai PDF và xác minh redaction.
4. Mở `main.pdf` hoặc `main-anonymous.pdf` trong tab VS Code để preview từ
   browser.

GitHub Actions còn chạy một smoke test độc lập bằng Dev Container CLI 0.88.0 đã
khóa trong `package-lock.json`. Job này tạo challenge ngẫu nhiên mới, thực sự
build và start `.devcontainer/devcontainer.json`, để CLI chạy
`postCreateCommand`, rồi kiểm tra evidence và hai PDF ngay bên trong container.
Artifact `archsync-devcontainer-smoke-<commit>` chứa hai PDF do container build
và `.devcontainer/smoke-evidence.json` với SHA-256, tool version và challenge
nonce. Đây là machine evidence của container lifecycle; không phải tuyên bố rằng
một người đã mở giao diện Codespaces.

### VS Code local

VS Code đề xuất LaTeX Workshop, Code Spell Checker và Markdownlint. Cài TeX Live
hoặc MiKTeX có `latexmk`, mở một file `sections/*.tex`, sau đó dùng recipe
**latexmk (project root)**. Magic comment sẽ chọn `main.tex` làm root.

## Biên dịch bằng terminal

```bash
node scripts/validate-devcontainer.mjs
node --test scripts/validate-devcontainer.test.mjs
node scripts/validate-paper-structure.mjs
latexmk -pdf -file-line-error -halt-on-error -interaction=nonstopmode main.tex
latexmk -pdf -file-line-error -halt-on-error -interaction=nonstopmode main-anonymous.tex
node scripts/verify-pdf-variants.mjs
```

Lệnh cuối cần `pdftotext` từ Poppler. Nó xác nhận hai PDF đều có title, abstract,
mọi section và References; đồng thời xác nhận PDF named có metadata và PDF
anonymous không lộ identity. Xóa build products bằng:

```bash
latexmk -C
```

## Research contracts

Research scope và thuật ngữ chuẩn nằm tại `research/RESEARCH.md` và
`research/GLOSSARY.md`. Mỗi claim định lượng phải có hàng tương ứng trong
`research/claim-evidence.csv`; thay đổi RQ, ground truth, metric, acceptance
criterion hoặc scope phải được ghi trong `research/decision-log.md`.

Các artifact SLR chính gồm:

- `research/literature-protocol.md` — protocol phải review/freeze trước search;
- `research/literature-search-queries.md` — query spec có version;
- `research/literature-screening-criteria.md` và `.csv` — codebook I/E;
- `research/literature-matrix.md` và `.csv` — extraction contract;
- `research/SLR-REVIEWER-RUNBOOK.md` — independent-review workflow;
- `research/AI-EVIDENCE-POLICY.md` — ranh giới AI/evidence;
- `research/REFERENCE-QUALITY-POLICY.md` — policy rank/recency;
- `research/RESEARCH-QUALITY-GATES.md` — claim, baseline, abstract và artifact gates;
- `research/EXTERNAL-BASELINE-PROTOCOL.md` — protocol so sánh external tool công bằng;
- `research/PROJECT-EVIDENCE-AUDIT.md` — audit mock data và research claims toàn dự án;
- `research/rq-traceability.csv` — RQ mapping máy đọc được;
- `research/risk-register.csv` — risk và stop/go gate.

Chạy research validators bằng:

```bash
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
node research/validate-research-quality-gates.mjs
node --test research/*.test.mjs
```

`holdout-report.template.md` và `paper-results-manifest.template.json` chỉ khóa
cấu trúc bàn giao cho EVAL-111/ANALYSIS-101. Chúng giữ mọi trường dữ liệu và
result rỗng, không thay thế D3 freeze, independent annotation, statistical-plan
freeze, analysis run hoặc human review.

AI có thể vận hành browser/CLI đã được cấp quyền, tạo artifact, ledger, hash,
validator và PR. AI-generated assertion không phải evidence; source output, run,
decision, signature và hash phải tồn tại thật, có provenance và được đúng người
chịu trách nhiệm xác minh. Không đưa secret hoặc private key vào repository.

Chạy toàn bộ research contracts, biên dịch hai PDF và kiểm tra redaction bằng
một lệnh local:

```powershell
node scripts/local-verify.mjs
```

Lệnh yêu cầu Node.js 22, từ chối tracked worktree bẩn và tạo bundle trong
`artifacts/local-verification/`. Nếu host không có `latexmk` hoặc `pdftotext`,
lệnh tự build môi trường Docker đã pin để biên dịch và kiểm tra redaction. Quy tắc evidence và cách
publish bundle theo exact commit nằm tại
[`research/LOCAL-VERIFICATION.md`](research/LOCAL-VERIFICATION.md).

Sau khi người giữ vai trò Independent SLR Reviewer đã ghi đủ sáu artifact calibration thật, tạo và xác minh ledger
bằng `node research/build-slr-sentinel-ledger.mjs --write` rồi chạy lại với
`--check`. Công cụ này chỉ tính ledger/hash từ artifact đã có, không sinh kết
quả nghiên cứu. Quy trình thao tác, ký attestation và bàn giao lại cho owner nằm
tại `research/SLR-REVIEWER-RUNBOOK.md`.

## Collaboration

Đọc `CONTRIBUTING.md` trước khi sửa. Tóm tắt bắt buộc:

1. tạo branch `paper/<section>-<muc-tieu>` từ `main` mới nhất;
2. mở draft PR để giữ chính xác file/section đang sửa;
3. không có hai PR cùng sửa một section hoặc shared root file;
4. build và kiểm tra cả named lẫn anonymous PDF;
5. một reviewer ngoài tác giả chính kiểm tra content/evidence;
6. Hiếu final-review và merge;
7. chỉ designated sync steward đưa commit đã merge sang Overleaf.

GitHub Actions upload cả hai PDF cho mọi push và pull request. Chỉ dùng
`main-anonymous.pdf` cho double-blind submission.
