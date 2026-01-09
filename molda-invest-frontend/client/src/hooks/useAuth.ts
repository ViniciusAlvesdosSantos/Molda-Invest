import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuthStore } from '@/stores/useAuthStore';

export function useRequireAuth() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, checkAuth } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      
      // Primeiro verifica se tem token no localStorage
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLocation('/login');
        setIsChecking(false);
        return;
      }

      // Se tem token, tenta verificar com o backend
      try {
        const isValid = await checkAuth();
        
        if (!isValid) {
          setLocation('/login');
        }
      } catch (error) {
        console.error('❌ useRequireAuth - Erro ao verificar:', error);
        setLocation('/login');
      } finally {
        setIsChecking(false);
      }
    };

    verifyAuth();
  }, [setLocation, checkAuth]);

  if (isChecking) {
    return false;
  }

  return isAuthenticated;
}

export function useAuth() {
  return useAuthStore();
}
