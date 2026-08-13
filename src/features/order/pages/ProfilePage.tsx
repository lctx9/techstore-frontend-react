import React, { useState, useEffect } from 'react';
import { CustomerSidebar } from '../components/CustomerSidebar';
import { useAuthStore } from '../../../store/authStore';
import './CustomerProfile.css';

export const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();

  // Load fields from localstorage or use defaults
  const [fullName, setFullName] = useState(() => localStorage.getItem('prof_name') || 'Nguyễn Văn A');
  const [phone, setPhone] = useState(() => localStorage.getItem('prof_phone') || '0987654321');
  const [birthDay, setBirthDay] = useState(() => localStorage.getItem('prof_bday') || '15');
  const [birthMonth, setBirthMonth] = useState(() => localStorage.getItem('prof_bmonth') || 'Tháng 8');
  const [birthYear, setBirthYear] = useState(() => localStorage.getItem('prof_byear') || '1990');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('prof_name', fullName);
    localStorage.setItem('prof_phone', phone);
    localStorage.setItem('prof_bday', birthDay);
    localStorage.setItem('prof_bmonth', birthMonth);
    localStorage.setItem('prof_byear', birthYear);

    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  const emailDisplay = user?.email ? String(user.email) : 'nguyenvana@example.com';
  const displayLetter = user?.email ? String(user.email).charAt(0).toUpperCase() : 'U';

  return (
    <div className="prof-container">
      {/* breadcrumb */}
      <nav className="pdp-breadcrumb">
        <span>Trang chủ</span>
        <span>&gt;</span>
        <span>Tài khoản của tôi</span>
      </nav>

      <div className="prof-layout">
        {/* left sidebar */}
        <CustomerSidebar activeTab="profile" />

        {/* main profile form card */}
        <section className="prof-content-card">
          <div className="prof-content-header">
            <h2>Hồ Sơ Của Tôi</h2>
            <p>Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
          </div>

          {isSuccess && (
            <div className="prof-success-msg">
              ✓ Cập nhật thông tin hồ sơ thành công!
            </div>
          )}

          <div className="prof-grid-wrapper">
            {/* left column: form inputs */}
            <form onSubmit={handleSave} className="prof-form">
              <div className="prof-form-field">
                <label className="prof-form-label">Họ và tên</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="prof-form-input"
                  required
                />
              </div>

              <div className="prof-form-field">
                <label className="prof-form-label">Email</label>
                <input
                  type="email"
                  value={emailDisplay}
                  className="prof-form-input"
                  disabled
                />
              </div>

              <div className="prof-form-field">
                <label className="prof-form-label">Số điện thoại</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="prof-form-input"
                  required
                />
              </div>

              <div className="prof-form-field">
                <label className="prof-form-label">Ngày sinh</label>
                <div className="prof-date-selects">
                  {/* Day select */}
                  <select
                    value={birthDay}
                    onChange={(e) => setBirthDay(e.target.value)}
                    className="prof-date-select"
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>

                  {/* Month select */}
                  <select
                    value={birthMonth}
                    onChange={(e) => setBirthMonth(e.target.value)}
                    className="prof-date-select"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={`Tháng ${m}`}>
                        Tháng {m}
                      </option>
                    ))}
                  </select>

                  {/* Year select */}
                  <select
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value)}
                    className="prof-date-select"
                  >
                    {Array.from({ length: 80 }, (_, i) => 2024 - i).map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button type="submit" className="prof-submit-btn">
                Lưu Thay Đổi
              </button>
            </form>

            {/* right column: avatar view */}
            <div className="prof-avatar-upload">
              <div className="prof-avatar-circle">
                <span>{displayLetter}</span>
              </div>
              <button type="button" className="prof-avatar-btn">
                Chọn Ảnh
              </button>
              <p className="prof-avatar-desc">
                Dung lượng file tối đa 1 MB<br />
                Định dạng: .JPEG, .PNG
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
