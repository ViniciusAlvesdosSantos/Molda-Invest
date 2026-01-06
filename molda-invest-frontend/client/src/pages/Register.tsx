import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { registerSchema, type RegisterFormData } from '@/lib/validators';
import { maskCPF, maskPhone, unmaskCPF, unmaskPhone } from '@/lib/formatters';
import api from '@/lib/api';
import { Mail, User, FileText, Phone } from 'lucide-react';
import { email } from 'zod';

export default function Register() {
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      const cleanCpf = unmaskCPF(data.cpf)
      const cleanPhone = unmaskPhone(data.phone)
      await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        cpf: cleanCpf,
        phone: cleanPhone,
      })
      setRegisteredEmail(data.email)
      setShowVerificationMessage(true)
      toast.success('Registro realizado! Verifique seu email para continuar.')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao registrar'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  };

  const resendEmail = async (registeredEmail: string) => {
    try {
      await api.post('auth/resend-verification', { email: registeredEmail })
      toast.success('Email re-enviado')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao registrar';
      toast.error(message);
    }
  }

  if (showVerificationMessage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Verifique seu Email</CardTitle>
            <CardDescription>
              Enviamos um link de confirmação para {registeredEmail}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              <p className="mb-4">Clique no link no email para verificar sua conta.</p>
              <p className="mb-6">Não recebeu o email?</p>
            </div>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => {
                resendEmail(registeredEmail);
              }}
            >
              Enviar novamente
            </Button>
            <Button
              variant="primary"
              className="w-full"
              onClick={() => setLocation('/login')}
            >
              Ir para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Criar Conta</CardTitle>
          <CardDescription>
            Preencha os dados abaixo para se registrar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Nome Completo"
              placeholder="João Silva"
              icon={<User className="w-4 h-4" />}
              error={errors.name}
              {...register('name')}
            />

            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              icon={<Mail className="w-4 h-4" />}
              error={errors.email}
              {...register('email')}
            />

            <Input
              label="CPF"
              placeholder="000.000.000-00"
              icon={<FileText className="w-4 h-4" />}
              error={errors.cpf}
              mask={maskCPF}
              {...register('cpf')}
            />

            <Input
              label="Telefone"
              placeholder="(11) 98765-4321"
              icon={<Phone className="w-4 h-4" />}
              error={errors.phone}
              mask={maskPhone}
              {...register('phone')}
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isSubmitting}
            >
              {isSubmitting ? 'Registrando...' : 'Registrar'}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Já tem conta?{' '}
              <button
                type="button"
                onClick={() => setLocation('/login')}
                className="text-indigo-600 hover:underline font-medium"
              >
                Faça login
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
