# Refresh Token

Mô tả ngắn: Đổi refresh token lấy access token mới; thực hiện token rotation và revoke nếu cần.

Rules:
- Validate refresh token existence and not revoked
- Issue new access token and new refresh token (rotate)
- Revoke old refresh token after rotation

Inputs: `{ refreshToken }`
Outputs: `{ accessToken, refreshToken, expiresIn }`

Edge cases:
- Reuse of revoked token => possible token theft -> revoke all sessions

Tests: valid refresh, revoked token reuse
