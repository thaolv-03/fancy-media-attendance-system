# Hệ Thống Chấm Công Face Recognition

Hệ thống chấm công hiện đại sử dụng nhận diện khuôn mặt và QR code với giao diện riêng biệt cho admin và nhân viên.

## Tính Năng

- **Nhận diện khuôn mặt**: Sử dụng WebRTC và model ONNX anti-spoofing
- **QR Code fallback**: Tự động chuyển sang QR khi face ID thất bại
- **Giao diện Admin**: Quản lý nhân viên, xem báo cáo, thống kê
- **Giao diện Nhân viên**: Đơn giản, tập trung vào chấm công
- **Auto-save**: Tự động lưu và dừng camera khi chấm công thành công
- **Anti-spoofing**: Phát hiện khuôn mặt giả bằng model AI

## Yêu Cầu Hệ Thống

- Node.js 18+ 
- npm hoặc yarn
- Camera/webcam cho face recognition
- Trình duyệt hỗ trợ WebRTC (Chrome, Firefox, Safari)

## Cài Đặt

### 1. Clone và cài đặt dependencies

\`\`\`bash
# Clone project (nếu từ GitHub)
git clone <repository-url>
cd attendance-system

# Cài đặt dependencies
npm install
# hoặc
yarn install
\`\`\`

### 2. Cấu hình Database

Database SQLite sẽ được tự động tạo khi chạy ứng dụng lần đầu.

### 3. Chạy ứng dụng Development

\`\`\`bash
npm run dev
# hoặc
yarn dev
\`\`\`

Ứng dụng sẽ chạy tại: `http://localhost:3000`

### 4. Truy cập ứng dụng

- **Trang chủ**: `http://localhost:3000` - Chọn vai trò Admin hoặc Employee
- **Admin Dashboard**: `http://localhost:3000/admin` - Quản lý hệ thống
- **Employee Interface**: `http://localhost:3000/employee` - Chấm công

## Hướng Dẫn Sử Dụng

### Admin Dashboard

1. **Thêm nhân viên mới**:
   - Vào Admin Dashboard → Employees → Add Employee
   - Nhập thông tin và chụp ảnh khuôn mặt
   - Hệ thống sẽ tự động tạo QR code

2. **Xem báo cáo chấm công**:
   - Vào Admin Dashboard → Attendance
   - Xem danh sách chấm công theo ngày
   - Xuất báo cáo Excel

3. **Quản lý nhân viên**:
   - Xem danh sách nhân viên
   - Tìm kiếm và lọc
   - Cập nhật thông tin

### Employee Interface

1. **Chấm công bằng Face ID**:
   - Vào Employee Interface
   - Đặt khuôn mặt vào khung camera
   - Hệ thống tự động nhận diện và lưu

2. **Chấm công bằng QR Code**:
   - Chỉ hiện khi Face ID thất bại 3 lần
   - Quét QR code hoặc upload ảnh QR
   - Hệ thống tự động xử lý

## Triển Khai Production

### 1. Triển khai lên Vercel (Khuyến nghị)

\`\`\`bash
# Cài đặt Vercel CLI
npm i -g vercel

# Deploy
vercel

# Hoặc kết nối với GitHub và auto-deploy
\`\`\`

### 2. Triển khai lên VPS/Server

\`\`\`bash
# Build ứng dụng
npm run build

# Chạy production
npm start
\`\`\`

### 3. Cấu hình Nginx (nếu cần)

\`\`\`nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
\`\`\`

## Biến Môi Trường

Tạo file `.env.local` (không bắt buộc, có giá trị mặc định):

\`\`\`env
# Database
DATABASE_URL=./attendance.db

# Face Recognition Settings
FACE_SIMILARITY_THRESHOLD=0.6
ANTI_SPOOFING_THRESHOLD=0.5

# App Settings
NEXT_PUBLIC_APP_NAME="Hệ Thống Chấm Công"
\`\`\`

## Cấu Trúc Thư Mục

\`\`\`
├── app/                    # Next.js App Router
│   ├── admin/             # Admin dashboard pages
│   ├── employee/          # Employee interface
│   └── api/               # API routes
├── components/            # React components
│   ├── admin/            # Admin components
│   ├── employee/         # Employee components
│   └── ui/               # Shared UI components
├── lib/                   # Utilities and database
├── public/               # Static assets
└── scripts/              # Database scripts
\`\`\`

## Troubleshooting

### Camera không hoạt động
- Kiểm tra quyền camera trong trình duyệt
- Đảm bảo sử dụng HTTPS trong production
- Thử trình duyệt khác

### Face recognition không chính xác
- Đảm bảo ánh sáng đủ
- Khuôn mặt nhìn thẳng camera
- Kiểm tra threshold trong settings

### Database lỗi
- Xóa file `attendance.db` để reset
- Kiểm tra quyền ghi file
- Restart ứng dụng

## Hỗ Trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra console browser (F12)
2. Xem logs server
3. Đảm bảo tất cả dependencies đã được cài đặt

## Cập Nhật

\`\`\`bash
# Cập nhật dependencies
npm update

# Rebuild sau khi cập nhật
npm run build
"# fancy-media-attendance-system" 
