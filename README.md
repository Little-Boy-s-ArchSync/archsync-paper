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
├── references.bib
├── research/                    # Governed protocols, evidence and validators
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
- `research/rq-traceability.csv` — RQ mapping máy đọc được;
- `research/risk-register.csv` — risk và stop/go gate.

Chạy research validators bằng:

```bash
node research/validate-baseline.mjs
node research/validate-rq-traceability.mjs
node research/validate-claim-evidence.mjs
node research/validate-literature-protocol.mjs
node research/validate-search-queries.mjs
node research/validate-screening-criteria.mjs
node research/validate-literature-matrix.mjs
node research/validate-reference-quality-policy.mjs
node --test research/*.test.mjs
```

AI có thể vận hành browser/CLI đã được cấp quyền, tạo artifact, ledger, hash,
validator và PR. AI-generated assertion không phải evidence; source output, run,
decision, signature và hash phải tồn tại thật, có provenance và được đúng người
chịu trách nhiệm xác minh. Không đưa secret hoặc private key vào repository.

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
