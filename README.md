<div align="center">
  <img src="./public/fancy-media-logo.svg" alt="logo" width="100"/>
  <h1>Hệ Thống Chấm Công Nhận Diện Khuôn Mặt</h1>
  <p>
    Một giải pháp chấm công hiện đại, ứng dụng AI để nhận diện khuôn mặt và quản lý nhân sự một cách hiệu quả, được xây dựng trên nền tảng Next.js.
  </p>
  
  <p>
    <a href="https://github.com/thaolv-03/fancy-media-attendance-system/blob/main/LICENSE">
      <img alt="License" src="https://img.shields.io/badge/license-MIT-blue.svg"/>
    </a>
    <a href="#">
      <img alt="Next.js" src="https://img.shields.io/badge/Next.js-14-black?logo=next.js"/>
    </a>
     <a href="#">
      <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript"/>
    </a>
    <a href="#">
      <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-3-green?logo=tailwind-css"/>
    </a>
  </p>
</div>

## ✨ Tính Năng Nổi Bật

- **👤 Giao diện Admin:**
  - 📊 **Dashboard:** Theo dõi và quản lý toàn bộ hệ thống.
  - 👥 **Quản lý nhân viên:** Thêm, sửa, xóa thông tin và hình ảnh nhân viên.
  - 🤖 **Tự động tạo QR Code:** Mỗi nhân viên được cấp một mã QR duy nhất.
  - 📅 **Lịch sử chấm công:** Xem lại và lọc lịch sử điểm danh theo ngày.
  - 📈 **Thống kê chuyên cần:** Phân tích và đánh giá tỷ lệ đi làm của nhân viên.
  - 📄 **Xuất báo cáo:** Xuất dữ liệu chấm công ra file Excel.
  - 🔒 **Bảo mật:** Thay đổi mật khẩu tài khoản quản trị.
- **👨‍💼 Giao diện Nhân viên:**
  - 📷 **Chấm công bằng AI:** Sử dụng camera để nhận diện khuôn mặt nhanh chóng và chính xác.
  - 🛡️ **Chống giả mạo (Anti-Spoofing):** Model AI tích hợp giúp phát hiện các trường hợp sử dụng ảnh hoặc video để gian lận.
- **⚡ Hiệu suất:**
  - **Tự động dừng camera:** Camera sẽ tự động tắt sau khi chấm công thành công để tiết kiệm tài nguyên.

## 📸 Hình Ảnh Demo

<details>
<summary>Nhấn để xem ảnh chụp màn hình</summary>
<br/>
<p align="center">
  <em>(Thêm ảnh chụp màn hình trang Admin Dashboard ở đây)</em>
  <br/>
  <strong>Trang quản trị của Admin</strong>
</p>
<p align="center">
  <em>(Thêm ảnh chụp màn hình trang Chấm công của nhân viên ở đây)</em>
  <br/>
  <strong>Giao diện chấm công của nhân viên</strong>
</p>
</details>

## 🚀 Công Nghệ Sử Dụng

| Hạng mục        | Công nghệ                                                                                               |
| --------------- | ------------------------------------------------------------------------------------------------------- |
| **Framework**   | [Next.js](https://nextjs.org/) (App Router), [React](https://reactjs.org/)                              |
| **Ngôn ngữ**    | [TypeScript](https://www.typescriptlang.org/)                                                           |
| **Styling**     | [Tailwind CSS](https://tailwindcss.com/), [Shadcn/ui](https://ui.shadcn.com/)                            |
| **Database**    | [SQLite](https://www.sqlite.org/index.html) (sử dụng `better-sqlite3`)                                  |
| **Nhận diện AI**  |• **Runtime:** [ONNX Runtime Web](https://onnxruntime.ai/docs/api/js/)<br/>• **Nhận diện:** Model [Facenet512](https://github.com/serengil/deepface)<br/>• **Chống giả mạo:** Model từ [Face-AntiSpoofing](https://github.com/hairymax/Face-AntiSpoofing) |
| **Session**     | [Iron Session](https://github.com/vvo/iron-session)                                                     |
| **Bảo mật**     | [Bcrypt.js](https://www.npmjs.com/package/bcryptjs)                                                      |

## 🛠️ Cài Đặt và Khởi Chạy

### 1. Yêu Cầu

- Node.js 20+
- `npm` hoặc `yarn`
- Webcam/Camera

### 2. Cài Đặt

```bash
# Clone repository (nếu bạn chưa có)
git clone https://github.com/thaolv-03/fancy-media-attendance-system.git

# Di chuyển vào thư mục dự án
cd fancy-media-attendance-system

# Cài đặt các dependencies
npm install
```

### 3. Khởi tạo Database

Chạy script sau để tạo file `attendance.db` và tài khoản admin mặc định.

```bash
npm run db:init
```

> **Tài khoản Admin mặc định:**
>
> - **Username:** `admin`
> - **Password:** `admin`
>
> ⚠️ **Quan trọng:** Vui lòng đổi mật khẩu ngay sau khi đăng nhập lần đầu tại trang `/admin/settings`.

### 4. Chạy ứng dụng

```bash
npm run dev
```

🎉 Ứng dụng sẽ chạy tại địa chỉ: [http://localhost:3000](http://localhost:3000)

## 🏗️ Kiến Trúc Hệ Thống

### Sơ đồ Database

Dự án sử dụng SQLite với 3 bảng chính:

-   `admins`: Lưu trữ thông tin tài khoản quản trị (username, password đã mã hóa).
-   `employees`: Lưu trữ thông tin nhân viên (tên, chức vụ, email) và vector khuôn mặt (face_embedding) dùng cho việc nhận diện.
-   `attendance`: Ghi lại lịch sử các lần chấm công (thời gian, id nhân viên).

### API Endpoints

Hệ thống cung cấp các API endpoint theo chuẩn RESTful:

| Method | Endpoint                    | Chức năng                                        |
| ------ | --------------------------- | ------------------------------------------------ |
| `POST` | `/api/auth/login`           | Đăng nhập tài khoản admin.                       |
| `POST` | `/api/auth/logout`          | Đăng xuất tài khoản admin.                       |
| `PUT`  | `/api/admin/change-password`| Thay đổi mật khẩu admin.                          |
| `GET`  | `/api/employees`            | Lấy danh sách tất cả nhân viên.                  |
| `POST` | `/api/employees`            | Tạo một nhân viên mới.                           |
| `GET`  | `/api/employees/[id]`       | Lấy thông tin chi tiết của một nhân viên.        |
| `PUT`  | `/api/employees/[id]`       | Cập nhật thông tin của một nhân viên.            |
| `DELETE`| `/api/employees/[id]`      | Xóa một nhân viên.                               |
| `GET`  | `/api/attendance`           | Lấy lịch sử chấm công trong ngày.                |
| `POST` | `/api/attendance/record`    | Ghi nhận một lượt chấm công bằng nhận diện khuôn mặt. |


## 🤝 Đóng Góp

Mọi sự đóng góp đều được chào đón! Nếu bạn có ý tưởng để cải thiện dự án, vui lòng fork repository và tạo một Pull Request.

1. **Fork** dự án.
2. Tạo một branch mới (`git checkout -b feature/AmazingFeature`).
3. **Commit** những thay đổi của bạn (`git commit -m 'Add some AmazingFeature'`).
4. **Push** lên branch (`git push origin feature/AmazingFeature`).
5. Mở một **Pull Request**.

## 📄 Bản Quyền

Dự án này được cấp phép theo Giấy phép MIT. Xem chi tiết tại file [LICENSE](https://github.com/thaolv-03/fancy-media-attendance-system/blob/main/LICENSE).
