# Login

Mô tả ngắn: Xác thực người dùng bằng `email` và `password`, tạo session và trả `accessToken` + `refreshToken`.

Business rules (tóm tắt):
- Tối đa 5 lần nhập sai trong 15 phút => khóa tạm thời
- Nếu user.inactive => từ chối
- Cho phép nhiều session đồng thời (device khác nhau)

Inputs:
- `email: string`, `password: string`, `clientInfo?: { ip, userAgent }`

Outputs:
- `{ accessToken, refreshToken, expiresIn }`

Side effects / events:
- Tạo session record
- Emit `user.logged_in` hoặc `user.login_failed`

Security:
- Hash password bằng bcrypt/argon2
- Rotate refresh tokens trên mỗi refresh

Test cases cơ bản:
- success login
- wrong password
- lockout after N attempts
- token rotation
