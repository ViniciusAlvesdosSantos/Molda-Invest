import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, AuthResponse } from '@/types';
import api from '@/lib/api';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  login: (identifier: string, otpCode: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setTokens: (accessToken: string, refreshToken: string) => {
        set({ accessToken, refreshToken, isAuthenticated: true });
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
      },

      setUser: (user: User) => {
        set({ user });
        localStorage.setItem('user', JSON.stringify(user));
      },

      login: async (identifier: string, otpCode: string) => {
        set({ isLoading: true, error: null });
        try {
          
          const response = await api.post('/auth/verify-otp', {
            identifier,
            otpCode,
          });

          const { accessToken, refreshToken, user } = response.data;

          if (typeof accessToken !== 'string' || typeof refreshToken !== 'string') {
            console.error('❌ Tokens não são strings:', { accessToken, refreshToken });
            throw new Error('Tokens inválidos recebidos da API');
          }

          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          if (user) {
            localStorage.setItem('user', JSON.stringify(user));
          }
          set({
            accessToken,
            refreshToken,
            user: user || null,
            isAuthenticated: true,
            isLoading: false,
          });
          return true;
        } catch (error: any) {
          console.error('❌ Store - Erro no login:', error);
          const errorMessage = error.response?.data?.message || error.message || 'Erro ao fazer login';
          set({ error: errorMessage, isLoading: false, isAuthenticated: false });
          throw error;
        }
      },

      logout: () => {
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
          error: null,
        });
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('auth-storage');
      },

      checkAuth: async () => {
        // ✅ Buscar do localStorage ao invés do store
        const accessToken = localStorage.getItem('accessToken');
        const userStr = localStorage.getItem('user');
        
        if (!accessToken) {
          set({ isAuthenticated: false });
          return false;
        }

        // Se tem token e usuário salvos, considera autenticado
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            set({ 
              accessToken, 
              user, 
              isAuthenticated: true 
            });
            return true;
          } catch (error) {
            console.error('❌ Erro ao parsear user:', error);
          }
        }

        // Se não tem user salvo, busca do backend
        try {
          const response = await api.get<User>('/users/me');
          set({ 
            user: response.data, 
            isAuthenticated: true,
            accessToken 
          });
          localStorage.setItem('user', JSON.stringify(response.data));
          return true;
        } catch (error) {
          console.error('❌ Erro ao buscar user do backend:', error);
          set({ isAuthenticated: false, accessToken: null });
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          return false;
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // ✅ NÃO persistir tokens - eles são salvos diretamente no localStorage
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
