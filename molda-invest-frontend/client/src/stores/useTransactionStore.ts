import { create } from 'zustand';
import { Transaction, CreateTransactionRequest, UpdateTransactionRequest, TransactionFilters, ExpenseByCategory } from '@/types';
import api from '@/lib/api';

interface TransactionState {
  transactions: Transaction[];
  expensesByCategory: ExpenseByCategory[];
  filters: TransactionFilters;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchTransactions: (filters?: TransactionFilters) => Promise<void>;
  fetchTransactionById: (id: string) => Promise<Transaction>;
  fetchExpensesByCategory: (startDate?: string, endDate?: string) => Promise<void>;
  createTransaction: (data: CreateTransactionRequest) => Promise<Transaction>;
  updateTransaction: (id: string, data: UpdateTransactionRequest) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;
  deleteMultipleTransactions: (ids: string[]) => Promise<void>;
  setFilters: (filters: TransactionFilters) => void;
  clearError: () => void;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  expensesByCategory: [],
  filters: {},
  isLoading: false,
  error: null,

  fetchTransactions: async (filters?: TransactionFilters) => {
    set({ isLoading: true, error: null });
    try {
      const params = filters || get().filters;
      const response = await api.get<Transaction[]>('/transactions', { params });
      set({ transactions: response.data, filters: params, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao buscar transações';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  fetchTransactionById: async (id: string) => {
    try {
      const response = await api.get<Transaction>(`/transactions/${id}`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao buscar transação';
      set({ error: message });
      throw error;
    }
  },

  fetchExpensesByCategory: async (startDate?: string, endDate?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<ExpenseByCategory[]>('/transactions/expenses-by-category', {
        params: { startDate, endDate },
      });
      set({ expensesByCategory: response.data, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao buscar despesas por categoria';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  createTransaction: async (data: CreateTransactionRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<Transaction>('/transactions', data);
      const newTransaction = response.data;
      set((state) => ({
        transactions: [newTransaction, ...state.transactions],
        isLoading: false,
      }));
      return newTransaction;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao criar transação';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  updateTransaction: async (id: string, data: UpdateTransactionRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.patch<Transaction>(`/transactions/${id}`, data);
      const updatedTransaction = response.data;
      set((state) => ({
        transactions: state.transactions.map((t) =>
          t.id === id ? updatedTransaction : t
        ),
        isLoading: false,
      }));
      return updatedTransaction;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao atualizar transação';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  deleteTransaction: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/transactions/${id}`);
      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao deletar transação';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  deleteMultipleTransactions: async (ids: string[]) => {
    set({ isLoading: true, error: null });
    try {
      await Promise.all(ids.map((id) => api.delete(`/transactions/${id}`)));
      set((state) => ({
        transactions: state.transactions.filter((t) => !ids.includes(t.id)),
        isLoading: false,
      }));
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao deletar transações';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  setFilters: (filters: TransactionFilters) => {
    set({ filters });
  },

  clearError: () => {
    set({ error: null });
  },
}));
