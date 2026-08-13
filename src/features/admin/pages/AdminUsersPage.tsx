import React, { useState } from 'react';
import { Users, Search, ToggleLeft, ToggleRight, ShieldAlert, Award, UserCheck } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

interface MockUser {
  id: number;
  email: string;
  role: 'CUSTOMER' | 'MANAGER' | 'ADMIN';
  active: boolean;
  createdAt: string;
}

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<MockUser[]>([
    { id: 1, email: 'admin@techstore.com', role: 'ADMIN', active: true, createdAt: '2026-08-10' },
    { id: 2, email: 'manager@techstore.com', role: 'MANAGER', active: true, createdAt: '2026-08-11' },
    { id: 3, email: 'customer@techstore.com', role: 'CUSTOMER', active: true, createdAt: '2026-08-12' },
    { id: 4, email: 'chitam.customer@outlook.com', role: 'CUSTOMER', active: true, createdAt: '2026-08-13' },
    { id: 5, email: 'le.manager@techstore.com', role: 'MANAGER', active: false, createdAt: '2026-08-13' },
    { id: 6, email: 'guest.account@gmail.com', role: 'CUSTOMER', active: false, createdAt: '2026-08-13' },
  ]);

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as 'internal' | 'system') || 'internal';

  const setActiveTab = (tab: 'internal' | 'system') => {
    setSearchParams({ tab });
  };
  const [searchTerm, setSearchTerm] = useState('');

  const handleToggleStatus = (id: number) => {
    setUsers(users.map(u => u.id === id ? { ...u, active: !u.active } : u));
  };

  const handleRoleChange = (id: number, newRole: 'CUSTOMER' | 'MANAGER' | 'ADMIN') => {
    setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
  };

  // Internal users: ADMIN, MANAGER
  // System users: CUSTOMER
  const filteredUsers = users.filter((u) => {
    const matchesRoleType = activeTab === 'internal' 
      ? (u.role === 'ADMIN' || u.role === 'MANAGER')
      : u.role === 'CUSTOMER';
    const matchesSearch = u.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRoleType && matchesSearch;
  });

  return (
    <div className="space-y-6 text-left text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            {activeTab === 'internal' ? 'Quản lý Account Nội bộ' : 'Quản lý Account Hệ thống'}
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            {activeTab === 'internal' 
              ? 'Danh sách quản trị viên (ADMIN) và quản lý kho (MANAGER) chịu trách nhiệm vận hành.'
              : 'Danh sách khách hàng (CUSTOMER) đã đăng ký tài khoản trên nền tảng TechMart.'}
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-60">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo email..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md text-xs text-slate-800 focus:outline-none"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => { setActiveTab('internal'); setSearchTerm(''); }}
          className={`flex items-center space-x-1.5 px-6 py-3 border-b-2 font-bold text-xs tracking-wider transition-colors cursor-pointer ${
            activeTab === 'internal'
              ? 'border-[#0a52be] text-[#0a52be]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Award className="h-4 w-4" />
          <span>ACCOUNT NỘI BỘ (ADMIN/MANAGER)</span>
        </button>
        <button
          onClick={() => { setActiveTab('system'); setSearchTerm(''); }}
          className={`flex items-center space-x-1.5 px-6 py-3 border-b-2 font-bold text-xs tracking-wider transition-colors cursor-pointer ${
            activeTab === 'system'
              ? 'border-[#0a52be] text-[#0a52be]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <UserCheck className="h-4 w-4" />
          <span>ACCOUNT HỆ THỐNG (CUSTOMER)</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50 text-slate-500 font-semibold text-xs text-left">
            <tr>
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Tài khoản Email</th>
              <th className="px-6 py-3">Vai trò hệ thống</th>
              <th className="px-6 py-3">Ngày gia nhập</th>
              <th className="px-6 py-3">Trạng thái</th>
              <th className="px-6 py-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4 font-bold text-slate-900 font-mono">#U{u.id}</td>
                <td className="px-6 py-4 font-semibold">{u.email}</td>
                <td className="px-6 py-4">
                  {u.role === 'ADMIN' ? (
                    <span className="px-2.5 py-1 text-[10px] font-bold rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      ADMIN
                    </span>
                  ) : (
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as any)}
                      className="px-2 py-1 border border-slate-200 rounded text-[11px] font-semibold bg-white text-slate-750 focus:outline-none cursor-pointer"
                    >
                      <option value="CUSTOMER">CUSTOMER</option>
                      <option value="MANAGER">MANAGER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  )}
                </td>
                <td className="px-6 py-4 text-slate-500 font-mono">{u.createdAt}</td>
                <td className="px-6 py-4">
                  {u.active ? (
                    <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                      Hoạt động
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-800">
                      Đã khóa
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {u.role !== 'ADMIN' && (
                    <button
                      onClick={() => handleToggleStatus(u.id)}
                      className={`flex items-center space-x-1 ml-auto px-2.5 py-1 border rounded text-[10px] font-bold shadow-sm transition-colors cursor-pointer ${
                        u.active
                          ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                          : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                      }`}
                    >
                      {u.active ? (
                        <span>Khóa account</span>
                      ) : (
                        <span>Kích hoạt lại</span>
                      )}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-10 text-slate-400">
                  Không tìm thấy tài khoản nào khớp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
