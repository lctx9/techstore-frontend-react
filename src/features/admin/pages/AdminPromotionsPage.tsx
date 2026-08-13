import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../api/client';
import { Loader2, Ticket, Zap, ShieldAlert, Plus, Check } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

interface VoucherResponse {
  id: number;
  code: string;
  discountType: string;
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number;
  usageLimit: number;
  usedCount: number;
  startDate: string;
  endDate: string;
}

interface ProductVariantResponse {
  id: number;
  sku: string;
  price: number;
  productName: string;
}

interface ProductResponse {
  id: number;
  name: string;
  variants: ProductVariantResponse[];
}

interface FlashSaleResponse {
  id: number;
  productVariant: {
    id: number;
    sku: string;
    price: number;
    productName: string;
  };
  flashPrice: number;
  quantityLimit: number;
  quantitySold: number;
  startTime: string;
  endTime: string;
}

export const AdminPromotionsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as 'vouchers' | 'flashsales') || 'vouchers';

  const setActiveTab = (tab: 'vouchers' | 'flashsales') => {
    setSearchParams({ tab });
  };

  // Voucher Form States
  const [vCode, setVCode] = useState('');
  const [vDiscountType, setVDiscountType] = useState('PERCENTAGE');
  const [vDiscountValue, setVDiscountValue] = useState(0);
  const [vMinOrder, setVMinOrder] = useState(0);
  const [vMaxDiscount, setVMaxDiscount] = useState(0);
  const [vUsageLimit, setVUsageLimit] = useState(1);
  const [vStart, setVStart] = useState('');
  const [vEnd, setVEnd] = useState('');
  const [vSuccess, setVSuccess] = useState(false);

  // Flash Sale Form States
  const [fsVariantId, setFsVariantId] = useState<number | ''>('');
  const [fsPrice, setFsPrice] = useState(0);
  const [fsLimit, setFsLimit] = useState(1);
  const [fsStart, setFsStart] = useState('');
  const [fsEnd, setFsEnd] = useState('');
  const [fsSuccess, setFsSuccess] = useState(false);

  // 1. Fetch Vouchers
  const { data: vouchers, isLoading: vLoading } = useQuery<VoucherResponse[]>({
    queryKey: ['admin-vouchers'],
    queryFn: async () => {
      const response = await apiClient.get('/api/v1/vouchers');
      return response.data;
    },
  });

  // 2. Fetch Flash Sales
  const { data: flashSales, isLoading: fsLoading } = useQuery<FlashSaleResponse[]>({
    queryKey: ['admin-flashsales'],
    queryFn: async () => {
      const response = await apiClient.get('/api/v1/flash-sales');
      return response.data;
    },
  });

  // 3. Fetch products to get variants list for flash sale selection
  const { data: productsPage } = useQuery<{ content: ProductResponse[] }>({
    queryKey: ['admin-products-minimal'],
    queryFn: async () => {
      const response = await apiClient.get('/api/v1/admin/products', { params: { size: 100 } });
      return response.data;
    },
  });

  const allVariants = productsPage?.content?.flatMap(p => 
    p.variants?.map(v => ({ ...v, productName: p.name })) || []
  ) || [];

  // 4. Create Voucher Mutation
  const createVoucherMutation = useMutation({
    mutationFn: async () => {
      // Convert HTML datetime-local to ISO format (e.g. 2026-08-12T00:00:00)
      const formatIso = (dtStr: string) => dtStr ? new Date(dtStr).toISOString().substring(0, 19) : '';
      
      const payload = {
        code: vCode.toUpperCase(),
        discountType: vDiscountType,
        discountValue: vDiscountValue,
        minOrderAmount: vMinOrder,
        maxDiscountAmount: vMaxDiscount > 0 ? vMaxDiscount : null,
        startDate: formatIso(vStart),
        endDate: formatIso(vEnd),
        usageLimit: vUsageLimit
      };

      return apiClient.post('/api/v1/vouchers', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vouchers'] });
      setVSuccess(true);
      setVCode('');
      setVDiscountValue(0);
      setVMinOrder(0);
      setVMaxDiscount(0);
      setVUsageLimit(1);
      setVStart('');
      setVEnd('');
      setTimeout(() => setVSuccess(false), 3000);
    }
  });

  // 5. Create Flash Sale Mutation
  const createFlashSaleMutation = useMutation({
    mutationFn: async () => {
      const formatIso = (dtStr: string) => dtStr ? new Date(dtStr).toISOString().substring(0, 19) : '';

      const payload = {
        variantId: Number(fsVariantId),
        flashPrice: fsPrice,
        quantityLimit: fsLimit,
        startTime: formatIso(fsStart),
        endTime: formatIso(fsEnd)
      };

      return apiClient.post('/api/v1/flash-sales', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-flashsales'] });
      setFsSuccess(true);
      setFsVariantId('');
      setFsPrice(0);
      setFsLimit(1);
      setFsStart('');
      setFsEnd('');
      setTimeout(() => setFsSuccess(false), 3000);
    }
  });

  const handleCreateVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vCode.trim() || !vStart || !vEnd) return;
    createVoucherMutation.mutate();
  };

  const handleCreateFlashSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fsVariantId || !fsStart || !fsEnd) return;
    createFlashSaleMutation.mutate();
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('vouchers')}
          className={`flex items-center space-x-1.5 px-6 py-3 border-b-2 font-semibold text-xs tracking-wider transition-colors cursor-pointer ${
            activeTab === 'vouchers'
              ? 'border-indigo-650 text-indigo-750 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Ticket className="h-4 w-4" />
          <span>VOUCHERS / MÃ GIẢM GIÁ</span>
        </button>
        <button
          onClick={() => setActiveTab('flashsales')}
          className={`flex items-center space-x-1.5 px-6 py-3 border-b-2 font-semibold text-xs tracking-wider transition-colors cursor-pointer ${
            activeTab === 'flashsales'
              ? 'border-indigo-650 text-indigo-750 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Zap className="h-4 w-4" />
          <span>FLASH SALES</span>
        </button>
      </div>

      {activeTab === 'vouchers' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Vouchers list */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 font-bold text-slate-800">Danh sách Voucher</div>
            {vLoading ? (
              <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-amber-500" /></div>
            ) : !vouchers || vouchers.length === 0 ? (
              <div className="p-12 text-center text-slate-500">Chưa có mã giảm giá nào được tạo.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold text-left">
                    <tr>
                      <th className="px-4 py-3">Code</th>
                      <th className="px-4 py-3">Loại giảm</th>
                      <th className="px-4 py-3">Giá trị</th>
                      <th className="px-4 py-3">Min đơn</th>
                      <th className="px-4 py-3">Giới hạn</th>
                      <th className="px-4 py-3">Hạn sử dụng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {vouchers.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-bold text-slate-900 font-mono">{v.code}</td>
                        <td className="px-4 py-3">{v.discountType === 'PERCENTAGE' ? 'Phần trăm' : 'Số tiền cố định'}</td>
                        <td className="px-4 py-3 font-semibold text-indigo-650">
                          {v.discountType === 'PERCENTAGE' ? `${v.discountValue}%` : `$${v.discountValue}`}
                        </td>
                        <td className="px-4 py-3">${v.minOrderAmount}</td>
                        <td className="px-4 py-3 font-semibold">
                          {v.usedCount} / {v.usageLimit}
                        </td>
                        <td className="px-4 py-3 text-slate-550">
                          {new Date(v.endDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Create Voucher Form */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Tạo Voucher Mới</h3>
            <form onSubmit={handleCreateVoucher} className="space-y-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Mã Voucher *</label>
                <input
                  type="text"
                  required
                  value={vCode}
                  onChange={(e) => setVCode(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-slate-800 uppercase"
                  placeholder="SALE50"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Loại giảm giá *</label>
                  <select
                    value={vDiscountType}
                    onChange={(e) => setVDiscountType(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-slate-800"
                  >
                    <option value="PERCENTAGE">Phần trăm</option>
                    <option value="FIXED_AMOUNT">Cố định ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Giá trị giảm *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={vDiscountValue}
                    onChange={(e) => setVDiscountValue(Number(e.target.value))}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Đơn tối thiểu ($) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={vMinOrder}
                    onChange={(e) => setVMinOrder(Number(e.target.value))}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Giảm tối đa ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={vMaxDiscount}
                    onChange={(e) => setVMaxDiscount(Number(e.target.value))}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Lượt dùng tối đa *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={vUsageLimit}
                  onChange={(e) => setVUsageLimit(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Bắt đầu *</label>
                  <input
                    type="datetime-local"
                    required
                    value={vStart}
                    onChange={(e) => setVStart(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-slate-800 text-[10px]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Kết thúc *</label>
                  <input
                    type="datetime-local"
                    required
                    value={vEnd}
                    onChange={(e) => setVEnd(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-slate-800 text-[10px]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={createVoucherMutation.isPending}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold transition-colors cursor-pointer"
              >
                {createVoucherMutation.isPending ? 'Đang tạo...' : 'Tạo mã Voucher'}
              </button>

              {vSuccess && (
                <p className="text-[10px] text-emerald-600 font-semibold flex items-center space-x-1 justify-center">
                  <Check className="h-3.5 w-3.5" />
                  <span>Đã tạo Voucher thành công!</span>
                </p>
              )}
            </form>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Flash sales list */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 font-bold text-slate-800">Danh sách Flash Sales</div>
            {fsLoading ? (
              <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-amber-500" /></div>
            ) : !flashSales || flashSales.length === 0 ? (
              <div className="p-12 text-center text-slate-500">Chưa có phiên Flash sale nào được tạo.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold text-left">
                    <tr>
                      <th className="px-4 py-3">Sản phẩm (SKU)</th>
                      <th className="px-4 py-3">Giá cũ</th>
                      <th className="px-4 py-3">Giá Flash</th>
                      <th className="px-4 py-3">Giới hạn bán</th>
                      <th className="px-4 py-3">Đã bán</th>
                      <th className="px-4 py-3">Hạn diễn ra</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {flashSales.map((fs) => (
                      <tr key={fs.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3">
                          <span className="font-bold text-slate-900 block">{fs.productVariant?.productName}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{fs.productVariant?.sku}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-450 line-through">${fs.productVariant?.price}</td>
                        <td className="px-4 py-3 font-extrabold text-rose-600">${fs.flashPrice}</td>
                        <td className="px-4 py-3 font-semibold">{fs.quantityLimit}</td>
                        <td className="px-4 py-3 font-semibold text-emerald-650">{fs.quantitySold}</td>
                        <td className="px-4 py-3 text-slate-550">
                          {new Date(fs.startTime).toLocaleTimeString()} - {new Date(fs.endTime).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Create Flash Sale Form */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Thiết lập Flash Sale</h3>
            <form onSubmit={handleCreateFlashSale} className="space-y-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Chọn phiên bản SKU sản phẩm *</label>
                <select
                  required
                  value={fsVariantId}
                  onChange={(e) => setFsVariantId(Number(e.target.value) || '')}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-slate-800"
                >
                  <option value="">Chọn SKU biến thể</option>
                  {allVariants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.productName} ({v.sku}) - Price: ${v.price}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Giá Flash Sale ($) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={fsPrice}
                    onChange={(e) => setFsPrice(Number(e.target.value))}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Số lượng bán tối đa *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={fsLimit}
                    onChange={(e) => setFsLimit(Number(e.target.value))}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Bắt đầu *</label>
                  <input
                    type="datetime-local"
                    required
                    value={fsStart}
                    onChange={(e) => setFsStart(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-slate-800 text-[10px]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Kết thúc *</label>
                  <input
                    type="datetime-local"
                    required
                    value={fsEnd}
                    onChange={(e) => setFsEnd(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-slate-800 text-[10px]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={createFlashSaleMutation.isPending}
                className="w-full py-2 bg-indigo-650 hover:bg-indigo-750 text-white rounded font-bold transition-colors cursor-pointer"
              >
                {createFlashSaleMutation.isPending ? 'Đang tạo...' : 'Kích hoạt Flash Sale'}
              </button>

              {fsSuccess && (
                <p className="text-[10px] text-emerald-600 font-semibold flex items-center space-x-1 justify-center">
                  <Check className="h-3.5 w-3.5" />
                  <span>Kích hoạt Flash Sale thành công!</span>
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
