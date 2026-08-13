import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight, ChevronRight, Cpu, Headphones, Laptop, Monitor,
  Mouse, Network, ShoppingCart, Smartphone, Tv
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../../api/client';
import './HomePage.css';

/* ─── types ──────────────────────────────────────────────── */
interface Product {
  id: number;
  name: string;
  basePrice: number;
  brand?: { name: string };
  category?: { name: string };
  variants?: { price: number }[];
}

interface Page<T> {
  content: T[];
}

interface MegaMenuColumn {
  title: string;
  links: { text: string; search: string }[];
}

interface CategoryMenu {
  text: string;
  icon: React.ComponentType<{ size: number }>;
  columns: MegaMenuColumn[];
}

/* ─── helpers ────────────────────────────────────────────── */
const formatMoney = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);

/* ─── mega-menu data ─────────────────────────────────────── */
const CATEGORIES_MENU: CategoryMenu[] = [
  {
    text: 'Laptop',
    icon: Laptop,
    columns: [
      {
        title: 'Thương hiệu',
        links: [
          { text: 'Apple (MacBook)', search: 'MacBook' },
          { text: 'ASUS', search: 'ASUS' },
          { text: 'Dell', search: 'Dell' },
          { text: 'HP', search: 'HP' },
          { text: 'Lenovo', search: 'Lenovo' },
          { text: 'Acer', search: 'Acer' },
          { text: 'MSI', search: 'MSI' },
        ],
      },
      {
        title: 'Phân khúc nhu cầu',
        links: [
          { text: 'Laptop Gaming', search: 'Gaming' },
          { text: 'Laptop Văn phòng', search: 'Văn phòng' },
          { text: 'Laptop Mỏng nhẹ', search: 'Mỏng nhẹ' },
          { text: 'Học sinh - Sinh viên', search: 'Sinh viên' },
          { text: 'Đồ họa - Kỹ thuật', search: 'Đồ họa' },
        ],
      },
      {
        title: 'Bộ xử lý (CPU)',
        links: [
          { text: 'Intel Core i5', search: 'i5' },
          { text: 'Intel Core i7', search: 'i7' },
          { text: 'Intel Core i9', search: 'i9' },
          { text: 'AMD Ryzen 5', search: 'Ryzen 5' },
          { text: 'AMD Ryzen 7', search: 'Ryzen 7' },
          { text: 'Apple M3 Max', search: 'M3 Max' },
        ],
      },
    ],
  },
  {
    text: 'PC Gaming',
    icon: Cpu,
    columns: [
      {
        title: 'Cấu hình tối ưu',
        links: [
          { text: 'PC Gaming TechPro', search: 'PC Gaming' },
          { text: 'PC Streamer', search: 'PC Streamer' },
          { text: 'PC Đồ họa', search: 'PC Đồ họa' },
          { text: 'Mini PC', search: 'Mini PC' },
        ],
      },
      {
        title: 'Tầm giá lựa chọn',
        links: [
          { text: 'Dưới 10 triệu', search: '10 triệu' },
          { text: '10 - 20 triệu', search: '20 triệu' },
          { text: '20 - 40 triệu', search: '40 triệu' },
          { text: 'Trên 40 triệu', search: 'Cao cấp' },
        ],
      },
      {
        title: 'Hệ sinh thái',
        links: [
          { text: 'ASUS ROG Setup', search: 'ROG' },
          { text: 'MSI Gaming Build', search: 'MSI' },
          { text: 'Giga AORUS Build', search: 'AORUS' },
        ],
      },
    ],
  },
  {
    text: 'Main, CPU, VGA',
    icon: Cpu,
    columns: [
      {
        title: 'CPU (Bộ vi xử lý)',
        links: [
          { text: 'Intel Core i5', search: 'i5' },
          { text: 'Intel Core i7', search: 'i7' },
          { text: 'Intel Core i9', search: 'i9' },
          { text: 'AMD Ryzen 5', search: 'Ryzen 5' },
        ],
      },
      {
        title: 'VGA (Card màn hình)',
        links: [
          { text: 'NVIDIA RTX 4060', search: 'RTX 4060' },
          { text: 'NVIDIA RTX 4070', search: 'RTX 4070' },
          { text: 'NVIDIA RTX 4080', search: 'RTX 4080' },
          { text: 'AMD Radeon RX', search: 'Radeon' },
        ],
      },
      {
        title: 'Bo mạch chủ (Main)',
        links: [
          { text: 'Mainboard H610/B760', search: 'Mainboard' },
          { text: 'Mainboard Z790', search: 'Z790' },
          { text: 'Mainboard AMD AM5', search: 'AM5' },
        ],
      },
    ],
  },
  {
    text: 'Linh kiện máy tính',
    icon: Smartphone,
    columns: [
      {
        title: 'Ổ cứng SSD/HDD',
        links: [
          { text: 'SSD NVMe PCIe 4.0', search: 'NVMe' },
          { text: 'SSD SATA III', search: 'SATA' },
          { text: 'HDD lưu trữ 1TB', search: 'HDD 1TB' },
        ],
      },
      {
        title: 'Bộ nhớ RAM',
        links: [
          { text: 'RAM DDR4 8GB', search: 'DDR4 8GB' },
          { text: 'RAM DDR4 16GB', search: 'DDR4 16GB' },
          { text: 'RAM DDR5 16GB', search: 'DDR5 16GB' },
          { text: 'RAM DDR5 32GB', search: 'DDR5 32GB' },
        ],
      },
      {
        title: 'Nguồn & Tản nhiệt',
        links: [
          { text: 'Nguồn 650W Bronze', search: '650W' },
          { text: 'Nguồn 750W Gold', search: '750W' },
          { text: 'Tản nhiệt khí Tower', search: 'Tản nhiệt khí' },
          { text: 'Tản nhiệt nước AIO', search: 'AIO' },
        ],
      },
    ],
  },
  {
    text: 'Màn hình',
    icon: Monitor,
    columns: [
      {
        title: 'Hãng sản xuất',
        links: [
          { text: 'Màn hình Dell', search: 'Dell' },
          { text: 'Màn hình ASUS', search: 'ASUS' },
          { text: 'Màn hình Samsung', search: 'Samsung' },
          { text: 'Màn hình LG', search: 'LG' },
          { text: 'Màn hình AOC', search: 'AOC' },
        ],
      },
      {
        title: 'Tần số quét',
        links: [
          { text: '75Hz văn phòng', search: '75Hz' },
          { text: '144Hz Gaming', search: '144Hz' },
          { text: '165Hz chuẩn thi đấu', search: '165Hz' },
          { text: '240Hz siêu mượt', search: '240Hz' },
        ],
      },
      {
        title: 'Kích thước & Cong',
        links: [
          { text: '24 inch IPS', search: '24 inch' },
          { text: '27 inch IPS 2K', search: '27 inch' },
          { text: 'Màn hình cong', search: 'Cong' },
        ],
      },
    ],
  },
  {
    text: 'Phím, Chuột, Tai nghe',
    icon: Mouse,
    columns: [
      {
        title: 'Bàn phím cơ',
        links: [
          { text: 'Bàn phím Akko', search: 'Akko' },
          { text: 'Bàn phím Corsair', search: 'Corsair' },
          { text: 'Bàn phím Logitech', search: 'Logitech' },
        ],
      },
      {
        title: 'Chuột Gaming',
        links: [
          { text: 'Chuột Logitech G', search: 'Logitech G' },
          { text: 'Chuột Razer', search: 'Razer' },
          { text: 'Chuột Corsair RGB', search: 'Corsair' },
        ],
      },
      {
        title: 'Tai nghe',
        links: [
          { text: 'Tai nghe chụp tai (ANC)', search: 'WH-1000XM5' },
          { text: 'Tai nghe HyperX Cloud', search: 'HyperX' },
          { text: 'Tai nghe Razer Kraken', search: 'Kraken' },
        ],
      },
    ],
  },
  {
    text: 'Gaming Gear',
    icon: Headphones,
    columns: [
      {
        title: 'Ghế & Bàn Gaming',
        links: [
          { text: 'Ghế Gaming Warrior', search: 'Warrior' },
          { text: 'Ghế DXRacer', search: 'DXRacer' },
          { text: 'Bàn nâng hạ thông minh', search: 'Bàn nâng hạ' },
        ],
      },
      {
        title: 'Tay cầm chơi game',
        links: [
          { text: 'Xbox Controller', search: 'Xbox' },
          { text: 'Sony DualSense PS5', search: 'DualSense' },
        ],
      },
      {
        title: 'Streamer Kits',
        links: [
          { text: 'Elgato Capture Card', search: 'Elgato' },
          { text: 'Micro thu âm Podcast', search: 'Micro' },
        ],
      },
    ],
  },
  {
    text: 'Thiết bị Network',
    icon: Network,
    columns: [
      {
        title: 'Bộ phát Wi-Fi',
        links: [
          { text: 'Router TP-Link', search: 'TP-Link' },
          { text: 'Router ASUS ROG Wi-Fi', search: 'ASUS Wi-Fi' },
          { text: 'Hệ thống Wi-Fi Mesh', search: 'Mesh' },
        ],
      },
      {
        title: 'Switch / Hub',
        links: [
          { text: 'Switch 5 cổng', search: 'Switch 5' },
          { text: 'Switch 8 cổng Gigabit', search: 'Switch 8' },
        ],
      },
      {
        title: 'Phụ kiện mạng',
        links: [
          { text: 'Cáp mạng Cat6 UTP', search: 'Cáp Cat6' },
          { text: 'USB Wi-Fi Adapter', search: 'USB Wi-Fi' },
        ],
      },
    ],
  },
];

