import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2, Circle, CreditCard, Loader2, MapPin, XCircle } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../../api/client';
import './OrderDetailPage.css';

/* ─── types ──────────────────────────────────────────────── */
interface ProductVariant {
  id: number;
  productId: number;
  productName: string;
  sku: string;
  attributesJson: string;
  price: number;
}

interface OrderItem {
  id: number;
  productVariant: ProductVariant;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  userId: number;
  status: string; // PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
  totalAmount: number;
  shippingAddress: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

/* ─── helpers ────────────────────────────────────────────── */
const formatMoney = (n: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(n);

const FLOW_STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];
const FLOW_LABELS = ['Đặt hàng thành công', 'Xác nhận đơn hàng', 'Đang giao hàng', 'Hoàn thành'];

const parseAttributes = (attributesJson: string) => {
  try {
    const attrs = JSON.parse(attributesJson);
    return Object.entries(attrs)
      .map(([key, val]) => `${key}: ${val}`)
      .join(' / ');
  } catch {
    return attributesJson;
  }
};

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'orders-badge orders-badge--pending';
    case 'CONFIRMED':
      return 'orders-badge orders-badge--confirmed';
    case 'SHIPPED':
      return 'orders-badge orders-badge--shipped';
    case 'DELIVERED':
      return 'orders-badge orders-badge--delivered';
    case 'CANCELLED':
      return 'orders-badge orders-badge--cancelled';
    default:
      return 'orders-badge';
  }
};

