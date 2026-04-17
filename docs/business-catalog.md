# Business Catalog

Tài liệu lưu trữ tóm tắt nghiệp vụ hệ thống theo module/domain. Mỗi module có một mục ngắn gọn mô tả chức năng chính, business rules, inputs/outputs và test cases cơ bản.

---

## Template cho mỗi module

- Tên module: 
- Mục đích: (1-2 dòng)
- Owner: team / person
- Bounded context: (những phần hệ thống liên quan)
- Summary chức năng: (liệt kê chức năng chính, 1 dòng mỗi mục)

### Chi tiết chức năng (mẫu)
- Tên chức năng:
- Mô tả: mục tiêu, business rule quan trọng
- Inputs / Outputs: dữ liệu vào/ra chính
- Success criteria / edge cases
- Security / privacy notes
- Events emitted / commands accepted
- API contract (endpoint, method, payload/response) — nếu cần
- Dependencies (DB tables, external services)
- Test cases cơ bản

- Version / Change log
- Notes / Open questions

---

## Example: Auth

- Tên module: Auth
- Mục đích: Xác thực, ủy quyền, quản lý phiên người dùng.
- Owner: apps/api team
- Bounded context: Users domain, Sessions store, Email service, Token service
- Summary chức năng:
  - Register: tạo tài khoản mới
  - Login: xác thực, trả access + refresh token
  - Refresh token: đổi refresh -> access
  - Logout: hủy session / refresh token
  - Reset password: gửi email + set new password
  - Authorize: kiểm tra quyền (role/permission)

## system modules (catalog)
- `Login` - Đăng nhập, đăng xuất. See [docs/auth/README.md](docs/auth/README.md)
- `User Management` — Quản lý người dùng, role và permission. See [docs/users/README.md](docs/users/README.md)
- `Staff Management` — Quản lý nhân viên: danh sách, ca làm việc, lương. See [docs/staff/README.md](docs/staff/README.md)
- `Product Management` — Quản lý hàng hóa: danh sách, tạo, cập nhật. See [docs/products/README.md](docs/products/README.md)
- `Purchases` — Quản lý nhập hàng: danh sách hàng nhập, tạo phiếu nhập. See [docs/purchases/README.md](docs/purchases/README.md)
- `Orders` — Quản lý đơn hàng: danh sách đơn, đặt hàng, hóa đơn. See [docs/orders/README.md](docs/orders/README.md)
- `Customers` — Quản lý khách hàng: danh sách, thêm khách hàng. See [docs/customers/README.md](docs/customers/README.md)
- `Dashboard` — Báo cáo: doanh thu, top hàng bán chạy, top khách hàng, hoạt động. See [docs/dashboard/README.md](docs/dashboard/README.md)
 - `Reports` — Báo cáo chi tiết: bán hàng, đặt hàng, tồn kho. See [docs/reports/README.md](docs/reports/README.md)
 - `Rentals` — Quản lý cho thuê: danh sách, cho thuê, trạng thái. See [docs/rentals/README.md](docs/rentals/README.md)

---
## Gợi ý tổ chức
- Đặt file ở: `docs/business-catalog.md` (mỗi module là một heading H2)
- Giữ ngắn, link tới mã nguồn (`apps/api/src/modules/...`) khi cần
- Cập nhật khi có thay đổi nghiệp vụ hoặc release lớn

---

Ghi chú: File này chỉ lưu mô tả nghiệp vụ — không chứa secrets, schema đầy đủ hay dữ liệu sản xuất.
