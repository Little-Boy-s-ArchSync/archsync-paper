# SLR-101 Independent Reviewer Runbook

Tài liệu này là hướng dẫn thao tác dành cho người được phân công vai trò
Independent SLR Reviewer. Quy định nghiên
cứu chính thức vẫn nằm trong `literature-protocol.md`; runbook không thay đổi
query, tiêu chí, nguồn dữ liệu hoặc Definition of Done của protocol.

## 0. Lệnh giao việc cho AI của reviewer

Independent SLR Reviewer có thể gửi nguyên văn yêu cầu sau cho AI đang có quyền
điều khiển browser và workspace của reviewer:

```text
Bạn được tôi, Independent SLR Reviewer, ủy quyền thực hiện workflow kỹ thuật
SLR-REV-101 theo research/SLR-REVIEWER-RUNBOOK.md và
research/AI-EVIDENCE-POLICY.md 1.1.0. Hãy dùng phiên đăng nhập thật của tôi để
chạy sáu DOI sentinel, lưu official source capture và provenance, tạo đúng sáu
JSON, build ledger, chạy validator/test, chuẩn bị branch/PR và bundle review.
Không được tạo số liệu giả hoặc điền thông tin không quan sát được. Nếu một
database chưa đăng nhập hoặc không truy cập được, yêu cầu tôi mở quyền truy cập
rồi tiếp tục. Sau khi bundle hoàn tất, dừng để tôi kiểm tra và chấp thuận exact
commit. Chỉ sau khi tôi xác nhận rõ exact commit, attestation, UTC time và hành
động ký, bạn mới được gọi automation ký cục bộ. Không đọc, hiển thị, sao chép,
upload hoặc lưu nội dung private key.
```

Yêu cầu này cho phép AI làm toàn bộ phần cơ học. AI không được dừng chỉ vì nó
không phải reviewer hoặc vì output tự sinh không phải evidence; thay vào đó nó
phải thu thập output thật, tạo artifact có provenance và chuyển bundle cho
reviewer xác minh. Những điểm duy nhất cần quyết định của người thật là cấp
quyền truy cập, chấp nhận/sửa kết quả cuối và phê duyệt exact action ký.

## 1. Ranh giới trách nhiệm

- Hiếu là tác giả và owner của protocol, không được tự tạo review approval hoặc
  ký thay reviewer.
- Independent SLR Reviewer chịu trách nhiệm cho sentinel-only calibration,
  mười mục review và private key Ed25519 ngoài repository. Reviewer được phép
  giao AI thực hiện các thao tác kỹ thuật theo phiên truy cập đã được cấp quyền.
- Không chạy official Search-A/B/C, không mở danh sách kết quả để screening và
  không dùng candidate results để sửa inclusion/exclusion criteria.
- Nếu không truy cập được IEEE Xplore, ACM Digital Library, OpenAlex hoặc
  Semantic Scholar, dừng lại và ghi blocker; không thay nguồn khác một cách im
  lặng.
- Trước khi chạy, reviewer phải có quyền truy cập IEEE/ACM và hai API key miễn
  phí do nhóm kiểm soát cho OpenAlex và Semantic Scholar. Key phải được đọc từ
  secret store hoặc biến môi trường cục bộ. OpenAlex client chỉ được chèn key
  vào tham số `api_key` tại lúc gửi request rồi xóa tham số đó khỏi mọi output;
  Semantic Scholar client dùng header `x-api-key`. Không lưu key trong terminal
  output, JSON, CSV, ảnh chụp, issue, pull request hoặc Git history.
- Nếu Semantic Scholar trả HTTP 429 trong chế độ không xác thực, đó là lỗi
  preflight chứ không phải kết luận `not-indexed`. Cấu hình API key rồi chạy lại
  sentinel-only query; không ghi số đếm từ lần bị rate-limit.

### AI được phép thực hiện

