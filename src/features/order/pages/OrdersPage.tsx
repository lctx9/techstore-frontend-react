import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../../api/client';
import { CustomerSidebar } from '../components/CustomerSidebar';
import './CustomerProfile.css';

/* ─── types ──────────────────────────────────────────────── */
interface OrderItem {
  id: number;
  quantity: number;
  productVariant: {
    productName: string;
  };
}

interface Order {
  id: number;
  status: string; // PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}

interface Page {
  content: Order[];
  totalPages: number;
}

/* ─── helpers ────────────────────────────────────────────── */
const formatMoney = (n: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(n);

const TABS = [
  ['ALL', 'Tất cả'],
  ['PENDING', 'Chờ xác nhận'],
  ['CONFIRMED', 'Đang xử lý'],
  ['SHIPPED', 'Đang giao'],
  ['DELIVERED', 'Đã giao'],
  ['CANCELLED', 'Đã hủy'],
];

const renderStatusBadge = (status: string) => {
  switch (status) {
    case 'PENDING':
      return <span className="orders-badge orders-badge--pending">Chờ xác nhận</span>;
    case 'CONFIRMED':
      return <span className="orders-badge orders-badge--confirmed">Đang xử lý</span>;
    case 'SHIPPED':
      return <span className="orders-badge orders-badge--shipped">Đang giao</span>;
    case 'DELIVERED':
      return <span className="orders-badge orders-badge--delivered">Đã giao</span>;
    case 'CANCELLED':
      return <span className="orders-badge orders-badge--cancelled">Đã hủy</span>;
    default:
      return <span className="orders-badge">{status}</span>;
  }
};

export const OrdersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  /* ─── queries ─── */
  const { data: pageData, isLoading } = useQuery<Page>({
    queryKey: ['orders'],
    queryFn: () => apiClient.get('/api/v1/orders', { params: { size: 50 } }).then((r) => r.data),
  });

  const orders = useMemo(() => {
    const list = pageData?.content ?? [];
    return list.filter((order) => {
      const matchesTab = activeTab === 'ALL' || order.status === activeTab;
      const firstItemName = order.items[0]?.productVariant.productName || '';
      const matchesSearch =
        `#TP-${order.id}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        firstItemName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [pageData, activeTab, searchQuery]);

  if (isLoading) {
    return (
      <div className="prof-container flex justify-center items-center min-h-[500px]">
        <Loader2 className="animate-spin text-[#0752b8] h-10 w-10" />
      </div>
    );
  }

  const allCount = pageData?.content.length ?? 0;

  return (
    <div className="prof-container">
      {/* breadcrumb */}
      <nav className="pdp-breadcrumb">
        <span>Trang chủ</span>
        <span>&gt;</span>
        <span>Lịch sử đơn hàng</span>
      </nav>

      <div className="prof-layout">
        {/* left sidebar */}
        <CustomerSidebar activeTab="orders" />

        {/* right order list panel */}
        <section className="prof-content-card">
          <div className="prof-content-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2>Lịch sử đơn hàng</h2>
              <p>Theo dõi và quản lý các đơn hàng đã đặt của bạn</p>
            </div>

            {/* search box */}
            <div className="orders-search-wrapper">
              <Search size={14} className="text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm mã đơn hàng..."
              />
            </div>
          </div>

          {/* status tabs scrollbar */}
          <div className="orders-tabs-scroll">
            {TABS.map(([key, label]) => {
              const tabCount =
                key === 'ALL'
                  ? allCount
                  : pageData?.content.filter((x) => x.status === key).length ?? 0;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`orders-tab-btn ${activeTab === key ? 'orders-tab-btn--active' : ''}`}
                >
                  {label} ({tabCount})
                </button>
              );
            })}
          </div>

          {/* orders grid table */}
          {orders.length > 0 ? (
            <div className="orders-table-card overflow-x-auto">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Mã đơn hàng</th>
                    <th>Ngày đặt</th>
                    <th>Sản phẩm (chính)</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const extraItemsCount = Math.max(0, order.items.length - 1);
                    return (
                      <tr key={order.id}>
                        <td>
                          <Link to={`/orders/${order.id}`} className="orders-table-id-link">
                            #TP-{order.id}
                          </Link>
                        </td>
                        <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                        <td>
                          <div className="orders-table-item-cell">
                            <div className="orders-table-item-img">
                              <span className="text-[10px] text-slate-400 font-bold">SP</span>
                            </div>
                            <div>
                              <p className="font-bold text-slate-800" style={{ margin: 0 }}>
                                {order.items[0]?.productVariant.productName || 'Sản phẩm TechMart'}
                              </p>
                              {extraItemsCount > 0 && (
                                <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                                  + {extraItemsCount} sản phẩm khác
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="font-bold text-slate-800">{formatMoney(order.totalAmount)}</td>
                        <td>{renderStatusBadge(order.status)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="pdp-reviews__empty" style={{ padding: '4rem 1rem' }}>
              Chưa có đơn hàng nào phù hợp với bộ lọc.
            </p>
          )}
        </section>
      </div>
    </div>
  );
};
