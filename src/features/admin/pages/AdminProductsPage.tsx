import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../api/client';
import { Loader2, Plus, Edit, Trash2, ShieldAlert, Package, Check, X } from 'lucide-react';

interface CategoryResponse {
  id: number;
  name: string;
}

interface BrandResponse {
  id: number;
  name: string;
}

interface ProductVariantResponse {
  id: number;
  sku: string;
  price: number;
  attributesJson: string;
}

interface ProductResponse {
  id: number;
  name: string;
  description: string;
  basePrice: number;
  category: CategoryResponse;
  brand: BrandResponse;
  active: boolean;
  variants: ProductVariantResponse[];
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
}

interface InventoryResponse {
  id: number;
  variantId: number;
  quantity: number;
}

export const AdminProductsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductResponse | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState(0);
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [brandId, setBrandId] = useState<number | ''>('');
  const [active, setActive] = useState(true);
  const [variantsList, setVariantsList] = useState<{ id?: number; sku: string; price: number; attributesJson: string }[]>([]);

  // Inventory/Stock States
  const [selectedProduct, setSelectedProduct] = useState<ProductResponse | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<number | ''>('');
  const [stockQty, setStockQty] = useState(0);
  const [stockSuccess, setStockSuccess] = useState(false);

  // 1. Fetch Products
  const { data: productsPage, isLoading: productsLoading } = useQuery<PageResponse<ProductResponse>>({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const response = await apiClient.get('/api/v1/admin/products', {
        params: { size: 100 } // Load a high count for admin ease
      });
      return response.data;
    },
  });

  // 2. Fetch Categories
  const { data: categories } = useQuery<CategoryResponse[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await apiClient.get('/api/v1/categories');
      return response.data;
    },
  });

  // 3. Fetch Brands
  const { data: brands } = useQuery<BrandResponse[]>({
    queryKey: ['brands'],
    queryFn: async () => {
      const response = await apiClient.get('/api/v1/brands');
      return response.data;
    },
  });

  // 4. Fetch Stock level for a selected variant
  const { data: stockDetails, refetch: refetchStock, isFetching: stockLoading } = useQuery<InventoryResponse>({
    queryKey: ['variant-stock', selectedVariantId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/v1/admin/inventory/variant/${selectedVariantId}`);
      setStockQty(response.data.quantity);
      return response.data;
    },
    enabled: !!selectedVariantId,
  });

  // 5. Update Stock Mutation
  const updateStockMutation = useMutation({
    mutationFn: async () => {
      if (!selectedVariantId) return null;
      return apiClient.put(`/api/v1/admin/inventory/variant/${selectedVariantId}`, null, {
        params: { quantity: stockQty }
      });
    },
    onSuccess: () => {
      setStockSuccess(true);
      setTimeout(() => setStockSuccess(false), 3000);
    }
  });

  // 6. Delete Product Mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiClient.delete(`/api/v1/admin/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });

  // 7. Save Product Mutation (Create / Update)
  const saveProductMutation = useMutation({
    mutationFn: async () => {
      const requestData = {
        name,
        description,
        basePrice,
        categoryId: Number(categoryId),
        brandId: Number(brandId),
        active,
        variants: variantsList.map(v => ({
          id: v.id,
          sku: v.sku,
          price: v.price,
          attributesJson: v.attributesJson
        }))
      };

      if (editingProduct) {
        return apiClient.put(`/api/v1/admin/products/${editingProduct.id}`, requestData);
      } else {
        return apiClient.post('/api/v1/admin/products', requestData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const resetForm = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setBasePrice(0);
    setCategoryId('');
    setBrandId('');
    setActive(true);
    setVariantsList([]);
  };

  const openCreateModal = () => {
    resetForm();
    // Pre-populate with one default variant row
    setVariantsList([{ sku: '', price: 0, attributesJson: '{}' }]);
    setIsModalOpen(true);
  };

  const openEditModal = (p: ProductResponse) => {
    setEditingProduct(p);
    setName(p.name);
    setDescription(p.description);
    setBasePrice(p.basePrice);
    setCategoryId(p.category.id);
    setBrandId(p.brand.id);
    setActive(p.active);
    setVariantsList(p.variants.map(v => ({
      id: v.id,
      sku: v.sku,
      price: v.price,
      attributesJson: v.attributesJson
    })));
    setIsModalOpen(true);
  };

  const openStockModal = (p: ProductResponse) => {
    setSelectedProduct(p);
    setSelectedVariantId('');
    setStockQty(0);
    setIsStockModalOpen(true);
  };

  const handleAddVariantRow = () => {
    setVariantsList([...variantsList, { sku: '', price: 0, attributesJson: '{}' }]);
  };

  const handleRemoveVariantRow = (index: number) => {
    setVariantsList(variantsList.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index: number, field: string, val: any) => {
    const updated = [...variantsList];
    updated[index] = { ...updated[index], [field]: val };
    setVariantsList(updated);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !categoryId || !brandId || variantsList.length === 0) return;
    saveProductMutation.mutate();
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này không?')) {
      deleteProductMutation.mutate(id);
    }
  };

  if (productsLoading) {
    return (
      <div className="min-h-[50svh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
        <p className="text-slate-500 font-medium text-sm">Đang tải danh sách quản trị sản phẩm...</p>
      </div>
    );
  }

  const products = productsPage?.content || [];

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-bold text-slate-800">Quản lý Sản phẩm</h2>
        <button
          onClick={openCreateModal}
          className="flex items-center space-x-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-md text-xs font-bold shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Thêm sản phẩm mới</span>
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50 text-slate-500 font-semibold text-xs text-left">
            <tr>
              <th className="px-6 py-3">Sản phẩm</th>
              <th className="px-6 py-3">Thương hiệu</th>
              <th className="px-6 py-3">Danh mục</th>
              <th className="px-6 py-3">Giá cơ sở</th>
              <th className="px-6 py-3">Biến thể</th>
              <th className="px-6 py-3">Trạng thái</th>
              <th className="px-6 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4 font-bold text-slate-900">{p.name}</td>
                <td className="px-6 py-4">{p.brand?.name}</td>
                <td className="px-6 py-4">{p.category?.name}</td>
                <td className="px-6 py-4 font-semibold">${p.basePrice.toLocaleString()}</td>
                <td className="px-6 py-4 text-xs font-mono text-slate-500">
                  {p.variants?.map(v => v.sku).join(', ') || 'Chưa có'}
                </td>
                <td className="px-6 py-4">
                  {p.active ? (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">Hoạt động</span>
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-800">Khóa</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => openStockModal(p)}
                    className="p-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-md transition-colors cursor-pointer"
                    title="Quản lý tồn kho"
                  >
                    <Package className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => openEditModal(p)}
                    className="p-1.5 border border-slate-200 text-amber-600 hover:bg-amber-50 rounded-md transition-colors cursor-pointer"
                    title="Chỉnh sửa sản phẩm"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-1.5 border border-slate-200 text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                    title="Xóa sản phẩm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 1. Modal Add/Edit Product */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {editingProduct ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-6 flex-grow text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tên sản phẩm *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-800 text-xs"
                    placeholder="Ví dụ: iPhone 15 Pro Max"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Giá cơ sở ($) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={basePrice}
                    onChange={(e) => setBasePrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Danh mục *</label>
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-800 text-xs"
                  >
                    <option value="">Chọn danh mục</option>
                    {categories?.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Thương hiệu *</label>
                  <select
                    required
                    value={brandId}
                    onChange={(e) => setBrandId(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-800 text-xs"
                  >
                    <option value="">Chọn thương hiệu</option>
                    {brands?.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Mô tả chi tiết</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-800 text-xs"
                  placeholder="Mô tả thông số hoặc điểm nổi bật..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="product-active"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600"
                />
                <label htmlFor="product-active" className="text-slate-700 font-semibold">Hiển thị bán hàng (Active)</label>
              </div>

              {/* Dynamic Variants inputs */}
              <div className="space-y-3 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800">Cấu hình biến thể sản phẩm ({variantsList.length})</h4>
                  <button
                    type="button"
                    onClick={handleAddVariantRow}
                    className="px-2.5 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded text-[10px] cursor-pointer"
                  >
                    + Thêm biến thể
                  </button>
                </div>

                <div className="space-y-2">
                  {variantsList.map((row, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row items-center gap-2 border border-slate-150 p-3 rounded-lg bg-slate-50/50">
                      <div className="flex-grow w-full">
                        <label className="block text-[10px] text-slate-400 font-bold mb-0.5">SKU *</label>
                        <input
                          type="text"
                          required
                          value={row.sku}
                          onChange={(e) => handleVariantChange(idx, 'sku', e.target.value.toUpperCase())}
                          className="w-full px-2 py-1 border border-slate-300 rounded text-slate-850 text-xs"
                          placeholder="IPHONE15-128-BLACK"
                        />
                      </div>
                      <div className="w-full sm:w-28">
                        <label className="block text-[10px] text-slate-400 font-bold mb-0.5">Giá ($) *</label>
                        <input
                          type="number"
                          required
                          value={row.price}
                          onChange={(e) => handleVariantChange(idx, 'price', Number(e.target.value))}
                          className="w-full px-2 py-1 border border-slate-300 rounded text-slate-850 text-xs"
                        />
                      </div>
                      <div className="flex-grow w-full">
                        <label className="block text-[10px] text-slate-400 font-bold mb-0.5">Thuộc tính JSON *</label>
                        <input
                          type="text"
                          required
                          value={row.attributesJson}
                          onChange={(e) => handleVariantChange(idx, 'attributesJson', e.target.value)}
                          className="w-full px-2 py-1 border border-slate-300 rounded text-slate-850 text-xs font-mono"
                          placeholder='{"color":"Black","storage":"128GB"}'
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveVariantRow(idx)}
                        disabled={variantsList.length <= 1}
                        className="mt-4 sm:mt-0 p-1.5 text-rose-500 hover:bg-rose-50 rounded cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md font-semibold cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={saveProductMutation.isPending}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-md font-bold shadow cursor-pointer disabled:opacity-50"
                >
                  {saveProductMutation.isPending ? 'Đang lưu...' : 'Lưu lại'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal Stock/Inventory Management */}
      {isStockModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Quản lý Kho: {selectedProduct.name}</h3>
              <button onClick={() => setIsStockModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs text-left">
              <div>
                <label className="block text-slate-700 font-semibold mb-2">Chọn phiên bản biến thể</label>
                <select
                  value={selectedVariantId}
                  onChange={(e) => setSelectedVariantId(Number(e.target.value) || '')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-800"
                >
                  <option value="">Chọn SKU biến thể</option>
                  {selectedProduct.variants?.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.sku} (${v.price})
                    </option>
                  ))}
                </select>
              </div>

              {selectedVariantId && (
                <div className="bg-slate-50 border border-slate-150 p-4 rounded-lg space-y-4">
                  {stockLoading ? (
                    <div className="flex items-center space-x-2 py-3 justify-center text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Đang lấy số lượng tồn kho thực tế...</span>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Số lượng hàng trong kho</label>
                        <input
                          type="number"
                          min="0"
                          value={stockQty}
                          onChange={(e) => setStockQty(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-slate-800 text-sm"
                        />
                      </div>

                      <button
                        onClick={() => updateStockMutation.mutate()}
                        disabled={updateStockMutation.isPending}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {updateStockMutation.isPending ? 'Đang lưu...' : 'Cập nhật số lượng kho'}
                      </button>
                    </>
                  )}

                  {stockSuccess && (
                    <p className="text-[10px] text-emerald-600 font-semibold flex items-center space-x-1 justify-center">
                      <Check className="h-3.5 w-3.5" />
                      <span>Cập nhật số lượng kho thành công!</span>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
