import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Category, CreateCategoryRequest, UpdateCategoryRequest, TransactionType } from '@/types';
import api from '@/lib/api';

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchCategories: () => Promise<void>;
  fetchCategoriesByType: (type: TransactionType) => Category[];
  fetchCategoryById: (id: string) => Promise<Category>;
  createCategory: (data: CreateCategoryRequest) => Promise<Category>;
  updateCategory: (id: string, data: UpdateCategoryRequest) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useCategoryStore = create<CategoryState>()(
  persist(
    (set, get) => ({
      categories: [],
      isLoading: false,
      error: null,

      fetchCategories: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get<Category[]>('/categories');
          set({ categories: response.data, isLoading: false });
        } catch (error: any) {
          const message = error.response?.data?.message || 'Erro ao buscar categorias';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      fetchCategoriesByType: (type: TransactionType) => {
        return get().categories.filter((cat) => cat.type === type);
      },

      fetchCategoryById: async (id: string) => {
        try {
          const response = await api.get<Category>(`/categories/${id}`);
          return response.data;
        } catch (error: any) {
          const message = error.response?.data?.message || 'Erro ao buscar categoria';
          set({ error: message });
          throw error;
        }
      },

      createCategory: async (data: CreateCategoryRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post<Category>('/categories', data);
          const newCategory = response.data;
          set((state) => ({
            categories: [...state.categories, newCategory],
            isLoading: false,
          }));
          return newCategory;
        } catch (error: any) {
          const message = error.response?.data?.message || 'Erro ao criar categoria';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      updateCategory: async (id: string, data: UpdateCategoryRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.patch<Category>(`/categories/${id}`, data);
          const updatedCategory = response.data;
          set((state) => ({
            categories: state.categories.map((cat) =>
              cat.id === id ? updatedCategory : cat
            ),
            isLoading: false,
          }));
          return updatedCategory;
        } catch (error: any) {
          const message = error.response?.data?.message || 'Erro ao atualizar categoria';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      deleteCategory: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          await api.delete(`/categories/${id}`);
          set((state) => ({
            categories: state.categories.filter((cat) => cat.id !== id),
            isLoading: false,
          }));
        } catch (error: any) {
          const message = error.response?.data?.message || 'Erro ao deletar categoria';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'category-storage',
      partialize: (state) => ({
        categories: state.categories,
      }),
    }
  )
);
