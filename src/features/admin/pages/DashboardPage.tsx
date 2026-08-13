import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../api/client';
import { Loader2, TrendingUp, Package, ClipboardCheck, Tag, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

interface OrderResponse {
  id: number;
  status: string;
  totalAmount: number;
  createdAt: string;
}

export const DashboardPage: React.FC = () => {
  // Query product count
  const { data: productsPage, isLoading: productsLoading } = useQuery({
    queryKey: ['admin-products-count'],
    queryFn: async () => {
      const response = await apiClient.get('/api/v1/admin/products', { params: { size: 1 } });
      return response.data;
    },
  });

  // Query order count & details
  const { data: ordersPage, isLoading: ordersLoading } = useQuery({
    queryKey: ['admin-orders-count'],
    queryFn: async () => {
      const response = await apiClient.get('/api/v1/admin/orders', { params: { size: 5 } });
      return response.data;
    },
  });

  // Query vouchers
  const { data: vouchers, isLoading: vouchersLoading } = useQuery({
    queryKey: ['admin-vouchers-count'],
    queryFn: async () => {
      const response = await apiClient.get('/api/v1/vouchers');
      return response.data;
    },
  });

  if (productsLoading || ordersLoading || vouchersLoading) {
    return (
      <div className="min-h-[40svh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
        <p className="text-slate-500 font-medium text-sm">Đang tải số liệu thống kê...</p>
      </div>
    );
  }

  const totalProducts = productsPage?.totalElements || 0;
  const totalOrders = ordersPage?.totalElements || 0;
  const totalVouchers = vouchers?.length || 0;
  const recentOrders: OrderResponse[] = ordersPage?.content || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-amber-100 text-amber-800">Chờ thanh toán</span>;
      case 'CONFIRMED':
        return <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-blue-100 text-blue-800 font-bold">Đã xác nhận</span>;
      case 'SHIPPED':
        return <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-indigo-100 text-indigo-800">Đang giao</span>;
      case 'DELIVERED':
        return <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-100 text-emerald-800 font-bold">Đã giao</span>;
      case 'CANCELLED':
        return <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-rose-100 text-rose-800">Đã hủy</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-slate-400 font-medium text-xs uppercase tracking-wider block">Sản phẩm đang bán</span>
            <span className="text-2xl font-extrabold text-slate-800 mt-1 block">{totalProducts}</span>
          </div>
          <div className="h-12 w-12 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <Package className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-slate-400 font-medium text-xs uppercase tracking-wider block">Tổng đơn hàng</span>
            <span className="text-2xl font-extrabold text-slate-800 mt-1 block">{totalOrders}</span>
          </div>
          <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <ClipboardCheck className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-slate-400 font-medium text-xs uppercase tracking-wider block">Số lượng Khuyến mãi</span>
            <span className="text-2xl font-extrabold text-slate-800 mt-1 block">{totalVouchers}</span>
          </div>
          <div className="h-12 w-12 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Tag className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-slate-400 font-medium text-xs uppercase tracking-wider block">Độ tăng trưởng</span>
            <span className="text-2xl font-extrabold text-slate-800 mt-1 block">+12.5%</span>
          </div>
          <div className="h-12 w-12 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">Đơn hàng mới nhận</h3>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors"
          >
            Xem tất cả
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-12 text-slate-500 font-medium text-sm">Chưa có đơn hàng nào trên hệ thống.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-xs text-left">
                <tr>
                  <th className="px-6 py-3">Mã đơn</th>
                  <th className="px-6 py-3">Ngày đặt</th>
                  <th className="px-6 py-3">Tổng tiền</th>
                  <th className="px-6 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-bold text-slate-900">#DH{o.id}</td>
                    <td className="px-6 py-4">{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-semibold text-indigo-600">${o.totalAmount.toLocaleString()}</td>
                    <td className="px-6 py-4">{getStatusBadge(o.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
