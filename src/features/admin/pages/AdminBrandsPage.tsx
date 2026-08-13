import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../api/client';
import { Loader2, Plus, Edit, Trash2, X } from 'lucide-react';

interface BrandResponse {
  id: number;
  name: string;
  description: string;
  logoUrl: string | null;
  createdAt: string;
}

export const AdminBrandsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandResponse | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  // 1. Fetch Brands
  const { data: brands, isLoading } = useQuery<BrandResponse[]>({
    queryKey: ['admin-brands'],
    queryFn: () => apiClient.get('/api/v1/brands').then((r) => r.data),
  });

  // 2. Save Brand mutation (Create / Update)
  const saveBrandMutation = useMutation({
    mutationFn: () => {
      const payload = { name, description, logoUrl: logoUrl.trim() || null };
      if (editingBrand) {
        return apiClient.put(`/api/v1/admin/brands/${editingBrand.id}`, payload);
      } else {
        return apiClient.post('/api/v1/admin/brands', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-brands'] });
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  // 3. Delete Brand mutation
  const deleteBrandMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/api/v1/admin/brands/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-brands'] });
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
  });

  const resetForm = () => {
    setEditingBrand(null);
    setName('');
    setDescription('');
    setLogoUrl('');
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (b: BrandResponse) => {
    setEditingBrand(b);
    setName(b.name);
    setDescription(b.description || '');
    setLogoUrl(b.logoUrl || '');
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thương hiệu này không?')) {
      deleteBrandMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[40svh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
        <p className="text-slate-500 font-medium text-sm">Đang tải danh sách thương hiệu...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Quản lý Thương hiệu</h2>
          <p className="text-slate-500 text-xs mt-1">Danh sách thương hiệu đối tác cung cấp thiết bị công nghệ.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center space-x-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-md text-xs font-bold shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Thêm thương hiệu</span>
        </button>
      </div>

      {/* Brands Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50 text-slate-500 font-semibold text-xs text-left">
            <tr>
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Logo</th>
              <th className="px-6 py-3">Tên thương hiệu</th>
              <th className="px-6 py-3">Mô tả</th>
              <th className="px-6 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {brands?.map((b) => (
              <tr key={b.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4 font-mono text-slate-500">{b.id}</td>
                <td className="px-6 py-4">
                  <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                    {b.name.slice(0, 2).toUpperCase()}
                  </div>
                </td>
                <td className="px-6 py-4 font-bold text-slate-900">{b.name}</td>
                <td className="px-6 py-4 text-xs max-w-xs truncate">{b.description || 'Không có mô tả'}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => openEditModal(b)}
                    className="p-1.5 border border-slate-200 text-amber-600 hover:bg-amber-50 rounded-md transition-colors cursor-pointer inline-flex"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="p-1.5 border border-slate-200 text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer inline-flex"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {(!brands || brands.length === 0) && (
              <tr>
                <td colSpan={5} className="text-center py-10 text-slate-400">
                  Chưa có thương hiệu nào được tạo.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {editingBrand ? 'Chỉnh sửa thương hiệu' : 'Thêm thương hiệu mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveBrandMutation.mutate();
              }}
              className="p-6 space-y-4 text-xs"
            >
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Tên thương hiệu *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-800 text-xs"
                  placeholder="Ví dụ: Apple, ASUS"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">URL Logo (Tùy chọn)</label>
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-800 text-xs"
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Mô tả chi tiết</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-800 text-xs"
                  placeholder="Mô tả tóm tắt về thương hiệu..."
                />
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md font-semibold cursor-pointer text-xs"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={saveBrandMutation.isPending}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-md font-bold shadow cursor-pointer disabled:opacity-50 text-xs"
                >
                  {saveBrandMutation.isPending ? 'Đang lưu...' : 'Lưu lại'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
