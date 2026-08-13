import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [sent, setSent] = useState(false);
  return <div className="auth-page"><div className="auth-card"><div className="text-center"><div className="text-2xl font-extrabold text-[#0752b8]">TechPro</div><h1 className="mt-2 text-lg font-bold">Quên mật khẩu?</h1><p className="mt-1 text-xs text-[#667287]">Nhập email để nhận hướng dẫn đặt lại mật khẩu.</p></div>{sent ? <div className="mt-6 rounded bg-[#edf7f0] p-4 text-center text-sm text-[#28723c]">Đã ghi nhận yêu cầu. Chức năng chờ API đặt lại mật khẩu từ BE.</div> : <form onSubmit={e => { e.preventDefault(); setSent(true); }} className="mt-6 space-y-4"><label className="form-label">Email<div className="input-wrap"><Mail size={16}/><input required type="email" placeholder="nguyenvana@example.com"/></div></label><button className="auth-button">Gửi yêu cầu</button></form>}<Link to="/login" className="mt-5 block text-center text-xs font-semibold text-[#0752b8]">← Quay lại đăng nhập</Link></div></div>;
};
