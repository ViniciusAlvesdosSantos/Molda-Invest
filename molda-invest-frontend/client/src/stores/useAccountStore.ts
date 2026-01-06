import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Account, CreateAccountRequest, UpdateAccountRequest } from '@/types';
import api from '@/lib/api';

interface AccountState {
  accounts: Account[];
  selectedAccount: Account | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchAccounts: () => Promise<void>;
  fetchAccountById: (id: string) => Promise<Account>;
  createAccount: (data: CreateAccountRequest) => Promise<Account>;
  updateAccount: (id: string, data: UpdateAccountRequest) => Promise<Account>;
  deleteAccount: (id: string) => Promise<void>;
  selectAccount: (account: Account | null) => void;
  clearError: () => void;
}

export const useAccountStore = create<AccountState>()(
  persist(
    (set, get) => ({
      accounts: [],
      selectedAccount: null,
      isLoading: false,
      error: null,


      fetchAccounts: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get<Account[]>('/accounts');
          set({ accounts: response.data, isLoading: false });
        } catch (error: any) {
          const message = error.response?.data?.message || 'Erro ao buscar contas';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      fetchAccountById: async (id: string) => {
        try {
          const response = await api.get<Account>(`/accounts/${id}`);
          return response.data;
        } catch (error: any) {
          const message = error.response?.data?.message || 'Erro ao buscar conta';
          set({ error: message });
          throw error;
        }
      },

      createAccount: async (data: CreateAccountRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post<Account>('/accounts', data);
          const newAccount = response.data;
          set((state) => ({
            accounts: [...state.accounts, newAccount],
            isLoading: false,
          }));
          return newAccount;
        } catch (error: any) {
          const message = error.response?.data?.message || 'Erro ao criar conta';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      updateAccount: async (id: string, data: UpdateAccountRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.patch<Account>(`/accounts/${id}`, data);
          const updatedAccount = response.data;
          set((state) => ({
            accounts: state.accounts.map((acc) =>
              acc.id === id ? updatedAccount : acc
            ),
            selectedAccount:
              state.selectedAccount?.id === id ? updatedAccount : state.selectedAccount,
            isLoading: false,
          }));
          return updatedAccount;
        } catch (error: any) {
          const message = error.response?.data?.message || 'Erro ao atualizar conta';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      deleteAccount: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          await api.delete(`/accounts/${id}`);
          set((state) => ({
            accounts: state.accounts.filter((acc) => acc.id !== id),
            selectedAccount:
              state.selectedAccount?.id === id ? null : state.selectedAccount,
            isLoading: false,
          }));
        } catch (error: any) {
          const message = error.response?.data?.message || 'Erro ao deletar conta';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      selectAccount: (account: Account | null) => {
        set({ selectedAccount: account });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'account-storage',
      partialize: (state) => ({
        accounts: state.accounts,
        selectedAccount: state.selectedAccount,
      }),
    }
  )
);
