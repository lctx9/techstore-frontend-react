import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../api/client';
import { Loader2, Calendar, MapPin, ChevronDown, ChevronUp, RefreshCw, Edit, ClipboardList } from 'lucide-react';

interface ProductVariantResponse {
  id: number;
  productId: number;
  productName: string;
  sku: string;
  attributesJson: string;
  price: number;
}

interface OrderItemResponse {
  id: number;
  productVariant: ProductVariantResponse;
  quantity: number;
  price: number;
}

interface OrderResponse {
  id: number;
  userId: number;
  status: string; // PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
  totalAmount: number;
  shippingAddress: string;
  items: OrderItemResponse[];
  createdAt: string;
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
}

export const AdminOrdersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  // 1. Fetch System Orders
  const { data, isLoading, error, refetch, isRefetching } = useQuery<PageResponse<OrderResponse>>({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const response = await apiClient.get('/api/v1/admin/orders');
      return response.data;
    },
  });

  // 2. Update Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      return apiClient.put(`/api/v1/admin/orders/${orderId}/status`, null, {
        params: { status }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
  });

  const handleStatusChange = (orderId: number, status: string) => {
    updateStatusMutation.mutate({ orderId, status });
  };

  const toggleExpand = (orderId: number) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const parseAttributes = (attributesJson: string) => {
    try {
      const attrs = JSON.parse(attributesJson);
      return Object.entries(attrs)
        .map(([key, val]) => `${key}: ${val}`)
        .join(', ');
    } catch {
      return attributesJson;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50svh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
        <p className="text-slate-500 font-medium text-sm">Đang tải danh sách đơn hàng toàn hệ thống...</p>
      </div>
    );
  }

  const orders = data?.content || [];

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-bold text-slate-800">Quản lý Đơn hàng</h2>
        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="flex items-center space-x-1.5 px-3 py-1.5 border border-slate-300 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
          <span>Làm mới danh sách</span>
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-xl shadow-sm">
          <ClipboardList className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Chưa có đơn hàng nào phát sinh trên hệ thống.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            return (
              <div
                key={order.id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow transition-shadow"
              >
                {/* Summary Row */}
                <div
                  onClick={() => toggleExpand(order.id)}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50"
                >
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Mã đơn hàng</span>
                      <h4 className="text-sm font-extrabold text-slate-900">#DH{order.id}</h4>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Mã User đặt</span>
                      <p className="text-xs text-slate-700 font-semibold">User ID: #{order.userId}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Ngày đặt hàng</span>
                      <p className="text-xs text-slate-600 font-semibold flex items-center space-x-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Tổng thanh toán</span>
                      <p className="text-sm font-extrabold text-indigo-650">${order.totalAmount.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      disabled={updateStatusMutation.isPending}
                      className="px-2.5 py-1 border border-slate-300 rounded text-xs text-slate-700 bg-white font-semibold focus:outline-none"
                    >
                      <option value="PENDING">Chờ thanh toán</option>
                      <option value="CONFIRMED">Đã xác nhận</option>
                      <option value="SHIPPED">Đang giao hàng</option>
                      <option value="DELIVERED">Đã giao thành công</option>
                      <option value="CANCELLED">Đã hủy</option>
                    </select>

                    <button
                      onClick={() => toggleExpand(order.id)}
                      className="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Detail section */}
                {isExpanded && (
                  <div className="bg-slate-50/50 border-t border-slate-100 p-6 space-y-6">
                    {/* Address */}
                    <div className="text-xs text-slate-650 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>Địa chỉ giao hàng</span>
                      </span>
                      <p className="font-semibold text-slate-800">{order.shippingAddress}</p>
                    </div>

                    {/* Order items list */}
                    <div className="space-y-3">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block border-b border-slate-100 pb-1">
                        Danh sách sản phẩm ({order.items?.length || 0})
                      </span>
                      <div className="divide-y divide-slate-100">
                        {order.items?.map((item) => {
                          const variant = item.productVariant;
                          return (
                            <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                              <div>
                                <p className="font-bold text-slate-800">
                                  {variant.productName || 'Sản phẩm TechMart'}
                                </p>
                                <p className="text-[10px] text-slate-500 mt-0.5">
                                  SKU: <span className="font-semibold">{variant.sku}</span> |{' '}
                                  {parseAttributes(variant.attributesJson)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-slate-700">x{item.quantity}</p>
                                <p className="font-extrabold text-slate-900">${(item.price * item.quantity).toLocaleString()}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
