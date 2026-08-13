import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle, Building2, CheckCircle2, ChevronDown, CreditCard,
  Loader2, Lock, MapPin, Smartphone, Truck
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../../../api/client';
import './CheckoutPage.css';

/* ─── types ──────────────────────────────────────────────── */
interface ProductVariant {
  id: number;
  productId: number;
  productName: string;
  sku: string;
  price: number;
  attributesJson: string;
}

interface CartItem {
  id: number;
  quantity: number;
  subTotal: number;
  productVariant: ProductVariant;
}

interface CartResponse {
  items: CartItem[];
  totalAmount: number;
}

/* ─── helpers ────────────────────────────────────────────── */
const formatMoney = (n: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(n);

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

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  /* ─── state variables ─── */
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [paymentProvider, setPaymentProvider] = useState('VNPAY_MOCK');
  const [couponCode, setCouponCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  /* ─── queries ─── */
  const { data: cart, isLoading } = useQuery<CartResponse>({
    queryKey: ['cart'],
    queryFn: () => apiClient.get('/api/v1/carts').then((r) => r.data),
  });

  /* ─── mutations ─── */
  const applyVoucherMutation = useMutation({
    mutationFn: () =>
      apiClient.post('/api/v1/vouchers/apply', null, {
        params: { code: couponCode, orderAmount: cart?.totalAmount },
      }),
  });

  const placeOrderMutation = useMutation({
    mutationFn: async () => {
      if (!name.trim() || !phone.trim() || !email.trim() || !street.trim() || !city) {
        throw new Error('Vui lòng điền đầy đủ thông tin giao hàng.');
      }
      setErrorMsg('');

      const shippingAddress = `${name} | ${phone} | ${email}\n${street}, ${district}, ${city}`;
      const orderResponse = await apiClient.post('/api/v1/orders', { shippingAddress });
      
      const paymentResponse = await apiClient.post('/api/v1/payments/create', null, {
        params: { orderId: orderResponse.data.id, provider: paymentProvider },
      });

      return paymentResponse.data;
    },
    onSuccess: (paymentUrl) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      // Redirect to payment gateway URL or mock payment handler path
      window.location.href = `${apiClient.defaults.baseURL}${paymentUrl}`;
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || err.message || 'Không thể tạo đơn hàng.');
    },
  });

  /* ─── triggers ─── */
  const handlePlaceOrder = () => {
    placeOrderMutation.mutate();
  };

  /* ─── loaders & empty ─── */
  if (isLoading) {
    return (
      <div className="chk-container flex justify-center items-center min-h-[500px]">
        <Loader2 className="animate-spin text-[#0752b8] h-10 w-10" />
      </div>
    );
  }

  const items = cart?.items ?? [];

  if (items.length === 0) {
    return (
      <div className="chk-container flex flex-col justify-center items-center min-h-[400px]">
        <p className="text-slate-500 font-medium text-sm">Không có sản phẩm nào để thanh toán.</p>
        <Link to="/products" className="mt-4 bg-[#0752b8] text-white px-5 py-2.5 rounded-md font-bold text-xs">
          Quay lại mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="chk-container">
      {/* header */}
      <header className="chk-header">
        <h1>TechPro</h1>
        <span className="chk-header-badge">
          <Lock size={15} className="text-slate-400" />
          Thanh toán an toàn
        </span>
      </header>

      {/* error banner */}
      {errorMsg && (
        <div className="chk-error-banner">
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="chk-layout">
        {/* left billing fields */}
        <div className="chk-main">
          {/* Billing Info Card */}
          <section className="chk-card">
            <h2 className="chk-card-title">
              <Truck size={22} />
              Thông tin giao hàng
            </h2>

            <div className="chk-fields-grid">
              <div className="chk-field-wrapper chk-field-wrapper--wide">
                <label className="chk-label">Họ và tên</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="chk-input"
                  placeholder="Nhập họ và tên người nhận"
                  required
                />
              </div>

              <div className="chk-field-wrapper">
                <label className="chk-label">Số điện thoại</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="chk-input"
                  placeholder="Ví dụ: 0912 345 678"
                  required
                />
              </div>

              <div className="chk-field-wrapper">
                <label className="chk-label">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="chk-input"
                  placeholder="email@example.com"
                  required
                />
              </div>

              <div className="chk-field-wrapper chk-field-wrapper--wide">
                <label className="chk-label">Địa chỉ giao hàng</label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="chk-input"
                  placeholder="Số nhà, tên đường, phường/xã..."
                  required
                />
              </div>

              <div className="chk-field-wrapper">
                <label className="chk-label">Tỉnh/Thành phố</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="chk-select"
                  required
                >
                  <option value="">Chọn Tỉnh/Thành phố</option>
                  <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="Đà Nẵng">Đà Nẵng</option>
                </select>
              </div>

              <div className="chk-field-wrapper">
                <label className="chk-label">Quận/Huyện</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="chk-input"
                  placeholder="Chọn Quận/Huyện"
                  required
                />
              </div>
            </div>
          </section>

          {/* Payment Methods Card */}
          <section className="chk-card">
            <h2 className="chk-card-title">
              <CreditCard size={22} />
              Phương thức thanh toán
            </h2>

            <div className="chk-payment-list">
              {/* Option 1: VNPAY */}
              <div
                onClick={() => setPaymentProvider('VNPAY_MOCK')}
                className={`chk-payment-option ${
                  paymentProvider === 'VNPAY_MOCK' ? 'chk-payment-option--selected' : ''
                }`}
              >
                <input
                  type="radio"
                  checked={paymentProvider === 'VNPAY_MOCK'}
                  readOnly
                  className="chk-payment-radio"
                />
                <div className="chk-payment-info">
                  <span className="chk-payment-title">Thẻ tín dụng / Ghi nợ</span>
                  <span className="chk-payment-desc">Thanh toán an toàn qua cổng VNPay.</span>
                </div>
              </div>

              {/* Option 2: Bank Transfer */}
              <div
                onClick={() => setPaymentProvider('BANK_TRANSFER')}
                className={`chk-payment-option ${
                  paymentProvider === 'BANK_TRANSFER' ? 'chk-payment-option--selected' : ''
                }`}
              >
                <input
                  type="radio"
                  checked={paymentProvider === 'BANK_TRANSFER'}
                  readOnly
                  className="chk-payment-radio"
                />
                <div className="chk-payment-info">
                  <span className="chk-payment-title">Chuyển khoản ngân hàng</span>
                  <span className="chk-payment-desc">Chuyển tiền trực tiếp vào tài khoản công ty.</span>
                </div>
              </div>

              {/* Hint instructions box for Bank Transfer */}
              {paymentProvider === 'BANK_TRANSFER' && (
                <div className="chk-payment-hint">
                  Quý khách sẽ nhận được thông tin tài khoản ngân hàng ngay sau khi đặt hàng thành công.
                  Đơn hàng sẽ được xử lý sau khi chúng tôi xác nhận khoản thanh toán.
                </div>
              )}

              {/* Option 3: Momo/ZaloPay */}
              <div
                onClick={() => setPaymentProvider('MOMO_MOCK')}
                className={`chk-payment-option ${
                  paymentProvider === 'MOMO_MOCK' ? 'chk-payment-option--selected' : ''
                }`}
              >
                <input
                  type="radio"
                  checked={paymentProvider === 'MOMO_MOCK'}
                  readOnly
                  className="chk-payment-radio"
                />
                <div className="chk-payment-info">
                  <span className="chk-payment-title">Ví điện tử Momo / ZaloPay</span>
                  <span className="chk-payment-desc">Quét mã QR để thanh toán nhanh chóng.</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* right order summary sidebar */}
        <aside className="chk-sidebar">
          <h2>Tóm tắt đơn hàng</h2>

          {/* scrollable items list */}
          <div className="chk-items-summary">
            {items.map((item) => (
              <div key={item.id} className="chk-item-row">
                <div className="chk-item-img-placeholder">
                  <span className="text-[9px] font-bold text-slate-400">
                    {item.productVariant.sku.split('-')[0]}
                  </span>
                </div>
                <div className="chk-item-meta">
                  <h4 className="chk-item-name">{item.productVariant.productName}</h4>
                  <p className="chk-item-qty">Số lượng: {item.quantity}</p>
                </div>
                <span className="chk-item-price">{formatMoney(item.subTotal)}</span>
              </div>
            ))}
          </div>

          {/* coupon wrap */}
          <div className="chk-coupon-wrap">
            <p className="chk-coupon-label">Mã giảm giá</p>
            <div className="chk-coupon-form">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="chk-coupon-input"
                placeholder="Nhập mã"
              />
              <button
                type="button"
                onClick={() => applyVoucherMutation.mutate()}
                disabled={applyVoucherMutation.isPending}
                className="chk-coupon-btn"
              >
                Áp dụng
              </button>
            </div>
          </div>

          {/* totals list */}
          <div className="chk-summary-rows">
            <div className="chk-summary-row">
              <span>Tạm tính</span>
              <strong>{formatMoney(cart!.totalAmount)}</strong>
            </div>
            <div className="chk-summary-row">
              <span>Phí vận chuyển</span>
              <span className="text-emerald-600 font-semibold">Miễn phí</span>
            </div>
            {applyVoucherMutation.data && (
              <div className="chk-summary-row">
                <span>Giảm giá</span>
                <span className="text-rose-500 font-semibold">
                  -{formatMoney(applyVoucherMutation.data.data.discountAmount)}
                </span>
              </div>
            )}

            <div className="chk-summary-row chk-summary-row--total">
              <span>Tổng cộng</span>
              <span className="chk-total-price">
                {formatMoney(
                  cart!.totalAmount -
                    (applyVoucherMutation.data?.data.discountAmount ?? 0)
                )}
              </span>
            </div>
          </div>

          {/* submit button */}
          <button
            onClick={handlePlaceOrder}
            disabled={placeOrderMutation.isPending}
            className="chk-submit-btn"
          >
            <span>{placeOrderMutation.isPending ? 'Đang tạo đơn...' : 'Xác nhận đặt hàng'}</span>
            <span className="text-xs">→</span>
          </button>
          <p className="chk-footnote">
            Bằng việc đặt hàng, bạn đồng ý với{' '}
            <Link to="/terms" target="_blank">
              Điều khoản sử dụng
            </Link>{' '}
            của chúng tôi.
          </p>
        </aside>
      </div>
    </div>
  );
};