Independent SLR Reviewer và các thành viên khác được phép giao AI thực hiện gần
như toàn bộ workflow kỹ thuật: điều khiển browser/CLI, chạy truy vấn sentinel
trong phiên database thật đã được cấp quyền, lưu source capture, tạo sáu JSON,
build ledger, chuẩn hóa metadata, đề xuất classification, chạy validator/test,
chuẩn bị PR và chuẩn bị freeze bundle. Rule đầy đủ nằm trong
`AI-EVIDENCE-POLICY.md`.

AI output tự sinh không phải evidence, nhưng output chính thức được AI thu thập
từ một database run thật có source capture và provenance có thể trở thành
evidence sau gate xác minh. AI không được bịa dữ liệu còn thiếu hoặc tuyên bố
một thao tác chưa thực sự xảy ra. Reviewer không phải tự gõ lại query hay JSON;
reviewer chỉ cần kiểm tra bundle cuối với official page/export đã lưu, sửa sai
nếu có và chấp thuận exact commit. AI có thể thực hiện thao tác submit approval
hoặc chạy lệnh ký sau khi reviewer đã phê duyệt chính xác hành động đó. AI
không được đọc, hiển thị, sao chép, upload hoặc lưu nội dung private key và
không được tính là reviewer độc lập.

## 2. Sáu sentinel cố định

| Artifact | DOI |
| --- | --- |
| `S-001.json` | `10.1145/222124.222136` |
| `S-002.json` | `10.1109/WICSA.2007.1` |
| `S-003.json` | `10.1002/spe.931` |
| `S-004.json` | `10.1016/j.jss.2011.07.036` |
| `S-005.json` | `10.3217/jucs-023-08-0769` |
| `S-006.json` | `10.1002/smr.2423` |

Lưu ý registry cho `S-005`: DOI `10.3217/jucs-023-08-0769` resolve đến trang
publisher và có metadata trên DataCite. Crossref trả 404 không có nghĩa DOI sai
format, vì Crossref không phải registration agency của DOI này. Khi kiểm tra
identity, thử DOI resolver trước, sau đó tra đúng registry hoặc publisher; không
được dùng riêng kết quả Crossref để kết luận DOI không hợp lệ.

Các DOI trên là tập kiểm tra khả năng truy hồi, không mặc nhiên là sáu nguồn
tham khảo tốt nhất cho mọi claim trong paper. Khi một sentinel hoặc paper mới
được đề xuất làm nguồn trích dẫn, reviewer áp dụng thêm
`REFERENCE-QUALITY-POLICY.md`: ưu tiên journal Q1, chấp nhận Q1/Q2 là nhóm xếp
hạng cao, ưu tiên 2022--2026 và ghi lý do thật cho paper nền tảng cũ hơn.

Rapid Journal Quality Check được dùng để hỗ trợ kiểm tra ban đầu. Với journal,
phải đối chiếu kết quả extension với nguồn xếp hạng, năm và category được ghi
trong evidence. Với conference, ghi quartile là không áp dụng và kiểm tra venue,
peer review, indexing cùng độ liên quan. Không đổi hoặc loại sentinel chỉ vì nó
không phải Q1; thay đổi tập sentinel phải đi qua protocol amendment trước khi
xem official results.

Với từng DOI, Independent SLR Reviewer hoặc AI được reviewer ủy quyền chạy truy
vấn chỉ nhằm kiểm tra sentinel trong các nguồn có quyền truy cập. Mỗi run phải
ghi nguyên văn query, source, query family, UTC timestamp, result count,
`sentinel_found` và URL HTTPS trên domain chính thức của nguồn. Không ghi lại
kết quả từ trí nhớ, ảnh minh họa hoặc URL tìm kiếm chung không tái mở được.

## 3. Tạo sentinel artifacts

1. Tạo branch review riêng từ `main` đã đồng bộ.
2. Tạo thư mục `research/evidence/slr-sentinel/`.
3. Dùng `slr-sentinel-evidence.template.json` làm khuôn và tạo đúng sáu file từ
   `S-001.json` đến `S-006.json`.
4. Reviewer hoặc AI được ủy quyền điền dữ liệu ngay sau mỗi truy vấn thật. Giữ
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

