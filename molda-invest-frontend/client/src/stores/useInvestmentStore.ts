import { create } from 'zustand';
import { Investment, CreateInvestmentRequest, UpdateInvestmentRequest } from '@/types';
import api from '@/lib/api';

interface InvestmentState {
  investments: Investment[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchInvestments: () => Promise<void>;
  fetchInvestmentById: (id: string) => Promise<Investment>;
  createInvestment: (data: CreateInvestmentRequest) => Promise<Investment>;
  updateInvestment: (id: string, data: UpdateInvestmentRequest) => Promise<Investment>;
  deleteInvestment: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useInvestmentStore = create<InvestmentState>((set, get) => ({
  investments: [],
  isLoading: false,
  error: null,

  fetchInvestments: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<Investment[]>('/investments');
      set({ investments: response.data, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao buscar investimentos';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  fetchInvestmentById: async (id: string) => {
    try {
      const response = await api.get<Investment>(`/investments/${id}`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao buscar investimento';
      set({ error: message });
      throw error;
    }
  },

  createInvestment: async (data: CreateInvestmentRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<Investment>('/investments', data);
      const newInvestment = response.data;
      set((state) => ({
        investments: [...state.investments, newInvestment],
        isLoading: false,
      }));
      return newInvestment;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao criar investimento';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  updateInvestment: async (id: string, data: UpdateInvestmentRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.patch<Investment>(`/investments/${id}`, data);
      const updatedInvestment = response.data;
      set((state) => ({
        investments: state.investments.map((inv) =>
          inv.id === id ? updatedInvestment : inv
        ),
        isLoading: false,
      }));
      return updatedInvestment;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao atualizar investimento';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  deleteInvestment: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/investments/${id}`);
      set((state) => ({
        investments: state.investments.filter((inv) => inv.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao deletar investimento';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
