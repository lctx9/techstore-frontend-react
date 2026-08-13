import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Box, ChevronRight, Cpu, HardDrive, Loader2, Monitor,
  RotateCcw, ShieldCheck, ShoppingCart, Star, Truck
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../../../api/client';
import { useAuthStore } from '../../../store/authStore';
import './ProductDetailPage.css';

/* ─── types ──────────────────────────────────────────────── */
interface Variant {
  id: number;
  sku: string;
  price: number;
  attributesJson: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  basePrice: number;
  category?: { id: number; name: string; slug: string };
  brand?: { id: number; name: string };
  active: boolean;
  variants: Variant[];
}

interface Review {
  id: number;
  productId: number;
  userEmail: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
}

/* ─── helpers ────────────────────────────────────────────── */
const money = (n: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(n);

const SPEC_ICON_MAP: Record<string, React.ReactNode> = {
  'cpu': <Cpu size={20} />,
  'vi xử lý': <Cpu size={20} />,
  'processor': <Cpu size={20} />,
  'ram': <Monitor size={20} />,
  'memory': <Monitor size={20} />,
  'storage': <HardDrive size={20} />,
  'lưu trữ': <HardDrive size={20} />,
  'ssd': <HardDrive size={20} />,
  'gpu': <Box size={20} />,
  'đồ họa': <Box size={20} />,
  'graphics': <Box size={20} />,
  'vga': <Box size={20} />,
};

function getSpecIcon(key: string) {
  const lower = key.toLowerCase();
  for (const [pattern, icon] of Object.entries(SPEC_ICON_MAP)) {
    if (lower.includes(pattern)) return icon;
  }
  return <Cpu size={20} />;
}

/* ─── StarRating component ───────────────────────────────── */
const StarRating: React.FC<{ rating: number; size?: number }> = ({ rating, size = 18 }) => (
  <span className="pdp-stars">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        size={size}
        fill={i <= Math.round(rating) ? '#f59e0b' : 'none'}
        stroke={i <= Math.round(rating) ? '#f59e0b' : '#cbd5e1'}
        strokeWidth={1.5}
      />
    ))}
  </span>
);