## 4. Calibration tiêu chí screening SLR-103

Trước khi xem official search result, Hiếu và Independent SLR Reviewer chọn
trước ít nhất tám pilot record gồm trường hợp rõ ràng được nhận, rõ ràng bị loại
và trường hợp mơ hồ. Pilot có thể dùng các sentinel cố định hoặc method fixture
được chọn độc lập với result list; không tính pilot là kết quả SLR.

Mỗi reviewer tạo bản riêng từ `literature-screening.template.csv`, dùng cùng
criteria version, protocol version, record SHA-256 và round. Exclusion phải ghi
primary E-code, factual note và evidence location theo
`literature-screening-criteria.md`. Hai bên giữ private decision file ngoài
repository và không xem quyết định của nhau trước khi hoàn tất bước commitment.

Mỗi reviewer tự tạo một nonce ngẫu nhiên mật mã ít nhất 32 byte bằng bộ sinh
ngẫu nhiên an toàn của hệ điều hành, giữ nonce ngoài repository, rồi tạo
HMAC-SHA256 commitment theo schema của
`verify-slr-screening-calibration.mjs`. Một commit chung phải chứa đúng pilot
set, các record snapshot và hai commitment manifest trong calibration root;
tree tại commit đó không được chứa decision file, nonce, reveal manifest,
adjudication hoặc summary. Commit reveal phải là hậu duệ nghiêm ngặt của commit
chung. Cả hai commitment phải được seal trước khi một bên reveal; hai nonce phải
khác nhau.

Chỉ sau khi verifier mở được cả hai commitment từ exact decision bytes, hai bên
mới đối chiếu và tính decision agreement cùng primary-reason agreement. Mỗi chỉ
số phải đạt ít nhất 80% và mọi disagreement phải có resolution do adjudicator
thứ ba ghi sau cả hai reveal. Nếu không đạt, dừng freeze, sửa candidate có
version và lặp calibration bằng pilot set mới. Không dùng dữ liệu giả để điền
gate này.

Verifier chứng minh schema, hash/HMAC opening, exact tree tại commitment,
strict ancestry, trạng thái HEAD/index/worktree và phép tính agreement. Nó không
chứng minh danh tính thật của tên được nhập, nonce thật sự ngẫu nhiên/được giữ
bí, metadata nguồn là đúng, hoặc hai người thực sự làm việc độc lập. Hiếu,
Independent SLR Reviewer và adjudicator phải tự kiểm tra và chịu trách nhiệm
cho các sự kiện đó; signed review cuối cùng không được thay bằng output của AI.

Chạy validator của codebook trước và sau calibration:

```powershell
node research/validate-screening-criteria.mjs
node --test research/verify-slr-screening-calibration.test.mjs
```

Calibration sử dụng đúng ba commit tuần tự. Không dùng `git add research`,
không đặt nonce chưa reveal trong repository và không tạo review evidence trước
khi summary đã được build và kiểm tra.

Commit 1 chỉ seal pilot, record snapshot và hai commitment:

```powershell
git add research/evidence/slr-screening-calibration/pilot-set.json
git add research/evidence/slr-screening-calibration/records
git add research/evidence/slr-screening-calibration/hieu-commitment.json
git add research/evidence/slr-screening-calibration/independent-slr-reviewer-commitment.json
git commit -m "Seal SLR-103 calibration commitments"
$CALIBRATION_COMMIT = git rev-parse HEAD
```

Commit 2 reveal exact decision bytes, nonce manifests và adjudication. Summary
chưa được phép tồn tại trong worktree, index hoặc HEAD ở bước này:

```powershell
git add research/evidence/slr-screening-calibration/hieu-decisions.csv
git add research/evidence/slr-screening-calibration/independent-slr-reviewer-decisions.csv
git add research/evidence/slr-screening-calibration/hieu-reveal.json
git add research/evidence/slr-screening-calibration/independent-slr-reviewer-reveal.json
git add research/evidence/slr-screening-calibration/adjudication.csv
git commit -m "Reveal and adjudicate SLR-103 calibration"
node research/build-slr-screening-calibration.mjs --write $CALIBRATION_COMMIT
git diff --cached --name-only
git status --short -- research/literature-screening-calibration.json
```

