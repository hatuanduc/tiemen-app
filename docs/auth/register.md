# Register

Mô tả ngắn: Tạo tài khoản mới, xác thực dữ liệu và khởi tạo profile.

Steps:
- Validate input (email format, password strength)
- Check duplicate email
- Hash password & create user record
- Optionally send verification email / emit `user.registered`

Inputs: `{ email, password, displayName?, meta? }`
Outputs: `{ userId, createdAt }`

Business rules:
- Email phải unique
- Password policy enforced

Tests:
- create user success
- duplicate email
- invalid password
