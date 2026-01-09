import { useEffect, useState } from 'react';
import { useRequireAuth } from '@/hooks/useAuth';
import { useAccountStore } from '@/stores/useAccountStore';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Modal, ModalContent, ModalFooter } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { formatCurrency } from '@/lib/formatters';
import { ACCOUNT_COLORS, ACCOUNT_ICONS } from '@/lib/constants';
import { Plus, ArrowRight, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createAccountSchema, type CreateAccountFormData } from '@/lib/validators';
import CreateTransactionModal from '@/components/ui/CreateTransactionModal';
import Header from '@/components/Header';

export default function Accounts() {
  const isAuthenticated = useRequireAuth();
  const [, setLocation] = useLocation();
  const { accounts, fetchAccounts, createAccount, deleteAccount, isLoading } = useAccountStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      accountName: '',
      balance: 0,
      color: ACCOUNT_COLORS[0].value,
      icon: ACCOUNT_ICONS[0].icon,
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchAccounts();
    }
  }, [isAuthenticated]);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await createAccount(data);
      toast.success('Conta criada com sucesso!');
      setIsModalOpen(false);
      reset();
    } catch (error) {
      toast.error('Erro ao criar conta');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja deletar esta conta?')) {
      try {
        await deleteAccount(id);
        toast.success('Conta deletada com sucesso!');
      } catch (error) {
        toast.error('Erro ao deletar conta');
      }
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showBalance={true} />

      {/* Main Content */}
      <main className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Contas</h1>
            <p className="text-muted-foreground mt-1">Gerencie suas contas bancárias</p>
          </div>
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
        >
          Nova Conta
        </Button>
      </div>

      {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Carregando contas...</p>
          </div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Nenhuma conta criada ainda</p>
            <Button
              variant="primary"
              onClick={() => setIsModalOpen(true)}
            >
              Criar Primeira Conta
            </Button>
            <Button 
              variant='secondary'
              onClick={() => setIsModalOpen(true)}>
              Adicionar Transação
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account) => (
              <Card key={account.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-xl"
                      style={{ backgroundColor: account.color + '20' }}
                    >
                      {account.icon || '💰'}
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => handleDelete(account.id)}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-semibold text-foreground mb-1">{account.accountName}</h3>
                  <p className="text-2xl font-bold text-foreground mb-4">
                    {formatCurrency(account.balance)}
                  </p>

                  <Button
                    variant="ghost"
                    className="w-full justify-between"
                    onClick={() => setLocation(`/accounts/${account.id}`)}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Ver Detalhes
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Create Account Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          reset();
        }}
        title="Nova Conta"
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nome da Conta"
            placeholder="Ex: Salário, Poupança"
            error={errors.accountName}
            {...register('accountName')}
          />

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Cor
            </label>
            <div className="grid grid-cols-5 gap-2">
              {ACCOUNT_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  className="w-8 h-8 rounded-lg border-2 border-transparent hover:border-foreground transition-colors"
                  style={{ backgroundColor: color.value }}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Ícone
            </label>
            <div className="grid grid-cols-5 gap-2">
              {ACCOUNT_ICONS.map((icon) => (
                <button
                  key={icon.value}
                  type="button"
                  className="p-2 rounded-lg border border-border hover:bg-muted transition-colors text-xl"
                  title={icon.label}
                >
                  {icon.icon}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Saldo Inicial"
            type="number"
            placeholder="0,00"
            step="0.01"
            min="0"
            error={errors.balance}
            {...register('balance', { valueAsNumber: true })}
          />

          <ModalFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                reset();
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
            >
              Criar Conta
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      <CreateTransactionModal
      isOpen={isModalOpen}
      onClose={()=> setIsModalOpen(false)}
      
      />
    </div>
  );
}