Builder phải để staging area rỗng và chỉ tạo một file untracked mode `0644`.
Không mở file đó để sửa tay, không dùng `--force`, không chạy lại `--write` để
ghi đè và không giao builder quyền stage hoặc commit. Commit 3 chỉ thêm exact
summary do verifier sinh ra, sau đó chạy default verifier bằng `--check`:

```powershell
git add research/literature-screening-calibration.json
git commit -m "Add generated SLR-103 calibration summary"
node research/build-slr-screening-calibration.mjs --check
node research/validate-screening-criteria.mjs
node --test research/verify-slr-screening-calibration.test.mjs research/build-slr-screening-calibration.test.mjs
```

Nếu threshold không đạt, primary-reason denominator bằng không, disagreement
chưa resolve, Git boundary sai hoặc artifact còn dirty thì `--write` phải block
và không tạo summary. Một output tạo nhầm chỉ được xóa để sinh lại khi đã xác
nhận nó chưa từng được stage, commit hoặc review. Summary đã track hoặc đã được
review thì không được ghi đè; phải sửa governed evidence, tạo lịch sử commit mới
và xin review mới. Bất kỳ thay đổi nào vào calibration input sau đó đều làm
summary và final approval cũ mất hiệu lực.

SLR-103 vẫn là `Đang làm` cho tới khi có calibration evidence thật và codebook
được final lock cùng review evidence; codebook candidate và test fixture không
thay thế quyết định độc lập của hai reviewer.

## 5. Tạo khóa reviewer

Private key thuộc quyền kiểm soát của Independent SLR Reviewer, nằm ở đường dẫn
tuyệt đối ngoài repository và không được gửi cho Hiếu hoặc commit lên GitHub.
Reviewer có thể tự chạy hoặc cho phép AI chạy lệnh tạo khóa cục bộ; AI chỉ được
dùng đường dẫn, không được đọc hoặc truyền nội dung private key:

```powershell
node research/create-slr-signed-review.mjs generate-key "D:\private\archsync-independent-slr-reviewer.pem"
```

Chỉ file public key do công cụ tạo tại
`research/evidence/slr-review/independent-slr-reviewer-public-key.pem` được
commit cùng sentinel artifacts và ledger.

## 6. Review exact commit

Independent SLR Reviewer có thể giao AI commit, push branch evidence, mở pull
request và lấy exact 40-character commit bằng:

```powershell
git rev-parse HEAD
```

Reviewer phải trực tiếp xác nhận đủ mười mục trong Section 18 của protocol sau
khi kiểm tra bundle do mình hoặc AI chuẩn bị, bao gồm query
equivalence, accessibility của bốn nguồn, sentinel recall, eligibility,
deduplication, dual screening, quality/extraction fields, AI-use boundary và
việc official results chưa bị xem.

Nếu một mục chưa đạt, không ký. Ghi comment hoặc issue cụ thể và sửa trên một
commit mới; commit cũ không được dùng làm review commit.

## 7. Ký attestation

Sau khi exact commit đạt yêu cầu, Independent SLR Reviewer phê duyệt chính xác
commit, attestation, thời điểm và thao tác ký. Reviewer có thể tự chạy hoặc cho
phép AI chạy lệnh sau trong máy của reviewer bằng private key cục bộ:

```powershell
node research/create-slr-signed-review.mjs sign "D:\private\archsync-independent-slr-reviewer.pem" "https://github.com/Little-Boy-s-ArchSync/archsync-paper/pull/PR_NUMBER" "REVIEW_COMMIT_40_HEX" "YYYY-MM-DDTHH:MM:SSZ"
```

Công cụ phải tạo đúng ba artifact review và `research/slr-review-record.md`:

