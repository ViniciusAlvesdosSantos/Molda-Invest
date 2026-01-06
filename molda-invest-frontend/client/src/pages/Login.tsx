import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { loginSchema, type LoginFormData } from '@/lib/validators';
import { maskCPF } from '@/lib/formatters';
import api from '@/lib/api';
import { Mail } from 'lucide-react';

export default function Login() {
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      console.log(data)
      await api.post('/auth/request-login', data);
      // Redirect to OTP verification
      sessionStorage.setItem('loginIdentifier', data.identifier);
      setLocation('/auth/verify-otp')
      toast.success('Código OTP enviado para seu email!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao fazer login';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Molda Invest</CardTitle>
          <CardDescription>
            Faça login com email ou CPF
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email ou CPF"
              placeholder="seu@email.com ou 000.000.000-00"
              icon={<Mail className="w-4 h-4" />}
              error={errors.identifier}
              mask={(value) => {
                // Se parece com CPF (números com pontos/hífens), aplica máscara de CPF
                if (value.replace(/\D/g, '').length > 5) {
                  return maskCPF(value);
                }
                return value;
              }}
              {...register('identifier')}
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isSubmitting}
            >
              {isSubmitting ? 'Enviando...' : 'Fazer Login'}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Não tem conta?{' '}
              <button
                type="button"
                onClick={() => setLocation('/register')}
                className="text-indigo-600 hover:underline font-medium"
              >
                Registre-se
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
