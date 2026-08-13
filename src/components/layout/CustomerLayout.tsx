import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Menu, Search, ShoppingCart, UserRound, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { ChatbotBubble } from '../common/ChatbotBubble';
import { NotificationToast } from '../common/NotificationToast';
import { useOrderNotifications } from '../../hooks/useOrderNotifications';

export const CustomerLayout: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  useOrderNotifications();

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    navigate(`/products${search.trim() ? `?search=${encodeURIComponent(search.trim())}` : ''}`);
  };

  return (
    <div className="min-h-screen bg-[#f7f8fd] text-[#14233d] flex flex-col">
      <header className="sticky top-0 z-50 border-b border-[#e2e7f1] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1240px] items-center gap-4 px-4 sm:px-6">
          <Link to="/" className="shrink-0 text-lg font-extrabold tracking-tight text-[#0752b8]">TechPro</Link>
          <form onSubmit={submitSearch} className="hidden w-full max-w-[280px] md:block">
            <label className="flex h-9 items-center gap-2 rounded-lg border border-[#d9dfeb] bg-[#fafbfe] px-3 text-[#768298] focus-within:border-[#0752b8]">
              <Search size={15} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm kiếm sản phẩm..." className="w-full bg-transparent text-xs outline-none placeholder:text-[#9ba5b5]" />
            </label>
          </form>
          <nav className="ml-auto hidden items-center gap-7 text-xs font-medium text-[#59657a] md:flex">

            <Link to="/products" className="border-b-2 border-[#0752b8] py-5 text-[#0752b8]">Sản phẩm</Link>
            <a href="#sale">Khuyến mãi</a><a href="#news">Tin tức</a><a href="#contact">Liên hệ</a>
          </nav>
          <div className="ml-auto flex items-center gap-3 md:ml-3">
            <Link to="/cart" aria-label="Giỏ hàng" className="text-[#0752b8]"><ShoppingCart size={17} /></Link>
            {user ? (
              <Link
                to="/profile"
                title="Trang cá nhân"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-[#dce8fc] text-[11px] font-bold text-[#0752b8] hover:bg-[#cbe0fc] transition-colors decoration-none"
              >
                {user.email.charAt(0).toUpperCase()}
              </Link>
            ) : (
              <Link to="/login" aria-label="Đăng nhập" className="text-[#0752b8]">
                <UserRound size={17} />
              </Link>
            )}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden"><Menu size={20} /></button>
          </div>
        </div>
        {menuOpen && <div className="border-t border-slate-100 bg-white px-5 py-3 md:hidden"><form onSubmit={submitSearch} className="mb-3 flex rounded border p-2"><Search size={15}/><input className="ml-2 w-full text-sm outline-none" placeholder="Tìm kiếm..." value={search} onChange={e => setSearch(e.target.value)} /><button type="button" onClick={() => setMenuOpen(false)}><X size={16}/></button></form><Link onClick={() => setMenuOpen(false)} to="/products" className="block py-2 text-sm">Sản phẩm</Link></div>}
      </header>
      <main className="flex-1"><Outlet /></main>
      <footer className="mt-10 bg-[#73777d] text-[#edf0f4]">
        <div className="mx-auto grid max-w-[1240px] gap-8 px-5 py-11 text-xs sm:grid-cols-3">
          <div><div className="mb-3 text-base font-extrabold">TechPro</div><p className="max-w-[230px] leading-5 text-[#e0e3e7]">Giải pháp công nghệ tối ưu cho cuộc sống hiện đại của bạn.</p></div>
          <div><div className="mb-3 font-bold">Liên kết</div><div className="space-y-2 text-[#e0e3e7]"><p>Chính sách bảo mật</p><p>Điều khoản sử dụng</p><p>Trung tâm trợ giúp</p><p>Hệ thống cửa hàng</p></div></div>
          <p className="self-end text-right text-[10px] text-[#e0e3e7]">© 2024 TechPro. All rights reserved.</p>
        </div>
      </footer>
      <ChatbotBubble /><NotificationToast />
    </div>
  );
};