- `research/evidence/slr-review/independent-slr-reviewer-attestation.json`;
- `research/evidence/slr-review/independent-slr-reviewer-attestation.sig`;
- `research/evidence/slr-review/independent-slr-reviewer-public-key.pem`; và
- `research/slr-review-record.md`.

Không tạo hoặc chỉnh các file này bằng tay. AI không được đọc hay xuất private
key. Không ký lại một commit đã thay đổi sau review.

## 8. Gate theo từng trạng thái trước khi giao lại cho Hiếu

Không chạy một danh sách lệnh duy nhất rồi kỳ vọng cả candidate state và frozen
state cùng hợp lệ. Workflow có ba trạng thái tuần tự; output mong đợi của mỗi
trạng thái khác nhau.

### 8.1 Candidate evidence, trước review và ký

Independent SLR Reviewer hoặc AI được ủy quyền chạy:

```powershell
node research/build-slr-sentinel-ledger.mjs --check
node research/validate-literature-protocol.mjs
node research/validate-search-queries.mjs
node research/validate-screening-criteria.mjs
node --test research/*.test.mjs
```

Ở trạng thái này, `validate-literature-protocol.mjs` phải xác nhận candidate hợp
lệ. `freeze-literature-protocol.mjs --check` chưa phải acceptance gate và được
phép in `FREEZE BLOCKED` vì review record, attestation hoặc signature chưa tồn
tại. Không dùng lỗi dự kiến đó để tạo approval giả hoặc bỏ qua review.

### 8.2 Sau khi reviewer chấp thuận exact commit và ký

Chỉ sau Section 6 và Section 7, chạy lại candidate validators rồi kiểm tra
prospective freeze:

```powershell
node research/build-slr-sentinel-ledger.mjs --check
node research/validate-literature-protocol.mjs
node research/validate-search-queries.mjs
node research/validate-screening-criteria.mjs
node research/freeze-literature-protocol.mjs --check
node --test research/*.test.mjs
```

Lúc này `freeze-literature-protocol.mjs --check` phải in
`READY TO FREEZE SLR PROTOCOL 1.0.0`. Lệnh `--check` chỉ dựng và xác minh trạng
thái 1.0.0 dự kiến trong bộ nhớ; reviewer không chạy `--write` và không tự nhận
vai trò protocol owner. Commit signed-review cùng output gate được giao cho
Hiếu.

### 8.3 Sau khi owner ghi freeze state

Hiếu thực hiện Section 9. Trên commit freeze mới, chạy lại:

```powershell
node research/build-slr-sentinel-ledger.mjs --check
node research/validate-literature-protocol.mjs
node research/validate-search-queries.mjs
node research/validate-screening-criteria.mjs
node --test research/*.test.mjs
```

GitHub Actions trên pull request sau đó kiểm tra live provenance giữa current
head, reviewed ancestor, các file review được phép thêm và đúng ba output freeze.
Hai lệnh `validate-literature-protocol.mjs` và
`freeze-literature-protocol.mjs --check` tải và kiểm tra toàn bộ sentinel JSON,
ledger, review record, attestation, public key, detached signature và quan hệ
giữa các commit. Các module `verify-slr-*.mjs` là thư viện nội bộ, không phải CLI
để chạy trực tiếp.

Nếu gate đúng với trạng thái hiện tại vẫn lỗi, giữ SLR-101 ở trạng thái `Đang
làm` và chuyển nguyên thông báo lỗi cho Hiếu; không đổi trạng thái Sheet để che
blocker.

## 9. Freeze do owner thực hiện

Sau khi review evidence đã được kiểm chứng, Hiếu chạy:

```powershell
node research/freeze-literature-protocol.mjs --check
node research/freeze-literature-protocol.mjs --write
node research/validate-literature-protocol.mjs
```

Freeze chỉ được thay đổi `literature-protocol.md`, `decision-log.md` và
`main.tex` theo automation. Sau merge và CI pass, Hiếu mới chuyển SLR-101 sang
`Đã làm` và đồng bộ `main.tex` lên Overleaf.
