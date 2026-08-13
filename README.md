# ArchSync Research Paper

Nguồn LaTeX của bài nghiên cứu **ArchSync: Evidence-Backed Detection of Architecture Drift in TypeScript Systems**.

Repository này phải được giữ ở chế độ **private** trong thời gian bài báo được phản biện ẩn danh. Không thêm tên tác giả, đơn vị, email hoặc liên kết có thể nhận diện nhóm trước khi kết thúc quy trình double-blind review.

## Cấu trúc

```text
.
├── main.tex                    # Tài liệu chính
├── references.bib              # Tài liệu tham khảo
├── acmart.cls                  # ACM document class từ Overleaf
├── ACM-Reference-Format.bst    # ACM bibliography style
└── .github/workflows/
    └── build-paper.yml         # Biên dịch và kiểm tra trên GitHub Actions
```

Hai sơ đồ hệ thống và quy trình evaluation được viết trực tiếp bằng TikZ trong `main.tex`, vì vậy không cần chỉnh sửa một file ảnh độc lập.

## Biên dịch cục bộ

Cài TeX Live hoặc MiKTeX có `latexmk`, sau đó chạy:

```bash
latexmk -pdf -file-line-error -halt-on-error -interaction=nonstopmode main.tex
```

PDF được tạo tại `main.pdf`. File này không được commit; GitHub Actions sẽ tạo PDF artifact cho mỗi lần push và pull request.

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

- Giữ `anonymous` trong tùy chọn của `acmart`.
- Giữ tác giả và affiliation ở dạng ẩn danh.
- Kiểm tra không có thông tin nhận diện trong nội dung, metadata, README hoặc lịch sử commit.
- Tải PDF artifact từ tab **Actions** và kiểm tra trực quan lần cuối.
- Chỉ công khai repository sau khi chính sách của venue cho phép.

## Nguồn đồng bộ

Source ban đầu được xuất từ dự án Overleaf `ArchSync Research Draft`. Bản GitHub được chuẩn hóa với `main.tex` và `references.bib`; nội dung paper, công thức, bảng và TikZ giữ nguyên so với bản Overleaf tại thời điểm khởi tạo repository.
