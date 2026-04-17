# Reset Password

Mô tả: Quy trình gửi mã/ token qua email để cho phép đặt lại mật khẩu.

Steps:
- Request: generate reset token, store short-lived token, send email
- Confirm: verify token, set new password (hash), revoke sessions if required

Inputs: request `{ email }`; confirm `{ token, newPassword }`
Outputs: success flags

Security:
- Token expiry short (e.g., 1h)
- Rate limit requests per email

Tests: request then confirm, expired token, invalid token
