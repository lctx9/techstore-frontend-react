import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { UserRound, Package, Lock, LogOut } from 'lucide-react';

interface CustomerSidebarProps {
  activeTab: 'profile' | 'orders' | 'password';
}

export const CustomerSidebar: React.FC<CustomerSidebarProps> = ({ activeTab }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const emailUser = user?.email ? String(user.email).split('@')[0] : 'Khách hàng';
  const displayLetter = user?.email ? String(user.email).charAt(0).toUpperCase() : 'U';

  return (
    <aside className="prof-sidebar">
      {/* user summary info */}
      <div className="prof-sidebar-user">
        <div className="prof-sidebar-avatar">
          <span>{displayLetter}</span>
        </div>
        <div className="prof-sidebar-info">
          <h3>{emailUser}</h3>
          <p>Thành viên TechPro</p>
        </div>
      </div>

      {/* menu navigation */}
      <nav className="prof-sidebar-nav">
        <Link
          to="/profile"
          className={`prof-sidebar-item ${activeTab === 'profile' ? 'prof-sidebar-item--active' : ''}`}
        >
          <UserRound size={16} />
          <span>Thông tin cá nhân</span>
        </Link>

        <Link
          to="/orders"
          className={`prof-sidebar-item ${activeTab === 'orders' ? 'prof-sidebar-item--active' : ''}`}
        >
          <Package size={16} />
          <span>Đơn hàng của tôi</span>
        </Link>

        <Link
          to="/change-password"
          className={`prof-sidebar-item ${activeTab === 'password' ? 'prof-sidebar-item--active' : ''}`}
        >
          <Lock size={16} />
          <span>Đổi mật khẩu</span>
        </Link>

        <button onClick={handleLogout} className="prof-sidebar-item prof-sidebar-item--logout">
          <LogOut size={16} />
          <span>Đăng xuất</span>
        </button>
      </nav>
    </aside>
  );
};
