import { useEffect, useState } from 'react';
import { useRequireAuth } from '@/hooks/useAuth';
import { useTransactionStore } from '@/stores/useTransactionStore';
import { useAccountStore } from '@/stores/useAccountStore';
import { useCategoryStore } from '@/stores/useCategoryStore';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Modal, ModalContent, ModalFooter } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { TransactionType } from '@/types';
import { TRANSACTION_TYPE_LABELS } from '@/lib/constants';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTransactionSchema } from '@/lib/validators';

export default function Transactions() {
  const isAuthenticated = useRequireAuth();
  const [, setLocation] = useLocation();
  const { transactions, fetchTransactions, createTransaction, deleteTransaction, isLoading } = useTransactionStore();
  const { accounts, fetchAccounts } = useAccountStore();
  const { categories, fetchCategories } = useCategoryStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState<TransactionType | ''>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      description: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      type: TransactionType.EXPENSE,
      accountId: '',
    },
  });

  const transactionType = watch('type');

  useEffect(() => {
    if (isAuthenticated) {
      Promise.all([fetchTransactions(), fetchAccounts(), fetchCategories()]);
    }
  }, [isAuthenticated]);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await createTransaction(data);
      toast.success('Transação criada com sucesso!');
      setIsModalOpen(false);
      reset();
    } catch (error) {
      toast.error('Erro ao criar transação');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja deletar esta transação?')) {
      try {
        await deleteTransaction(id);
        toast.success('Transação deletada com sucesso!');
      } catch (error) {
        toast.error('Erro ao deletar transação');
      }
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  const filteredTransactions = selectedType
    ? transactions.filter((t) => t.type === selectedType)
    : transactions;

  const accountOptions = accounts.map((acc) => ({
    value: acc.id as string,
    label: acc.accountName as string,
  }));

  const typeOptions = Object.entries(TRANSACTION_TYPE_LABELS).map(([value, label]) => ({
    value: value as string,
    label: label as string,
  }));

  const categoryOptions = categories
    .filter((cat) => !transactionType || cat.type === transactionType)
    .map((cat) => ({
      value: cat.id as string,
      label: cat.name as string,
    }));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container flex items-center justify-between h-16">
          <h1 className="text-2xl font-bold text-foreground">Transações</h1>
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            Nova Transação
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4 flex-wrap">
            <Select
              options={[
                { value: '', label: 'Todos os tipos' },
                ...typeOptions,
              ] as any}
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="flex-1 min-w-[200px]"
            />
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {filteredTransactions.length} Transações
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground text-center py-8">Carregando transações...</p>
            ) : filteredTransactions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Nenhuma transação encontrada</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Data</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Descrição</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Conta</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Tipo</th>
                      <th className="text-right py-3 px-4 font-semibold text-foreground">Valor</th>
                      <th className="text-right py-3 px-4 font-semibold text-foreground">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction) => {
                      const account = accounts.find((a) => a.id === transaction.accountId);
                      return (
                        <tr key={transaction.id} className="border-b border-border hover:bg-muted transition-colors">
                          <td className="py-3 px-4 text-foreground">{formatDate(transaction.date)}</td>
                          <td className="py-3 px-4 text-foreground">{transaction.description}</td>
                          <td className="py-3 px-4 text-foreground">{account?.accountName}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                              {TRANSACTION_TYPE_LABELS[transaction.type as TransactionType]}
                            </span>
                          </td>
                          <td className={`py-3 px-4 text-right font-semibold ${transaction.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.type === TransactionType.INCOME ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleDelete(transaction.id)}
                              className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Create Transaction Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          reset();
        }}
        title="Nova Transação"
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Descrição"
            placeholder="Ex: Compra no supermercado"
            error={errors.description}
            {...register('description')}
          />

          <Input
            label="Valor"
            type="number"
            placeholder="0,00"
            step="0.01"
            min="0"
            error={errors.amount}
            {...register('amount', { valueAsNumber: true })}
          />

          <Input
            label="Data"
            type="date"
            error={errors.date}
            {...register('date')}
          />

          <Select
            label="Tipo"
            options={typeOptions as any}
            error={errors.type}
            {...register('type')}
          />

          <Select
            label="Conta"
            options={accountOptions as any}
            placeholder="Selecione uma conta"
            error={errors.accountId}
            {...register('accountId')}
          />

          {categoryOptions.length > 0 && (
            <Select
              label="Categoria"
              options={categoryOptions as any}
              placeholder="Selecione uma categoria"
              error={errors.categoryId}
              {...register('categoryId')}
            />
          )}

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
              Criar Transação
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
