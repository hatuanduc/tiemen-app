'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  createRole,
  createUser,
  listBranches,
  listPermissions,
  listRoles,
  listUsers,
  createBranch,
  updateBranch,
  deleteBranch,
  me,
  type BranchItem,
  type PermissionItem,
  type RoleItem,
  type UserItem,
} from '../lib/api';
import UserBranchRolesPanel from '../features/settings/users/UserBranchRolesPanel';
import { clearToken, getToken } from '../lib/auth';

type User = { id: string; email: string; name: string | null; roles: string[]; permissions: string[] };

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'branches'>('users');
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [newBranchCode, setNewBranchCode] = useState('');
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchAddress, setNewBranchAddress] = useState('');
  const [editingBranch, setEditingBranch] = useState<BranchItem | null>(null);
  const [branchError, setBranchError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRoleIds, setNewUserRoleIds] = useState<string[]>([]);

  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [newRolePermissionIds, setNewRolePermissionIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const mainMenus = ['Tổng quan', 'Hàng hóa', 'Đơn hàng', 'Khách hàng', 'Nhân viên', 'Báo cáo'];
  const setupMenus = [
    'Thông tin cửa hàng',
    'Quản lý chi nhánh',
    'Kết nối API',
    'Cài đặt bảo mật',
  ];
  const canManageUsers = user?.permissions.includes('users:view') ?? false;
  const canCreateUsers = user?.permissions.includes('users:create') ?? false;
  const canManageRoles = user?.permissions.includes('roles:view') ?? false;
  const canCreateRoles = user?.permissions.includes('roles:create') ?? false;
  const permissionByModule = useMemo(() => {
    const map = new Map<string, PermissionItem[]>();
    permissions.forEach((item) => {
      const bucket = map.get(item.module) ?? [];
      bucket.push(item);
      map.set(item.module, bucket);
    });
    return Array.from(map.entries());
  }, [permissions]);

  function logout() {
    clearToken();
    router.replace('/login');
  }

  async function reloadManagementData(keyword = '') {
    const [usersRes, rolesRes, permissionsRes, branchesRes] = await Promise.all([
      canManageUsers ? listUsers(keyword) : Promise.resolve({ items: [] }),
      canManageRoles ? listRoles() : Promise.resolve({ items: [] }),
      canManageRoles ? listPermissions() : Promise.resolve({ items: [] }),
      listBranches(),
    ]);
    setUsers(usersRes.items);
    setRoles(rolesRes.items);
    setPermissions(permissionsRes.items);
    setBranches(branchesRes.items ?? []);
  }

  function toggleInArray(current: string[], value: string) {
    if (current.includes(value)) return current.filter((item) => item !== value);
    return [...current, value];
  }

  async function onCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await createUser({
        email: newUserEmail.trim().toLowerCase(),
        name: newUserName.trim(),
        password: newUserPassword,
        roleIds: newUserRoleIds,
      });
      setNewUserEmail('');
      setNewUserName('');
      setNewUserPassword('');
      setNewUserRoleIds([]);
      await reloadManagementData(search);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tạo người dùng');
    } finally {
      setSaving(false);
    }
  }

  async function onCreateRole(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await createRole({
        name: newRoleName.trim(),
        description: newRoleDescription.trim(),
        permissionIds: newRolePermissionIds,
      });
      setNewRoleName('');
      setNewRoleDescription('');
      setNewRolePermissionIds([]);
      await reloadManagementData(search);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tạo vai trò');
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    async function run() {
      const token = getToken();
      if (!token) {
        router.replace('/login');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await me();
        setUser(result.user);
        const [usersRes, rolesRes, permissionsRes] = await Promise.all([
          result.user.permissions.includes('users:view') ? listUsers('') : Promise.resolve({ items: [] }),
          result.user.permissions.includes('roles:view') ? listRoles() : Promise.resolve({ items: [] }),
          result.user.permissions.includes('roles:view')
            ? listPermissions()
            : Promise.resolve({ items: [] }),
        ]);
        setUsers(usersRes.items);
        setRoles(rolesRes.items);
        setPermissions(permissionsRes.items);
      } catch (err) {
        clearToken();
        setUser(null);
        setError(err instanceof Error ? err.message : 'Unauthorized');
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    }

    run();
  }, [router]);

  return (
    <main className="tiemen-dashboard">
      <header className="tiemen-topbar">
        <div className="tiemen-brand">tiemen</div>
        <nav className="tiemen-mainMenu">
          {mainMenus.map((item, idx) => (
            <button key={item} className={idx === 0 ? 'active' : ''} type="button">
              {item}
            </button>
          ))}
        </nav>
        <div className="tiemen-accountBox">
          <span className="tiemen-accountName">{user?.name ?? 'Tài khoản'}</span>
          <button className="tiemen-buttonSecondary" onClick={logout} type="button">
            Đăng xuất
          </button>
        </div>
      </header>

      <div className="tiemen-workspace">
        <aside className="tiemen-sidebar">
          <h2>Thiết lập</h2>
          <ul>
            {setupMenus.map((item, idx) => (
              <li key={item}>
                <button type="button" className={idx === 0 ? 'active' : ''}>
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="tiemen-content">
          <div className="tiemen-contentHeader">
            <h1>Quản lý người dùng & phân quyền</h1>
            <button
              type="button"
              className="tiemen-buttonSecondary"
              onClick={() => router.push('/login')}
            >
              Đăng nhập tài khoản khác
            </button>
          </div>

          {error ? (
            <div className="tiemen-error" role="alert">
              {error}
            </div>
          ) : null}

          <div className="tiemen-tabBar">
            <button
              type="button"
              className={activeTab === 'users' ? 'active' : ''}
              onClick={() => setActiveTab('users')}
            >
              Tài khoản người dùng
            </button>
            <button
              type="button"
              className={activeTab === 'roles' ? 'active' : ''}
              onClick={() => setActiveTab('roles')}
            >
              Quản lý vai trò
            </button>
            <button
              type="button"
              className={activeTab === 'branches' ? 'active' : ''}
              onClick={() => setActiveTab('branches')}
            >
              Chi nhánh
            </button>
          </div>

          {activeTab === 'users' ? (
            <>
              <article className="tiemen-panel wide">
                <div className="tiemen-row">
                  <h3>Danh sách người dùng</h3>
                  <input
                    className="tiemen-input tiemen-inlineInput"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm theo tên hoặc email"
                  />
                  <button
                    type="button"
                    className="tiemen-buttonSecondary"
                    onClick={() => reloadManagementData(search)}
                  >
                    Lọc
                  </button>
                </div>
                {!canManageUsers ? (
                  <p>Bạn chưa có quyền xem người dùng.</p>
                ) : (
                  <table className="tiemen-table">
                    <thead>
                      <tr>
                        <th>Họ tên</th>
                        <th>Email</th>
                        <th>Vai trò</th>
                        <th>Trạng thái</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((item) => (
                        <>
                          <tr key={item.id}>
                            <td>{item.name ?? '-'}</td>
                            <td>{item.email}</td>
                            <td>{item.roles.map((role) => role.name).join(', ') || 'Chưa gán'}</td>
                            <td>{item.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}</td>
                            <td>
                              <button
                                type="button"
                                className="tiemen-buttonSecondary"
                                style={{ fontSize: 12, padding: '2px 8px' }}
                                onClick={() => setExpandedUserId(expandedUserId === item.id ? null : item.id)}
                              >
                                {expandedUserId === item.id ? 'Ẩn ▲' : 'Chi nhánh ▼'}
                              </button>
                            </td>
                          </tr>
                          {expandedUserId === item.id && (
                            <tr key={`${item.id}-branches`}>
                              <td colSpan={5} style={{ background: '#fafafa', padding: '0 16px 16px' }}>
                                <UserBranchRolesPanel userId={item.id} />
                              </td>
                            </tr>
                          )}
                        </>
                      ))}
                    </tbody>
                  </table>
                )}
              </article>

              <article className="tiemen-panel wide">
                <h3>Tạo tài khoản người dùng</h3>
                {!canCreateUsers ? (
                  <p>Bạn chưa có quyền tạo người dùng.</p>
                ) : (
                  <form className="tiemen-form" onSubmit={onCreateUser}>
                    <div className="tiemen-gridForm">
                      <input
                        className="tiemen-input"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder="Họ tên"
                        required
                      />
                      <input
                        className="tiemen-input"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        placeholder="Email"
                        type="email"
                        required
                      />
                      <input
                        className="tiemen-input"
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                        placeholder="Mật khẩu tạm"
                        type="password"
                        required
                      />
                    </div>
                    <div className="tiemen-checkGrid">
                      {roles.map((role) => (
                        <label key={role.id} className="tiemen-checkItem">
                          <input
                            type="checkbox"
                            checked={newUserRoleIds.includes(role.id)}
                            onChange={() =>
                              setNewUserRoleIds((prev) => toggleInArray(prev, role.id))
                            }
                          />
                          <span>{role.name}</span>
                        </label>
                      ))}
                    </div>
                    <button className="tiemen-buttonSecondary" type="submit" disabled={saving}>
                      {saving ? 'Đang lưu...' : 'Tạo tài khoản'}
                    </button>
                  </form>
                )}
              </article>
            </>
          ) : activeTab === 'branches' ? (
            <>
              <article className="tiemen-panel wide">
                <h3>Danh sách chi nhánh</h3>
                <table className="tiemen-table">
                  <thead>
                    <tr>
                      <th>Mã</th>
                      <th>Tên</th>
                      <th>Địa chỉ</th>
                      <th>Trạng thái</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {branches.map((b) =>
                      editingBranch?.id === b.id ? (
                        <tr key={b.id}>
                          <td style={{ color: '#888' }}>{b.code}</td>
                          <td>
                            <input
                              className="tiemen-input"
                              value={editingBranch.name}
                              onChange={(e) => setEditingBranch({ ...editingBranch, name: e.target.value })}
                            />
                          </td>
                          <td>
                            <input
                              className="tiemen-input"
                              value={editingBranch.address ?? ''}
                              onChange={(e) => setEditingBranch({ ...editingBranch, address: e.target.value })}
                            />
                          </td>
                          <td>
                            <label style={{ display: 'flex', gap: 6, alignItems: 'center', cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={editingBranch.isActive}
                                onChange={(e) => setEditingBranch({ ...editingBranch, isActive: e.target.checked })}
                              />
                              Hoạt động
                            </label>
                          </td>
                          <td style={{ display: 'flex', gap: 6 }}>
                            <button
                              type="button"
                              className="tiemen-buttonSecondary"
                              style={{ fontSize: 12 }}
                              onClick={async () => {
                                await updateBranch(editingBranch.id, {
                                  name: editingBranch.name,
                                  address: editingBranch.address ?? undefined,
                                  isActive: editingBranch.isActive,
                                });
                                setEditingBranch(null);
                                await reloadManagementData();
                              }}
                            >
                              Lưu
                            </button>
                            <button
                              type="button"
                              className="tiemen-buttonSecondary"
                              style={{ fontSize: 12 }}
                              onClick={() => setEditingBranch(null)}
                            >
                              Hủy
                            </button>
                          </td>
                        </tr>
                      ) : (
                        <tr key={b.id}>
                          <td>{b.code}</td>
                          <td>{b.name}</td>
                          <td>{b.address || '-'}</td>
                          <td>{b.isActive ? 'Đang hoạt động' : 'Đã đóng'}</td>
                          <td style={{ display: 'flex', gap: 6 }}>
                            <button
                              type="button"
                              className="tiemen-buttonSecondary"
                              style={{ fontSize: 12 }}
                              onClick={() => setEditingBranch(b)}
                            >tiemen
                              Sửa
                            </button>
                            <button
                              type="button"
                              className="tiemen-buttonSecondary"
                              style={{ fontSize: 12, color: '#c00' }}
                              onClick={async () => {
                                if (!confirm(`Xóa chi nhánh "${b.name}"?`)) return;
                                await deleteBranch(b.id);
                                await reloadManagementData();
                              }}
                            >
                              Xóa
                            </button>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </article>

              <article className="tiemen-panel wide">
                <h3>Thêm chi nhánh mới</h3>
                <form
                  className="tiemen-form"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setBranchError(null);
                    setSaving(true);
                    try {
                      await createBranch({
                        code: newBranchCode.trim().toUpperCase(),
                        name: newBranchName.trim(),
                        address: newBranchAddress.trim() || undefined,
                      });
                      setNewBranchCode('');
                      setNewBranchName('');
                      setNewBranchAddress('');
                      await reloadManagementData();
                    } catch (err) {
                      const msg = err instanceof Error ? err.message : '';
                      setBranchError(
                        msg.includes('BRANCH_CODE_EXISTS')
                          ? `Mã chi nhánh "${newBranchCode.trim().toUpperCase()}" đã tồn tại.`
                          : 'Tạo chi nhánh thất bại. Vui lòng thử lại.',
                      );
                    } finally {
                      setSaving(false);
                    }
                  }}
                >
                  <div className="tiemen-gridForm">
                    <input
                      className="tiemen-input"
                      value={newBranchCode}
                      onChange={(e) => { setNewBranchCode(e.target.value); setBranchError(null); }}
                      placeholder="Mã chi nhánh (vd: HN01)"
                      required
                    />
                    <input
                      className="tiemen-input"
                      value={newBranchName}
                      onChange={(e) => setNewBranchName(e.target.value)}
                      placeholder="Tên chi nhánh"
                      required
                    />
                    <input
                      className="tiemen-input"
                      value={newBranchAddress}
                      onChange={(e) => setNewBranchAddress(e.target.value)}
                      placeholder="Địa chỉ (tùy chọn)"
                    />
                  </div>
                  {branchError && (
                    <p style={{ color: '#c00', fontSize: 13, margin: '4px 0' }}>{branchError}</p>
                  )}
                  <button className="tiemen-buttonSecondary" type="submit" disabled={saving}>
                    {saving ? 'Đang lưu...' : '+ Thêm chi nhánh'}
                  </button>
                </form>
              </article>
            </>
          ) : (
            <>
              <article className="tiemen-panel wide">
                <h3>Danh sách vai trò</h3>
                {!canManageRoles ? (
                  <p>Bạn chưa có quyền xem vai trò.</p>
                ) : (
                  <table className="tiemen-table">
                    <thead>
                      <tr>
                        <th>Vai trò</th>
                        <th>Mô tả</th>
                        <th>Tài khoản</th>
                        <th>Quyền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roles.map((role) => (
                        <tr key={role.id}>
                          <td>{role.name}</td>
                          <td>{role.description || '-'}</td>
                          <td>{role.userCount}</td>
                          <td>{role.permissions.length}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </article>

              <article className="tiemen-panel wide">
                <h3>Tạo vai trò mới</h3>
                {!canCreateRoles ? (
                  <p>Bạn chưa có quyền tạo vai trò.</p>
                ) : (
                  <form className="tiemen-form" onSubmit={onCreateRole}>
                    <div className="tiemen-gridForm">
                      <input
                        className="tiemen-input"
                        value={newRoleName}
                        onChange={(e) => setNewRoleName(e.target.value)}
                        placeholder="Tên vai trò"
                        required
                      />
                      <input
                        className="tiemen-input"
                        value={newRoleDescription}
                        onChange={(e) => setNewRoleDescription(e.target.value)}
                        placeholder="Mô tả"
                      />
                    </div>
                    <div className="tiemen-permissionWrap">
                      {permissionByModule.map(([module, items]) => (
                        <div key={module} className="tiemen-permissionBlock">
                          <strong>{module}</strong>
                          <div className="tiemen-checkGrid">
                            {items.map((permission) => (
                              <label key={permission.id} className="tiemen-checkItem">
                                <input
                                  type="checkbox"
                                  checked={newRolePermissionIds.includes(permission.id)}
                                  onChange={() =>
                                    setNewRolePermissionIds((prev) =>
                                      toggleInArray(prev, permission.id),
                                    )
                                  }
                                />
                                <span>{permission.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="tiemen-buttonSecondary" type="submit" disabled={saving}>
                      {saving ? 'Đang lưu...' : 'Tạo vai trò'}
                    </button>
                  </form>
                )}
              </article>
            </>
          )}

          {loading ? <p className="tiemen-loadingText">Đang tải dữ liệu tài khoản...</p> : null}
        </section>
      </div>
    </main>
  );
}
