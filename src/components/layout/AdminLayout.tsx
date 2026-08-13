import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  LayoutDashboard, ShoppingBag, Bookmark, Layers, ClipboardList,
  Ticket, Zap, ArrowLeft, LogOut, HelpCircle, Terminal, Box
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path || (location.pathname + location.search) === path;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-left">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-white text-slate-600 flex flex-col border-r border-slate-200">
        {/* Header Logo section */}
        <div className="p-5 border-b border-slate-100 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-[#0a52be] flex items-center justify-center text-white">
            <Box className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-slate-800 tracking-tight leading-none">
              TechPro Admin
            </h1>
            <span className="text-[10px] text-slate-400 block mt-1 font-semibold uppercase tracking-wider">
              Enterprise Portal
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-grow p-4 space-y-1.5 overflow-y-auto">
          {/* Dashboard */}
          <Link
            to="/admin/dashboard"
            className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
              isActiveRoute('/admin/dashboard')
                ? 'bg-[#0a52be] text-white font-bold'
                : 'hover:bg-slate-50 hover:text-slate-900 text-slate-600'
            }`}
          >
            <LayoutDashboard className="h-4 w-4 shrink-0" />
            <span>Dashboard</span>
          </Link>

          {/* ADMIN specific menu */}
          {user?.role === 'ADMIN' && (
            <>
              {/* Accounts Header */}
              <div className="pt-3 pb-1 px-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Quản lý Account
              </div>

              {/* Internal accounts */}
              <Link
                to="/admin/users?tab=internal"
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                  location.pathname === '/admin/users' && location.search.includes('internal')
                    ? 'bg-[#0a52be] text-white font-bold'
                    : 'hover:bg-slate-50 hover:text-slate-900 text-slate-600'
                }`}
              >
                <Bookmark className="h-4 w-4 shrink-0" />
                <span>Account nội bộ</span>
              </Link>

              {/* System accounts */}
              <Link
                to="/admin/users?tab=system"
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                  location.pathname === '/admin/users' && location.search.includes('system')
                    ? 'bg-[#0a52be] text-white font-bold'
                    : 'hover:bg-slate-50 hover:text-slate-900 text-slate-600'
                }`}
              >
                <Layers className="h-4 w-4 shrink-0" />
                <span>Account hệ thống</span>
              </Link>

              {/* Config Header */}
              <div className="pt-3 pb-1 px-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Hệ thống & AI
              </div>

              {/* AI Config */}
              <Link
                to="/admin/ai-config"
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActiveRoute('/admin/ai-config')
                    ? 'bg-[#0a52be] text-white font-bold'
                    : 'hover:bg-slate-50 hover:text-slate-900 text-slate-600'
                }`}
              >
                <Zap className="h-4 w-4 shrink-0" />
                <span>Cấu hình AI</span>
              </Link>
            </>
          )}

          {/* MANAGER specific menu */}
          {user?.role === 'MANAGER' && (
            <>
              {/* Products Group Header */}
              <div className="pt-2 pb-1 px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Sản phẩm
              </div>

              {/* Products List */}
              <Link
                to="/admin/products"
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActiveRoute('/admin/products')
                    ? 'bg-[#0a52be] text-white font-bold'
                    : 'hover:bg-slate-50 hover:text-slate-900 text-slate-600'
                }`}
              >
                <ShoppingBag className="h-4 w-4 shrink-0" />
                <span>Tất cả sản phẩm</span>
              </Link>

              {/* Brand management */}
              <Link
                to="/admin/brands"
                className={`flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
                  isActiveRoute('/admin/brands')
                    ? 'bg-[#0a52be] text-white font-bold'
                    : 'hover:bg-slate-50 hover:text-slate-900 text-slate-600'
                }`}
              >
                <Bookmark className="h-4 w-4 shrink-0" />
                <span>Thương hiệu</span>
              </Link>

              {/* Category management */}
              <Link
                to="/admin/categories"
                className={`flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
                  isActiveRoute('/admin/categories')
                    ? 'bg-[#0a52be] text-white font-bold'
                    : 'hover:bg-slate-50 hover:text-slate-900 text-slate-600'
                }`}
              >
                <Layers className="h-4 w-4 shrink-0" />
                <span>Loại sản phẩm</span>
              </Link>

              {/* Core Operations Header */}
              <div className="pt-3 pb-1 px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Vận hành
              </div>

              {/* Orders */}
              <Link
                to="/admin/orders"
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActiveRoute('/admin/orders')
                    ? 'bg-[#0a52be] text-white font-bold'
                    : 'hover:bg-slate-50 hover:text-slate-900 text-slate-600'
                }`}
              >
                <ClipboardList className="h-4 w-4 shrink-0" />
                <span>Đơn hàng</span>
              </Link>

              {/* Vouchers */}
              <Link
                to="/admin/promotions?tab=vouchers"
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                  location.pathname === '/admin/promotions' && location.search.includes('vouchers')
                    ? 'bg-[#0a52be] text-white font-bold'
                    : 'hover:bg-slate-50 hover:text-slate-900 text-slate-600'
                }`}
              >
                <Ticket className="h-4 w-4 shrink-0" />
                <span>Vouchers</span>
              </Link>

              {/* Flash Sales */}
              <Link
                to="/admin/promotions?tab=flashsales"
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                  location.pathname === '/admin/promotions' && location.search.includes('flashsales')
                    ? 'bg-[#0a52be] text-white font-bold'
                    : 'hover:bg-slate-50 hover:text-slate-900 text-slate-600'
                }`}
              >
                <Zap className="h-4 w-4 shrink-0" />
                <span>Flash Sales</span>
              </Link>
            </>
          )}
        </nav>

        {/* Bottom controls */}
        <div className="p-4 border-t border-slate-100 space-y-1.5">
          {/* System Log Button */}
          <Link
            to="/admin/dashboard"
            className="flex items-center justify-center space-x-2 w-full py-2 bg-[#e0ecfc] hover:bg-[#d0e4fc] text-[#0a52be] rounded-md text-[11px] font-bold transition-colors"
          >
            <Terminal className="h-3.5 w-3.5" />
            <span>System Log</span>
          </Link>

          {/* Back to Shop */}
          <Link
            to="/products"
            className="flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            <span>Quay lại Shop</span>
          </Link>

          {/* Support */}
          <Link
            to="#"
            className="flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <HelpCircle className="h-4 w-4 shrink-0" />
            <span>Support</span>
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="flex-grow flex flex-col min-h-screen min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">
            {location.pathname.includes('products') ? 'Products' :
             location.pathname.includes('brands') ? 'Brands' :
             location.pathname.includes('categories') ? 'Categories' :
             location.pathname.includes('orders') ? 'Orders' :
             location.pathname.includes('promotions') ? 'Promotions' :
             location.pathname.includes('users') ? 'Users Management' :
             location.pathname.includes('ai-config') ? 'AI Configurations' : 'Hệ thống Quản trị'}
          </h2>
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <span>
              Vai trò: <strong className="text-[#0a52be] font-bold uppercase">{user?.role}</strong>
            </span>
            <span className="text-slate-300">|</span>
            <span>{user?.email}</span>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-8 flex-grow overflow-y-auto min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
