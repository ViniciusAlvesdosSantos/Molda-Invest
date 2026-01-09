import { useState } from 'react';
import { useTransactionStore } from '@/stores/useTransactionStore';
import { useAccountStore } from '@/stores/useAccountStore';
import { useCategoryStore } from '@/stores/useCategoryStore';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTransactionSchema } from '@/lib/validators';
import { TransactionType } from '@/types';
import { TRANSACTION_TYPE_LABELS } from '@/lib/constants';
import { toast } from 'sonner';

interface CreateTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateTransactionModal({ 
  isOpen, 
  onClose,
  onSuccess 
}: CreateTransactionModalProps) {
  const { createTransaction } = useTransactionStore();
  const { accounts } = useAccountStore();
  const { categories } = useCategoryStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await createTransaction(data);
      toast.success('Transação criada com sucesso!');
      reset();
      onClose();
      onSuccess?.();
    } catch (error) {
      toast.error('Erro ao criar transação');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

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
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
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

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Tipo</label>
          <select
            className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            {...register('type')}
          >
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.type && (
            <span className="text-sm text-red-500">{errors.type.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Conta</label>
          <select
            className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            {...register('accountId')}
          >
            <option value="">Selecione uma conta</option>
            {accountOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.accountId && (
            <span className="text-sm text-red-500">{errors.accountId.message}</span>
          )}
        </div>

        {categoryOptions.length > 0 && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Categoria</label>
            <select
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              {...register('categoryId')}
            >
              <option value="">Selecione uma categoria</option>
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <span className="text-sm text-red-500">{errors.categoryId.message}</span>
            )}
          </div>
        )}

        <ModalFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
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
  );
}
