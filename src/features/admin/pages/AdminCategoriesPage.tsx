import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../api/client';
import { Loader2, Plus, Edit, Trash2, X } from 'lucide-react';

interface CategoryResponse {
  id: number;
  name: string;
  description: string;
  slug: string;
  parentCategoryId: number | null;
  parentCategoryName: string | null;
}

export const AdminCategoriesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryResponse | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [parentCategoryId, setParentCategoryId] = useState<string>('');

  // 1. Fetch Categories
  const { data: categories, isLoading } = useQuery<CategoryResponse[]>({
    queryKey: ['admin-categories'],
    queryFn: () => apiClient.get('/api/v1/categories').then((r) => r.data),
  });

  // 2. Save Category mutation
  const saveCategoryMutation = useMutation({
    mutationFn: () => {
      const payload = {
        name,
        slug: slug.trim() || undefined,
        description,
        parentCategoryId: parentCategoryId ? Number(parentCategoryId) : null,
      };
      if (editingCategory) {
        return apiClient.put(`/api/v1/admin/categories/${editingCategory.id}`, payload);
      } else {
        return apiClient.post('/api/v1/admin/categories', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  // 3. Delete Category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/api/v1/admin/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const resetForm = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setParentCategoryId('');
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (c: CategoryResponse) => {
    setEditingCategory(c);
    setName(c.name);
    setSlug(c.slug || '');
    setDescription(c.description || '');
    setParentCategoryId(c.parentCategoryId ? String(c.parentCategoryId) : '');
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này không? Các sản phẩm thuộc danh mục sẽ cần được gán lại.')) {
      deleteCategoryMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[40svh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
        <p className="text-slate-500 font-medium text-sm">Đang tải danh sách loại sản phẩm...</p>
      </div>
    );
  }

  // Filter out the editing category from parent options to avoid self-reference loop
  const parentOptions = categories?.filter((c) => !editingCategory || c.id !== editingCategory.id) ?? [];

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Quản lý Loại sản phẩm (Danh mục)</h2>
          <p className="text-slate-500 text-xs mt-1">Danh mục phân loại sản phẩm như Laptop, Điện thoại, Phụ kiện...</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center space-x-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-md text-xs font-bold shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Thêm danh mục</span>
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50 text-slate-500 font-semibold text-xs text-left">
            <tr>
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Tên danh mục</th>
              <th className="px-6 py-3">Slug</th>
              <th className="px-6 py-3">Danh mục cha</th>
              <th className="px-6 py-3">Mô tả</th>
              <th className="px-6 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {categories?.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4 font-mono text-slate-500">{c.id}</td>
                <td className="px-6 py-4 font-bold text-slate-900">{c.name}</td>
                <td className="px-6 py-4 font-mono text-xs text-slate-500">{c.slug}</td>
                <td className="px-6 py-4">
                  {c.parentCategoryName ? (
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 text-[10px] rounded font-semibold">
                      {c.parentCategoryName}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs">-</span>
                  )}
                </td>
                <td className="px-6 py-4 text-xs max-w-xs truncate">{c.description || 'Không có mô tả'}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => openEditModal(c)}
                    className="p-1.5 border border-slate-200 text-amber-600 hover:bg-amber-50 rounded-md transition-colors cursor-pointer inline-flex"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-1.5 border border-slate-200 text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer inline-flex"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {(!categories || categories.length === 0) && (
              <tr>
                <td colSpan={6} className="text-center py-10 text-slate-400">
                  Chưa có danh mục nào được tạo.
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
                {editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveCategoryMutation.mutate();
              }}
              className="p-6 space-y-4 text-xs"
            >
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Tên danh mục *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    // Simple auto-slug generator
                    if (!editingCategory) {
                      setSlug(
                        e.target.value
                          .toLowerCase()
                          .normalize('NFD')
                          .replace(/[\u0300-\u036f]/g, '')
                          .replace(/[đĐ]/g, 'd')
                          .replace(/[^a-z0-9\s-]/g, '')
                          .replace(/\s+/g, '-')
                      );
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-800 text-xs"
                  placeholder="Ví dụ: Laptop Gaming, Tai nghe"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Slug (Đường dẫn tĩnh) *</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-800 text-xs font-mono"
                  placeholder="laptop-gaming"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Danh mục cha (Tùy chọn)</label>
                <select
                  value={parentCategoryId}
                  onChange={(e) => setParentCategoryId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-800 text-xs"
                >
                  <option value="">Không có (Danh mục cấp cao nhất)</option>
                  {parentOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Mô tả chi tiết</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-800 text-xs"
                  placeholder="Mô tả tóm tắt về loại sản phẩm..."
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
                  disabled={saveCategoryMutation.isPending}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-md font-bold shadow cursor-pointer disabled:opacity-50 text-xs"
                >
                  {saveCategoryMutation.isPending ? 'Đang lưu...' : 'Lưu lại'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
