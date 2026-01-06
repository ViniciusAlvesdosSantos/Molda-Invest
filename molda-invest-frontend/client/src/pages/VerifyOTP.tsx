import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { set, z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import api from '@/lib/api';
import { Shield } from 'lucide-react';

const otpSchema = z.object({
  otpCode: z.string()
    .min(6, 'Código deve ter 6 dígitos')
    .max(6, 'Código deve ter 6 dígitos')
    .regex(/^\d+$/, 'Apenas números'),
});

type OtpFormData = z.infer<typeof otpSchema>;

export default function VerifyOtp() {
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [identifier, setIdentifier] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
  });

  useEffect(() => {
    // Pegar o identificador do sessionStorage
    const storedIdentifier = sessionStorage.getItem('loginIdentifier');
    if (!storedIdentifier) {
      toast.error('Sessão expirada. Faça login novamente.');
      setLocation('/login');
      return;
    }
    setIdentifier(storedIdentifier);
  }, [setLocation]);

  const onSubmit = async (data: OtpFormData) => {
    setIsSubmitting(true);
    try {
      const response = await api.post('/auth/verify-otp', {
        identifier,
        otpCode: data.otpCode,
      });
      
      const { accessToken, refreshToken } = response.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken); 
      sessionStorage.removeItem('loginIdentifier');
      
      toast.success('Login realizado com sucesso!');

      setLocation('/dashboard');
      
      
    } catch (error: any) {
      const message = error.response?.data?.message || 'Código inválido';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    try {
      await api.post('/auth/request-login', { identifier });
      toast.success('Novo código enviado para seu email!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao reenviar código';
      toast.error(message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="w-12 h-12 text-indigo-600" />
          </div>
          <CardTitle className="text-2xl">Verificação de Código</CardTitle>
          <CardDescription>
            Digite o código de 6 dígitos enviado para seu email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Código OTP"
              placeholder="000000"
              maxLength={6}
              error={errors.otpCode}
              className="text-center text-2xl tracking-widest"
              {...register('otpCode')}
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isSubmitting}
            >
              {isSubmitting ? 'Verificando...' : 'Verificar Código'}
            </Button>

            <div className="space-y-2">
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={handleResendOtp}
                isLoading={isResending}
              >
                {isResending ? 'Reenviando...' : 'Reenviar Código'}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  sessionStorage.removeItem('loginIdentifier');
                  setLocation('/login');
                }}
              >
                Voltar para Login
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>O código expira em 10 minutos</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
