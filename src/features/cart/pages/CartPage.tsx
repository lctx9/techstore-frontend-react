import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Loader2, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../../../api/client';
import './CartPage.css';

/* ─── types ──────────────────────────────────────────────── */
interface ProductVariant {
  id: number;
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

export const CartPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');

  /* ─── queries ─── */
  const { data: cart, isLoading, isError } = useQuery<CartResponse>({
    queryKey: ['cart'],
    queryFn: () => apiClient.get('/api/v1/carts').then((r) => r.data),
  });

  /* ─── mutations ─── */
  const updateQuantityMutation = useMutation({
    mutationFn: ({ id, q }: { id: number; q: number }) =>
      apiClient.put(`/api/v1/carts/items/${id}`, null, { params: { quantity: q } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  const removeItemMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/api/v1/carts/items/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  /* ─── loaders ─── */
  if (isLoading) {
    return (
      <div className="cart-container flex justify-center items-center min-h-[500px]">
        <Loader2 className="animate-spin text-[#0752b8] h-10 w-10" />
      </div>
    );
  }

  const items = cart?.items ?? [];

  if (isError || items.length === 0) {
    return (
      <div className="cart-container">
        <div className="cart-empty">
          <ShoppingBag size={64} />
          <h2>Giỏ hàng đang trống</h2>
          <p>Hãy khám phá thêm hàng ngàn sản phẩm công nghệ hấp dẫn.</p>
          <Link to="/products" className="cart-empty-link">
            Mua sắm ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      {/* header */}
      <div className="cart-header">
        <h1>Giỏ hàng của bạn</h1>
        <Link to="/products" className="cart-back-link">
          ← Tiếp tục mua sắm
        </Link>
      </div>

      {/* content layout */}
      <div className="cart-layout">
        {/* left list */}
        <div className="cart-items-list">
          {items.map((item) => (
            <article key={item.id} className="cart-item-card">
              {/* Product Thumbnail */}
              <div className="cart-item-image">
                <div>
                  <strong className="block text-slate-800 font-bold uppercase tracking-wide">
                    {item.productVariant.sku.split('-')[0]}
                  </strong>
                  <span className="block text-[10px] text-slate-400 mt-1">Ảnh SP</span>
                </div>
              </div>

              {/* Details */}
              <div className="cart-item-details">
                <div>
                  <h2 className="cart-item-title">{item.productVariant.productName}</h2>
                  <p className="cart-item-attributes">
                    {parseAttributes(item.productVariant.attributesJson) || item.productVariant.sku}
                  </p>
                </div>
                <p className="cart-item-price">{formatMoney(item.productVariant.price)}</p>
              </div>

              {/* Actions & Qty */}
              <div className="cart-item-actions">
                <button
                  onClick={() => removeItemMutation.mutate(item.id)}
                  disabled={removeItemMutation.isPending}
                  className="cart-item-remove"
                  title="Xóa khỏi giỏ hàng"
                >
                  <Trash2 size={18} />
                </button>

                <div className="cart-item-qty">
                  <button
                    onClick={() =>
                      item.quantity > 1 &&
                      updateQuantityMutation.mutate({ id: item.id, q: item.quantity - 1 })
                    }
                    disabled={updateQuantityMutation.isPending || item.quantity <= 1}
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() =>
                      updateQuantityMutation.mutate({ id: item.id, q: item.quantity + 1 })
                    }
                    disabled={updateQuantityMutation.isPending}
                  >
                    +
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* right sidebar summary */}
        <aside className="cart-summary-card">
          <h2>Tóm tắt đơn hàng</h2>
          <div className="cart-summary-row">
            <span>Tạm tính</span>
            <strong>{formatMoney(cart!.totalAmount)}</strong>
          </div>
          <div className="cart-summary-row">
            <span>Phí giao hàng</span>
            <span className="text-emerald-600 font-semibold">Miễn phí</span>
          </div>
          <div className="cart-summary-row">
            <span>Giảm giá</span>
            <span className="text-[#0752b8]">0 đ</span>
          </div>

          <div className="cart-summary-row cart-summary-row--total">
            <span>Tổng cộng</span>
            <span className="cart-total-price">{formatMoney(cart!.totalAmount)}</span>
          </div>

          <form
            className="cart-coupon-form"
            onSubmit={(e) => {
              e.preventDefault();
              // Apply coupon action goes here if backend supports it
            }}
          >
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="cart-coupon-input"
              placeholder="Nhập mã..."
            />
            <button type="submit" className="cart-coupon-btn">
              Áp dụng
            </button>
          </form>

          <Link to="/checkout" className="cart-checkout-btn">
            <span>Tiến hành thanh toán</span>
            <ArrowRight size={18} />
          </Link>
          <p className="cart-security-text">Thanh toán an toàn với mã hóa SSL.</p>
        </aside>
      </div>
    </div>
  );
};