/* ─── main component ────────────────────────────────────── */
export const ProductDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { accessToken } = useAuthStore();

  const [selectedVariantId, setSelectedVariantId] = useState<number>();
  const [activeThumb, setActiveThumb] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [addedToCart, setAddedToCart] = useState(false);

  /* ─── queries ─── */
  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ['product', id],
    queryFn: () => apiClient.get(`/api/v1/products/${id}`).then((r) => r.data),
  });

  const { data: reviewsPage } = useQuery<PageResponse<Review>>({
    queryKey: ['reviews', id],
    queryFn: () =>
      apiClient.get(`/api/v1/reviews/product/${id}?size=20`).then((r) => r.data),
    enabled: !!id,
  });

  /* ─── derived ─── */
  const variant = product?.variants.find((v) => v.id === selectedVariantId) ?? product?.variants[0];
  const reviews = reviewsPage?.content ?? [];
  const reviewCount = reviewsPage?.totalElements ?? 0;
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const specs = useMemo(() => {
    try {
      return Object.entries(JSON.parse(variant?.attributesJson || '{}')).slice(0, 4);
    } catch {
      return [];
    }
  }, [variant]);

  const originalPrice = variant ? Math.round(variant.price * 1.15) : 0;
  const savingsPercent = variant ? Math.round(((originalPrice - variant.price) / originalPrice) * 100) : 0;

  /* ─── mutations ─── */
  const addToCartMutation = useMutation({
    mutationFn: () =>
      apiClient.post('/api/v1/carts', { productVariantId: variant?.id, quantity: 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2500);
    },
  });

  const submitReviewMutation = useMutation({
    mutationFn: () =>
      apiClient.post(`/api/v1/reviews/product/${id}`, {
        rating: reviewRating,
        comment: reviewText,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', id] });
      setReviewText('');
      setReviewRating(5);
    },
  });

  /* ─── handlers ─── */
  const handleAddToCart = () => {
    if (!accessToken) {
      navigate('/login', { state: { from: { pathname: `/products/${id}` } } });
      return;
    }
    addToCartMutation.mutate();
  };

  const handleBuyNow = () => {
    handleAddToCart();
    if (accessToken) navigate('/checkout');
  };

  /* ─── loading & error ─── */
  if (isLoading) {
    return (
      <div className="pdp-loading">
        <Loader2 className="pdp-loading__spinner" />
        <p>Đang tải sản phẩm...</p>
      </div>
    );
  }

  if (!product || !variant) {
    return (
      <div className="pdp-empty">
        <h2>Không tìm thấy sản phẩm</h2>
        <p>Sản phẩm không tồn tại hoặc đã ngừng bán.</p>
        <Link to="/products" className="pdp-empty__link">
          ← Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="pdp">
      {/* ─── breadcrumb ─── */}
      <nav className="pdp-breadcrumb">
        <Link to="/">Trang chủ</Link>
        <ChevronRight size={14} />
        <Link to="/products">{product.category?.name || 'Sản phẩm'}</Link>
        <ChevronRight size={14} />
        <span>{product.name}</span>
      </nav>

      {/* ─── main grid ─── */}
      <div className="pdp-main">
        {/* LEFT — image gallery */}
        <section className="pdp-gallery">
          <div className="pdp-gallery__hero">
            <span className="pdp-badge pdp-badge--new">Mới</span>
            <span className="pdp-badge pdp-badge--stock">Còn hàng</span>
            <div className="pdp-gallery__placeholder">
              <span className="pdp-gallery__brand">{product.brand?.name || 'TechStore'}</span>
              <span className="pdp-gallery__sub">{product.name}</span>
            </div>
          </div>
          <div className="pdp-gallery__thumbs">
            {[0, 1, 2, 3].map((i) => (
              <button
                key={i}
                onClick={() => setActiveThumb(i)}
                className={`pdp-gallery__thumb ${activeThumb === i ? 'pdp-gallery__thumb--active' : ''}`}
              >
                {i === 3 ? (
                  <span className="pdp-gallery__thumb-play">▶</span>
                ) : (
                  <span className="pdp-gallery__thumb-text">
                    {product.brand?.name || 'Ảnh'}
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* RIGHT — product info */}
        <section className="pdp-info">
          {/* title */}
          <h1 className="pdp-info__title">{product.name}</h1>

          {/* rating + sku */}
          <div className="pdp-info__meta">
            <StarRating rating={avgRating} />
            <Link to="#reviews" className="pdp-info__review-count">
              {reviewCount} Đánh giá
            </Link>
            <span className="pdp-info__divider">|</span>
            <span className="pdp-info__sku">Mã SP: {variant.sku}</span>
          </div>

          {/* price */}
          <div className="pdp-price">
            <span className="pdp-price__current">{money(variant.price)}</span>
            <span className="pdp-price__original">{money(originalPrice)}</span>
            <p className="pdp-price__savings">
              Tiết kiệm {money(originalPrice - variant.price)} ({savingsPercent}%)
            </p>
          </div>

          {/* specs grid */}
          {specs.length > 0 && (
            <div className="pdp-specs">
              {specs.map(([key, value]) => (
                <div key={key} className="pdp-specs__item">
                  <span className="pdp-specs__icon">{getSpecIcon(key)}</span>
                  <div>
                    <p className="pdp-specs__label">{key}</p>
                    <p className="pdp-specs__value">{String(value)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* variant selector */}
          {product.variants.length > 1 && (
            <div className="pdp-variants">
              <p className="pdp-variants__label">PHIÊN BẢN</p>
              <div className="pdp-variants__list">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`pdp-variants__btn ${variant.id === v.id ? 'pdp-variants__btn--active' : ''}`}
                  >
                    {v.sku}
                    <span className="pdp-variants__btn-price">{money(v.price)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* action buttons */}
          <div className="pdp-actions">
            <button
              onClick={handleAddToCart}
              disabled={addToCartMutation.isPending}
              className="pdp-actions__add"
            >
              <ShoppingCart size={20} />
              {addToCartMutation.isPending
                ? 'Đang thêm...'
                : addedToCart
                  ? '✓ Đã thêm!'
                  : 'Thêm vào giỏ'}
            </button>
            <button onClick={handleBuyNow} className="pdp-actions__buy">
              Mua ngay
            </button>
          </div>

          {/* benefits */}
          <div className="pdp-benefits">
            <div className="pdp-benefits__item">
              <Truck size={20} />
              <span>Giao hàng miễn phí</span>
            </div>
            <div className="pdp-benefits__item">
              <ShieldCheck size={20} />
              <span>Bảo hành 24 tháng</span>
            </div>
            <div className="pdp-benefits__item">
              <RotateCcw size={20} />
              <span>Đổi trả 30 ngày</span>
            </div>
          </div>
        </section>
      </div>

      {/* ─── description ─── */}
      {product.description && (
        <section className="pdp-description">
          <h2>Mô tả sản phẩm</h2>
          <div className="pdp-description__content">
            {product.description}
          </div>
        </section>
      )}

      {/* ─── reviews section ─── */}
      <section className="pdp-reviews" id="reviews">
        <h2>Đánh giá sản phẩm ({reviewCount})</h2>

        {/* review form */}
        {accessToken && (
          <form
            className="pdp-reviews__form"
            onSubmit={(e) => {
              e.preventDefault();
              submitReviewMutation.mutate();
            }}
          >
            <div className="pdp-reviews__form-rating">
              <span>Đánh giá của bạn:</span>
              <div className="pdp-reviews__form-stars">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setReviewRating(i)}
                    className="pdp-reviews__star-btn"
                  >
                    <Star
                      size={22}
                      fill={i <= reviewRating ? '#f59e0b' : 'none'}
                      stroke={i <= reviewRating ? '#f59e0b' : '#94a3b8'}
                      strokeWidth={1.5}
                    />
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
              rows={3}
              className="pdp-reviews__textarea"
              required
            />
            <button
              type="submit"
              disabled={submitReviewMutation.isPending || !reviewText.trim()}
              className="pdp-reviews__submit"
            >
              {submitReviewMutation.isPending ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </form>
        )}

        {/* reviews list */}
        {reviews.length > 0 ? (
          <div className="pdp-reviews__list">
            {reviews.map((review) => (
              <div key={review.id} className="pdp-reviews__item">
                <div className="pdp-reviews__item-header">
                  <div className="pdp-reviews__avatar">
                    {review.userEmail.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="pdp-reviews__author">{review.userEmail.split('@')[0]}</p>
                    <p className="pdp-reviews__date">
                      {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <StarRating rating={review.rating} size={14} />
                </div>
                <p className="pdp-reviews__comment">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="pdp-reviews__empty">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
        )}
      </section>
    </div>
  );
};
