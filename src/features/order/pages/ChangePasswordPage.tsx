import React, { useState } from 'react';
import { CustomerSidebar } from '../components/CustomerSidebar';
import './CustomerProfile.css';

export const ChangePasswordPage: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setErrorMsg('Mật khẩu mới và xác nhận mật khẩu không khớp.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    setErrorMsg('');
    setIsSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');

    setTimeout(() => setIsSuccess(false), 4000);
  };

  return (
    <div className="prof-container">
      {/* breadcrumb */}
      <nav className="pdp-breadcrumb">
        <span>Trang chủ</span>
        <span>&gt;</span>
        <span>Đổi mật khẩu</span>
      </nav>

      <div className="prof-layout">
        {/* left sidebar */}
        <CustomerSidebar activeTab="password" />

        {/* main profile form card */}
        <section className="prof-content-card">
          <div className="prof-content-header">
            <h2>Đổi Mật Khẩu</h2>
            <p>Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác</p>
          </div>

          {isSuccess && (
            <div className="prof-success-msg">
              ✓ Đổi mật khẩu thành công!
            </div>
          )}

          {errorMsg && (
            <div className="chk-error-banner" style={{ marginBottom: '1rem' }}>
              <span>{errorMsg}</span>
            </div>
          )}

          <div style={{ maxWidth: '480px' }}>
            <form onSubmit={handlePasswordChange} className="prof-form">
              <div className="prof-form-field">
                <label className="prof-form-label">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="prof-form-input"
                  required
                />
              </div>

              <div className="prof-form-field">
                <label className="prof-form-label">Mật khẩu mới</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="prof-form-input"
                  required
                />
              </div>

              <div className="prof-form-field">
                <label className="prof-form-label">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="prof-form-input"
                  required
                />
              </div>

              <button type="submit" className="prof-submit-btn">
                Xác nhận đổi mật khẩu
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};
