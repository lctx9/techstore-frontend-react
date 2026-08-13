import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Loader2, Lock, Mail, ShieldAlert } from 'lucide-react';
import { apiClient } from '../../../api/client';
import { useAuthStore } from '../../../store/authStore';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/';

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true); setError(null);
    try {
      const { data } = await apiClient.post('/api/v1/auth/login', { email, password });
      login(data.token, { id: data.userId, email: data.email, role: data.role, active: true });
      navigate(data.role === 'ADMIN' || data.role === 'MANAGER' ? '/admin/dashboard' : from, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.title || 'Email hoặc mật khẩu chưa chính xác. Vui lòng thử lại.');
    } finally { setLoading(false); }
  };

  return <div className="auth-page">
    <div className="auth-card">
      <div className="text-center">
        <div className="text-2xl font-extrabold tracking-tight text-[#0752b8]">TechPro</div>
        <h1 className="mt-2 text-lg font-bold text-[#15243c]">Đăng nhập</h1>
        <p className="mt-1 text-xs text-[#667287]">Chào mừng bạn quay trở lại!</p>
      </div>
      {error && <div className="mt-5 flex gap-2 border border-[#f2c8cf] bg-[#fff4f5] p-3 text-xs text-[#a12c3a]"><ShieldAlert size={16} className="shrink-0"/>{error}</div>}
      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="form-label">Email
          <div className="input-wrap"><Mail size={16}/><input required type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="nguyenvana@example.com"/></div>
        </label>
        <label className="form-label">Mật khẩu
          <div className="input-wrap"><Lock size={16}/><input required type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} placeholder="••••••••"/></div>
        </label>
        <div className="flex items-center justify-between text-[11px]">
          <label className="flex cursor-pointer items-center gap-2 text-[#657084]"><input type="checkbox" checked={remember} onChange={event => setRemember(event.target.checked)} className="accent-[#0752b8]"/>Ghi nhớ đăng nhập</label>
          <Link to="/forgot-password" className="font-semibold text-[#0752b8] hover:underline">Quên mật khẩu?</Link>
        </div>
        <button disabled={loading} className="auth-button">{loading && <Loader2 size={15} className="mr-2 animate-spin"/>}{loading ? 'Đang đăng nhập...' : 'Đăng nhập →'}</button>
      </form>
      <p className="mt-5 text-center text-[11px] text-[#657084]">Chưa có tài khoản? <Link to="/register" className="font-bold text-[#0752b8] hover:underline">Đăng ký ngay</Link></p>
    </div>
  </div>;
};
