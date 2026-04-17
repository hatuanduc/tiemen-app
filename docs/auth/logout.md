# Logout

Mô tả: Hủy session hoặc revoke refresh token của client.

Actions:
- Mark session as ended
- Revoke refresh token(s)
- Emit `user.logged_out`

Inputs: `{ sessionId | refreshToken | userId + clientId }`
Outputs: `{ success: true }`

Tests: logout success, logout invalid session
