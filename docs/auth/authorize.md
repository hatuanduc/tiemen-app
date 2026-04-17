# Authorize

Mô tả: Kiểm tra role/permission cho các actions; có thể cung cấp helper `checkPermission(user, action, resource)`.

Approach:
- Maintain roles & permissions mapping
- Support per-resource permission checks (ownership)
- Support policy-based checks for complex rules

Inputs: `{ userId, action, resource? }`
Outputs: `{ allowed: boolean, reason?: string }`

Tests: admin allowed, owner allowed, non-owner denied
