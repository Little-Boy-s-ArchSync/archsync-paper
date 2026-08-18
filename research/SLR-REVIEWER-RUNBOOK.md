# SLR-101 Independent Reviewer Runbook

Tài liệu này là hướng dẫn thao tác dành cho người được phân công vai trò
Independent SLR Reviewer. Quy định nghiên
cứu chính thức vẫn nằm trong `literature-protocol.md`; runbook không thay đổi
query, tiêu chí, nguồn dữ liệu hoặc Definition of Done của protocol.

## 1. Ranh giới trách nhiệm

- Hiếu là tác giả và owner của protocol, không được tự tạo review approval hoặc
  ký thay reviewer.
- Independent SLR Reviewer phải tự thực hiện sentinel-only calibration, kiểm
  tra mười mục review và giữ private key Ed25519 ngoài repository.
- Không chạy official Search-A/B/C, không mở danh sách kết quả để screening và
  không dùng candidate results để sửa inclusion/exclusion criteria.
- Nếu không truy cập được IEEE Xplore, ACM Digital Library, Scopus hoặc Web of
  Science, dừng lại và ghi blocker; không thay nguồn khác một cách im lặng.

## 2. Sáu sentinel cố định

| Artifact | DOI |
| --- | --- |
| `S-001.json` | `10.1145/222124.222136` |
| `S-002.json` | `10.1109/WICSA.2007.1` |
| `S-003.json` | `10.1002/spe.931` |
| `S-004.json` | `10.1016/j.jss.2011.07.036` |
| `S-005.json` | `10.3217/jucs-023-08-0769` |
| `S-006.json` | `10.1002/smr.2423` |

Với từng DOI, Independent SLR Reviewer chạy truy vấn chỉ nhằm kiểm tra sentinel
trong các nguồn có quyền truy cập. Mỗi run phải ghi nguyên văn query, source,
query family, UTC timestamp, result count, `sentinel_found` và URL HTTPS trên
domain chính thức của nguồn. Không ghi lại kết quả từ trí nhớ, ảnh minh họa hoặc
URL tìm kiếm chung không tái mở được.

## 3. Tạo sentinel artifacts

1. Tạo branch review riêng từ `main` đã đồng bộ.
2. Tạo thư mục `research/evidence/slr-sentinel/`.
3. Dùng `slr-sentinel-evidence.template.json` làm khuôn và tạo đúng sáu file từ
   `S-001.json` đến `S-006.json`.
4. Điền dữ liệu ngay sau mỗi truy vấn thật. Giữ
   `official_search_executed: false` và `candidate_results_screened: false`.
5. Không sửa template để biến placeholder thành evidence.

Sau khi đủ sáu file, chạy:

```powershell
node research/build-slr-sentinel-ledger.mjs --write
node research/build-slr-sentinel-ledger.mjs --check
node research/validate-literature-protocol.mjs
```

Builder phải tạo `research/literature-sentinel-recall.csv` từ sáu artifact và
SHA-256 thật. Không chỉnh tay ledger sau khi tạo.

## 4. Tạo khóa reviewer

Private key phải do Independent SLR Reviewer tự tạo, nằm ở đường dẫn tuyệt đối
ngoài repository và không được gửi cho Hiếu hoặc commit lên GitHub:

```powershell
node research/create-slr-signed-review.mjs generate-key "D:\private\archsync-independent-slr-reviewer.pem"
```

Chỉ file public key do công cụ tạo tại
`research/evidence/slr-review/independent-slr-reviewer-public-key.pem` được
commit cùng sentinel artifacts và ledger.

## 5. Review exact commit

Independent SLR Reviewer commit và push branch evidence, mở pull request, sau đó
kiểm tra exact 40-character commit bằng:

```powershell
git rev-parse HEAD
```

Reviewer phải xác nhận đủ mười mục trong Section 18 của protocol, bao gồm query
equivalence, accessibility của bốn nguồn, sentinel recall, eligibility,
deduplication, dual screening, quality/extraction fields, AI-use boundary và
việc official results chưa bị xem.

Nếu một mục chưa đạt, không ký. Ghi comment hoặc issue cụ thể và sửa trên một
commit mới; commit cũ không được dùng làm review commit.

## 6. Ký attestation

Sau khi exact commit đạt yêu cầu, Independent SLR Reviewer tự chạy lệnh sau bằng
private key của mình:

```powershell
node research/create-slr-signed-review.mjs sign "D:\private\archsync-independent-slr-reviewer.pem" "https://github.com/Little-Boy-s-ArchSync/archsync-paper/pull/PR_NUMBER" "REVIEW_COMMIT_40_HEX" "YYYY-MM-DDTHH:MM:SSZ"
```

Công cụ phải tạo đúng ba artifact review và `research/slr-review-record.md`:

- `research/evidence/slr-review/independent-slr-reviewer-attestation.json`;
- `research/evidence/slr-review/independent-slr-reviewer-attestation.sig`;
- `research/evidence/slr-review/independent-slr-reviewer-public-key.pem`; và
- `research/slr-review-record.md`.

Không tạo hoặc chỉnh các file này bằng tay. Không ký lại một commit đã thay đổi
sau review.

## 7. Gate trước khi giao lại cho Hiếu

Independent SLR Reviewer chạy toàn bộ kiểm tra sau trên branch review:

```powershell
node research/build-slr-sentinel-ledger.mjs --check
node research/validate-literature-protocol.mjs
node research/freeze-literature-protocol.mjs --check
node --test research/*.test.mjs
```

Hai lệnh `validate-literature-protocol.mjs` và
`freeze-literature-protocol.mjs --check` tải và kiểm tra toàn bộ sentinel JSON,
ledger, review record, attestation, public key, detached signature và quan hệ
giữa các commit. Các module `verify-slr-*.mjs` là thư viện nội bộ, không phải CLI
để chạy trực tiếp.

Branch chỉ sẵn sàng giao lại khi `freeze-literature-protocol.mjs --check` in
`READY TO FREEZE SLR PROTOCOL 1.0.0`, toàn bộ tests pass và GitHub Actions xanh.
Nếu lệnh vẫn in `FREEZE BLOCKED`, giữ SLR-101 ở trạng thái `Đang làm` và chuyển
nguyên thông báo lỗi cho Hiếu; không đổi trạng thái Sheet để che blocker.

## 8. Freeze do owner thực hiện

Sau khi review evidence đã được kiểm chứng, Hiếu chạy:

```powershell
node research/freeze-literature-protocol.mjs --check
node research/freeze-literature-protocol.mjs --write
node research/validate-literature-protocol.mjs
```

Freeze chỉ được thay đổi `literature-protocol.md`, `decision-log.md` và
`main.tex` theo automation. Sau merge và CI pass, Hiếu mới chuyển SLR-101 sang
`Đã làm` và đồng bộ `main.tex` lên Overleaf.
