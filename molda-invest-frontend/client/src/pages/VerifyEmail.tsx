import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import api from '@/lib/api';

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Pegar o token da URL
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');

        if (!token) {
          setStatus('error');
          setMessage('Token de verificação não encontrado');
          return;
        }

        // Enviar para o backend
        const response = await api.post(`/auth/verify-email?token=${token}`);
        
        setStatus('success');
        setMessage(response.data.message || 'Email verificado com sucesso!');
        toast.success('Email verificado! Você pode fazer login agora.');

        // Redirecionar para login após 3 segundos
        setTimeout(() => {
          setLocation('/login');
        }, 3000);

      } catch (error: any) {
        setStatus('error');
        const errorMessage = error.response?.data?.message || 'Erro ao verificar email';
        setMessage(errorMessage);
        toast.error(errorMessage);
      }
    };

    verifyEmail();
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === 'loading' && (
              <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle className="w-16 h-16 text-green-600" />
            )}
            {status === 'error' && (
              <XCircle className="w-16 h-16 text-red-600" />
            )}
          </div>

          <CardTitle className="text-2xl">
            {status === 'loading' && 'Verificando Email...'}
            {status === 'success' && 'Email Verificado!'}
            {status === 'error' && 'Erro na Verificação'}
          </CardTitle>

          <CardDescription>
            {status === 'loading' && 'Por favor, aguarde enquanto verificamos seu email.'}
            {message}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {status === 'success' && (
            <div className="text-center text-sm text-muted-foreground">
              <p>Redirecionando para o login em 3 segundos...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => setLocation('/login')}
              >
                Ir para Login
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setLocation('/register')}
              >
                Voltar para Registro
              </Button>
            </div>
          )}

          {status === 'success' && (
            <Button
              variant="primary"
              className="w-full"
              onClick={() => setLocation('/login')}
            >
              Ir para Login Agora
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}