export const HomePage: React.FC = () => {
  /* ─── queries ─── */
  const { data: featuredData } = useQuery<Page<Product>>({
    queryKey: ['featured-products'],
    queryFn: () => apiClient.get('/api/v1/products', { params: { size: 8, sort: 'id,desc' } }).then((r) => r.data),
  });

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6">
      {/* hero + mega-menu layout */}
      <section className="grid gap-5 lg:grid-cols-[230px_1fr]">
        
        {/* LEFT: Mega-Menu Sidebar */}
        <aside className="mega-menu-aside">
          {CATEGORIES_MENU.map(({ text, icon: Icon, columns }) => (
            <div key={text} className="mega-menu-item-container">
              <Link
                to={`/products?search=${encodeURIComponent(text)}`}
                className="mega-menu-item"
              >
                <Icon size={16} />
                <span>{text}</span>
                <ChevronRight className="ml-auto" size={13} />
              </Link>

              {/* Flyout panel showing details on hover */}
              <div className="mega-menu-panel">
                {columns.map((col) => (
                  <div key={col.title} className="mega-col-group">
                    <h4 className="mega-col-title">{col.title}</h4>
                    <div className="mega-col-links">
                      {col.links.map((link) => (
                        <Link
                          key={link.text}
                          to={`/products?search=${encodeURIComponent(link.search)}`}
                          className="mega-col-link"
                        >
                          {link.text}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </aside>

        {/* RIGHT: Slider Banner */}
        <div>
          <div className="relative min-h-[280px] overflow-hidden rounded-xl bg-gradient-to-br from-[#eff7ff] via-[#e7eef8] to-[#bdcce0] p-7 sm:p-12 text-left">
            <div className="absolute -right-12 -top-14 h-72 w-72 rounded-full border-[35px] border-white/20" />
            <span className="rounded bg-[#0752b8] px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wider">
              Siêu ưu đãi tuần này
            </span>
            <h1 className="mt-4 max-w-xl text-3xl font-extrabold leading-tight text-[#1d2a40] sm:text-4xl">
              Khám Phá Kỷ Nguyên Mới Của <span className="text-[#0752b8]">SmartHome</span>
            </h1>
            <p className="mt-3 max-w-md text-sm leading-5 text-[#536077]">
              Trải nghiệm sức mạnh đột phá với chip xử lý AI thế hệ mới, camera 200MP và khung sườn Titanium siêu nhẹ.
            </p>
            <div className="mt-6 flex gap-3">
              <Link to="/products" className="flex items-center gap-2 rounded-lg bg-[#0752b8] hover:bg-[#0645a0] transition-colors px-6 py-3 text-xs font-bold text-white">
                Mua sắm ngay <ArrowRight size={14} />
              </Link>
              <Link to="/products" className="rounded-lg border border-[#cbd5e1] hover:bg-slate-50 transition-colors bg-white/95 px-6 py-3 text-xs font-bold text-[#334155]">
                Xem chi tiết
              </Link>
            </div>
          </div>

          {/* Sub banner widgets grid */}
          <div className="mt-5 grid gap-3 md:grid-cols-[2fr_1fr] text-left">
            <div className="relative flex h-48 items-end overflow-hidden rounded-xl bg-gradient-to-br from-[#e9eef3] to-[#bec9d4] p-5">
              <Laptop className="absolute right-8 top-6 h-32 w-32 rotate-[-12deg] text-white/55" />
              <div className="z-10 bg-white/90 rounded-lg p-4 border border-slate-200 shadow-sm max-w-xs">
                <h2 className="font-bold text-slate-800 text-sm">Laptop Workstation</h2>
                <p className="text-[11px] text-[#657084] mt-1">Hiệu năng tối đa cho lập trình và đồ họa nặng.</p>
              </div>
            </div>
            
            <div className="grid gap-3">
              <div className="relative flex items-end overflow-hidden rounded-xl bg-[#eaf1f7] p-4 border border-slate-100">
                <Tv className="absolute right-4 top-2 h-20 w-20 text-[#374d63] opacity-35" />
                <span className="z-10 bg-white/95 border rounded px-3 py-1.5 text-xs font-bold text-slate-700">
                  Smartwatches
                </span>
              </div>
              <div className="relative flex items-end overflow-hidden rounded-xl bg-[#e7edf1] p-4 border border-slate-100">
                <Headphones className="absolute right-4 top-2 h-20 w-20 text-[#2f3f53] opacity-35" />
                <span className="z-10 bg-white/95 border rounded px-3 py-1.5 text-xs font-bold text-slate-700">
                  Phụ kiện Premium
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Showcase Section */}
      <section className="mt-12 text-left">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-slate-800">Sản Phẩm Nổi Bật</h2>
          <Link to="/products" className="text-xs font-bold text-[#0752b8] hover:underline">
            Xem tất cả sản phẩm →
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featuredData?.content.map((product, index) => (
            <Link
              key={product.id}
              to={`/products/${product.id}`}
              className="group rounded-xl border border-[#e2e7f0] bg-white p-3 hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="relative flex h-40 items-center justify-center rounded-lg bg-[#f8fafc] text-xs font-bold text-[#6d7a8d] overflow-hidden">
                  <span className="absolute left-2.5 top-2.5 bg-[#e8efff] text-[#0752b8] text-[9px] font-bold px-2 py-0.5 rounded">
                    {index === 0 || index === 4 ? '-15%' : 'Mới'}
                  </span>
                  <span className="text-slate-400 font-extrabold uppercase tracking-wide opacity-50 group-hover:scale-105 transition-transform duration-200">
                    {product.brand?.name || 'TechPro'}
                  </span>
                </div>

                <h3 className="mt-3 text-sm font-bold text-slate-800 leading-snug group-hover:text-[#0752b8] transition-colors">
                  {product.name}
                </h3>
                <p className="mt-1 text-[11px] text-[#768298]">★ 4.8 (128 đánh giá)</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                <strong className="text-base text-[#0752b8]">
                  {formatMoney(product.variants?.[0]?.price ?? product.basePrice)}
                </strong>
                <span className="p-1.5 rounded-lg bg-slate-50 text-slate-500 hover:bg-[#e8efff] hover:text-[#0752b8] transition-colors">
                  <ShoppingCart size={15} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};