const getStatusLabelText = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'Chờ xác nhận';
    case 'CONFIRMED':
      return 'Đang xử lý';
    case 'SHIPPED':
      return 'Đang giao hàng';
    case 'DELIVERED':
      return 'Đã giao thành công';
    case 'CANCELLED':
      return 'Đã hủy';
    default:
      return status;
  }
};

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  /* ─── queries ─── */
  const { data: order, isLoading } = useQuery<Order>({
    queryKey: ['order', id],
    queryFn: () => apiClient.get(`/api/v1/orders/${id}`).then((r) => r.data),
    enabled: !!id,
  });

  /* ─── mutations ─── */
  const cancelOrderMutation = useMutation({
    mutationFn: () => apiClient.post(`/api/v1/orders/${id}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  if (isLoading) {
    return (
      <div className="odt-container flex justify-center items-center min-h-[500px]">
        <Loader2 className="animate-spin text-[#0752b8] h-10 w-10" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="odt-container text-center py-20">
        <p className="text-slate-500 font-medium">Không tìm thấy đơn hàng này.</p>
        <Link to="/orders" className="mt-4 inline-block bg-[#0752b8] text-white px-4 py-2 rounded-md font-bold text-xs">
          Quay lại danh sách đơn hàng
        </Link>
      </div>
    );
  }

  const currentStepIndex = FLOW_STATUSES.indexOf(order.status);
  const isCancelled = order.status === 'CANCELLED';

  // Can cancel only if PENDING or CONFIRMED
  const canCancel = order.status === 'PENDING' || order.status === 'CONFIRMED';

  return (
    <div className="odt-container">
      {/* back link */}
      <Link to="/orders" className="odt-back-link">
        <ArrowLeft size={14} />
        <span>Quay lại danh sách đơn hàng</span>
      </Link>

      {/* title row */}
      <div className="odt-title-row">
        <div>
          <h1>Chi tiết đơn hàng #TP-{order.id}</h1>
          <p>
            Ngày đặt: {new Date(order.createdAt).toLocaleString('vi-VN', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </p>
        </div>
        <span className={getStatusBadgeClass(order.status)}>
          {getStatusLabelText(order.status)}
        </span>
      </div>

      {/* main grid */}
      <div className="odt-layout">
        {/* left column: timeline & products */}
        <div className="odt-main">
          {/* Timeline status list */}
          {!isCancelled ? (
            <section className="odt-card">
              <h2>Trạng thái vận chuyển</h2>
              <div className="odt-timeline">
                {FLOW_STATUSES.map((stepStatus, idx) => {
                  const isCompleted = idx < currentStepIndex;
                  const isActive = idx === currentStepIndex;

                  let stepClass = '';
                  if (isCompleted) stepClass = 'odt-timeline-step--completed';
                  else if (isActive) stepClass = 'odt-timeline-step--active';

                  return (
                    <div key={stepStatus} className={`odt-timeline-step ${stepClass}`}>
                      <div className="odt-timeline-icon">
                        {isCompleted && <CheckCircle2 size={16} />}
                      </div>
                      <div className="odt-timeline-info">
                        <span className="odt-timeline-title">{FLOW_LABELS[idx]}</span>
                        {isActive && (
                          <span className="odt-timeline-desc">
                            Đơn hàng đang được xử lý hoặc vận chuyển. Vui lòng chờ cập nhật thêm.
                          </span>
                        )}
                        {isCompleted && (
                          <span className="odt-timeline-time">
                            Đã hoàn thành bước này
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : (
            <section className="odt-card flex items-center gap-3" style={{ border: '1px solid #fecaca', background: '#fef2f2' }}>
              <XCircle size={32} className="text-rose-500 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-rose-700 text-sm" style={{ margin: 0 }}>Đơn hàng đã bị hủy</h3>
                <p className="text-xs text-rose-600 mt-1" style={{ margin: 0 }}>
                  Đơn hàng này đã bị hủy bỏ và không thể tiến hành giao nhận.
                </p>
              </div>
            </section>
          )}

          {/* Products List Card */}
          <section className="odt-card">
            <h2>Danh sách sản phẩm</h2>
            <div className="odt-products-list">
              {order.items.map((item) => (
                <div key={item.id} className="odt-product-row">
                  <div className="odt-prod-img">
                    <span className="text-[10px] text-slate-400 font-bold">
                      {item.productVariant.sku.split('-')[0]}
                    </span>
                  </div>

                  <div className="odt-prod-details">
                    <h4 className="odt-prod-name">{item.productVariant.productName}</h4>
                    <p className="odt-prod-attr">
                      SKU: <span className="font-semibold">{item.productVariant.sku}</span> |{' '}
                      {parseAttributes(item.productVariant.attributesJson)}
                    </p>
                    <p className="odt-prod-qty">Số lượng: {item.quantity}</p>
                  </div>

                  <span className="odt-prod-price">{formatMoney(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* right sidebar blocks */}
        <aside className="odt-sidebar">
          {/* Summary Details */}
          <div className="odt-sidebar-card">
            <h3>Tổng quan đơn hàng</h3>
            <div className="odt-summary-rows">
              <div className="odt-summary-row">
                <span>Tạm tính</span>
                <strong>{formatMoney(order.totalAmount)}</strong>
              </div>
              <div className="odt-summary-row">
                <span>Phí vận chuyển</span>
                <span className="text-emerald-600 font-semibold">Miễn phí</span>
              </div>
              <div className="odt-summary-row">
                <span>Giảm giá</span>
                <span>0 đ</span>
              </div>
            </div>

            <div className="odt-summary-row odt-summary-row--total">
              <span>Tổng cộng</span>
              <span className="odt-total-price">{formatMoney(order.totalAmount)}</span>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="odt-sidebar-card">
            <h3>
              <MapPin size={16} />
              Địa chỉ nhận hàng
            </h3>
            <p className="odt-address-text whitespace-pre-line">{order.shippingAddress}</p>
          </div>

          {/* Payment Method */}
          <div className="odt-sidebar-card">
            <h3>
              <CreditCard size={16} />
              Thanh toán
            </h3>
            <p className="odt-payment-text font-bold">Phương thức: Trực tuyến qua ví/thẻ</p>
            <p className="odt-payment-text text-slate-500">
              Trạng thái:{' '}
              <span className={order.status === 'PENDING' ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}>
                {order.status === 'PENDING' ? 'Chờ thanh toán' : 'Đã thanh toán'}
              </span>
            </p>
          </div>

          {/* Cancel Order Action Button */}
          {canCancel && (
            <div>
              <button
                onClick={() => {
                  if (window.confirm('Bạn có thực sự muốn hủy đơn hàng này không?')) {
                    cancelOrderMutation.mutate();
                  }
                }}
                disabled={cancelOrderMutation.isPending}
                className="odt-cancel-btn"
              >
                {cancelOrderMutation.isPending ? 'Đang xử lý...' : 'Hủy đơn hàng'}
              </button>
              <p className="odt-cancel-hint">
                Chỉ có thể tự hủy đơn hàng khi trạng thái đơn hàng là "Chờ xác nhận" hoặc "Đang xử lý".
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
