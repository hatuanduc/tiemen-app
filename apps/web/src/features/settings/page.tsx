"use client";
import React, { useState } from 'react';
import SettingsLayout from '../../components/SettingsLayout';
import UsersPage from './users/UsersPage';
import RolesPage from './roles/RolesPage';
import BranchesPage from './branches/BranchesPage';

export default function SettingsRoot() {
  const [tab, setTab] = useState<'users' | 'roles' | 'branches'>('users');

  return (
    <SettingsLayout>
      <h2 style={{ marginTop: 0 }}>Cài đặt</h2>

      <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid #eee', marginBottom: 12 }}>
        <button onClick={() => setTab('users')} style={{ padding: '8px 12px', border: 'none', borderBottom: tab === 'users' ? '2px solid #4f46e5' : '2px solid transparent', background: 'transparent', cursor: 'pointer' }}>
          Tài khoản người dùng
        </button>
        <button onClick={() => setTab('roles')} style={{ padding: '8px 12px', border: 'none', borderBottom: tab === 'roles' ? '2px solid #4f46e5' : '2px solid transparent', background: 'transparent', cursor: 'pointer' }}>
          Quản lý vai trò
        </button>
        <button onClick={() => setTab('branches')} style={{ padding: '8px 12px', border: 'none', borderBottom: tab === 'branches' ? '2px solid #4f46e5' : '2px solid transparent', background: 'transparent', cursor: 'pointer' }}>
          Chi nhánh
        </button>
      </div>

      {tab === 'users' ? <UsersPage /> : tab === 'roles' ? <RolesPage /> : <BranchesPage />}
    </SettingsLayout>
  );
}
