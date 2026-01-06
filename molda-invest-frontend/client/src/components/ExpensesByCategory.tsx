import { useEffect, useState } from 'react';
import { useCategoryStore } from '@/stores/useCategoryStore';
import { useTransactionStore } from '@/stores/useTransactionStore';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { formatCurrency } from '@/lib/formatters';
import { Plus, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TransactionType } from '@/types';
import { TRANSACTION_TYPE_LABELS } from '@/lib/constants';

const createCategorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  icon: z.string().min(1, 'Ícone é obrigatório'),
  color: z.string().min(1, 'Cor é obrigatória'),
  type: z.nativeEnum(TransactionType),
  budget: z.number().min(0, 'Limite deve ser maior ou igual a 0').optional(),
});

const updateBudgetSchema = z.object({
  budget: z.number().min(0, 'Limite deve ser maior ou igual a 0'),
});

type CreateCategoryFormData = z.infer<typeof createCategorySchema>;
type UpdateBudgetFormData = z.infer<typeof updateBudgetSchema>;

export default function ExpensesByCategory() {
  const { categories, fetchCategories, createCategory, updateCategory } = useCategoryStore();
  const { transactions, fetchTransactions } = useTransactionStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    formState: { errors: errorsCreate },
    reset: resetCreate,
  } = useForm<CreateCategoryFormData>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: '',
      icon: '',
      color: '#6366f1',
      type: TransactionType.EXPENSE,
      budget: undefined,
    },
  });

  const {
    register: registerBudget,
    handleSubmit: handleSubmitBudget,
    formState: { errors: errorsBudget },
    reset: resetBudget,
    setValue: setValueBudget,
  } = useForm<UpdateBudgetFormData>({
    resolver: zodResolver(updateBudgetSchema),
    defaultValues: {
      budget: 0,
    },
  });

  useEffect(() => {
    fetchCategories();
    fetchTransactions();
  }, [fetchCategories, fetchTransactions]);

  // Atualizar quando transactions mudar
  useEffect(() => {
    // Este efeito garante que o componente re-renderize quando os dados mudarem
  }, [transactions]);

  const onSubmitCreate = async (data: CreateCategoryFormData) => {
    setIsSubmitting(true);
    try {
      await createCategory(data);
      toast.success('Categoria criada com sucesso!');
      resetCreate();
      setIsCreateModalOpen(false);
      fetchCategories();
      fetchTransactions();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao criar categoria';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitBudget = async (data: UpdateBudgetFormData) => {
    if (selectedCategory === null) return;
    
    setIsSubmitting(true);
    try {
      await updateCategory(selectedCategory, { budget: data.budget });
      toast.success('Limite atualizado com sucesso!');
      resetBudget();
      setIsBudgetModalOpen(false);
      setSelectedCategory(null);
      fetchCategories();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao atualizar limite';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenBudgetModal = (categoryId: string, currentBudget: number | null) => {
    setSelectedCategory(categoryId);
    setValueBudget('budget', currentBudget || 0);
    setIsBudgetModalOpen(true);
  };

  const typeOptions = Object.entries(TRANSACTION_TYPE_LABELS).map(([value, label]) => ({
    value: value as string,
    label: label as string,
  }));

  // Calcular gastos por categoria baseado nas transações
  const categoryExpenses = categories.map((category) => {
    // Filtrar apenas transações de DESPESA (EXPENSE) desta categoria
    const categoryTransactions = transactions.filter(
      (transaction) => 
        transaction.categoryId === category.id && 
        transaction.type === TransactionType.EXPENSE
    );
    
    // Somar o total de gastos
    const total = categoryTransactions.reduce((sum, transaction) => sum + Number(transaction.amount), 0);
    
    return {
      ...category,
      total,
      transactionCount: categoryTransactions.length,
    };
  }).sort((a, b) => b.total - a.total); // Ordenar por valor decrescente

  const totalExpenses = categoryExpenses.reduce((sum, cat) => sum + cat.total, 0);
  
  // Separar categorias com e sem gastos
  const categoriesWithExpenses = categoryExpenses.filter((cat) => cat.total > 0);
  const categoriesWithoutExpenses = categoryExpenses.filter((cat) => cat.total === 0);

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle>Gastos por Categoria</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Nova categoria
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden flex flex-col">
          {categories.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhuma categoria encontrada
            </p>
          ) : (
            <div className="flex-1 overflow-y-auto pr-2 space-y-3" style={{ maxHeight: '400px' }}>
              {/* Categorias com gastos */}
              {categoriesWithExpenses.map((category) => {
                const percentage = totalExpenses > 0 ? (category.total / totalExpenses) * 100 : 0;
                const hasBudget = category.budget && category.budget > 0;
                const budgetPercentage = hasBudget ? (category.total / category.budget!) * 100 : 0;
                const isOverBudget = hasBudget && budgetPercentage > 100;
                const isNearBudget = hasBudget && budgetPercentage > 80 && budgetPercentage <= 100;
                
                return (
                  <div key={category.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-2xl">{category.icon}</span>
                        <div className="flex-1">
                          <p className="font-medium text-sm text-foreground">{category.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>
                              {percentage.toFixed(1)}% · {category.transactionCount} {category.transactionCount === 1 ? 'transação' : 'transações'}
                            </span>
                            {hasBudget && (
                              <span className={`font-medium ${
                                isOverBudget ? 'text-red-600' : 
                                isNearBudget ? 'text-yellow-600' : 
                                'text-green-600'
                              }`}>
                                • {budgetPercentage.toFixed(0)}% do limite
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenBudgetModal(category.id, category.budget)}
                          title="Editar limite"
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">{formatCurrency(category.total)}</p>
                          {hasBudget && (
                            <p className="text-xs text-muted-foreground">
                              de {formatCurrency(category.budget || 0)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Barra de progresso do limite */}
                    {hasBudget ? (
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            isOverBudget ? 'bg-red-500' : 
                            isNearBudget ? 'bg-yellow-500' : 
                            'bg-green-500'
                          }`}
                          style={{
                            width: `${Math.min(budgetPercentage, 100)}%`,
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: category.color || '#6366f1',
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
              
              {/* Categorias sem gastos */}
              {categoriesWithoutExpenses.length > 0 && categoriesWithExpenses.length > 0 && (
                <div className="pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">Sem gastos:</p>
                </div>
              )}
              
              {categoriesWithoutExpenses.map((category) => (
                <div key={category.id} className="opacity-60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{category.icon}</span>
                      <div>
                        <p className="font-medium text-sm text-foreground">{category.name}</p>
                        <p className="text-xs text-muted-foreground">0%</p>
                      </div>
                    </div>
                    <p className="font-semibold text-muted-foreground">{formatCurrency(0)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {categoriesWithExpenses.length > 0 && (
            <div className="flex-shrink-0 mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-foreground">Total</p>
                <p className="font-bold text-lg text-foreground">{formatCurrency(totalExpenses)}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Category Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetCreate();
        }}
        title="Nova Categoria"
        size="md"
      >
        <form onSubmit={handleSubmitCreate(onSubmitCreate)} className="space-y-4">
          <Input
            label="Nome"
            placeholder="Ex: Alimentação"
            error={errorsCreate.name}
            {...registerCreate('name')}
          />

          <Input
            label="Ícone (Emoji)"
            placeholder="🍔"
            maxLength={2}
            error={errorsCreate.icon}
            {...registerCreate('icon')}
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Cor</label>
            <input
              type="color"
              className="w-full h-10 border border-input rounded-lg cursor-pointer"
              {...registerCreate('color')}
            />
            {errorsCreate.color && (
              <span className="text-sm text-red-500">{errorsCreate.color.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Tipo</label>
            <select
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              {...registerCreate('type')}
            >
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errorsCreate.type && (
              <span className="text-sm text-red-500">{errorsCreate.type.message}</span>
            )}
          </div>

          <Input
            label="Limite de Gasto (Opcional)"
            placeholder="Ex: 1000.00"
            type="number"
            step="0.01"
            min="0"
            error={errorsCreate.budget}
            {...registerCreate('budget', { valueAsNumber: true })}
          />

          <ModalFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsCreateModalOpen(false);
                resetCreate();
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
            >
              Criar Categoria
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Edit Budget Modal */}
      <Modal
        isOpen={isBudgetModalOpen}
        onClose={() => {
          setIsBudgetModalOpen(false);
          setSelectedCategory(null);
          resetBudget();
        }}
        title="Editar Limite de Gasto"
        size="sm"
      >
        <form onSubmit={handleSubmitBudget(onSubmitBudget)} className="space-y-4">
          <Input
            label="Limite de Gasto"
            placeholder="Ex: 1000.00"
            type="number"
            step="0.01"
            min="0"
            error={errorsBudget.budget}
            {...registerBudget('budget', { valueAsNumber: true })}
          />
          
          <p className="text-sm text-muted-foreground">
            Defina quanto você quer gastar no máximo nesta categoria. 
            A barra de progresso mostrará seu consumo em relação ao limite.
          </p>

          <ModalFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsBudgetModalOpen(false);
                setSelectedCategory(null);
                resetBudget();
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
            >
              Salvar Limite
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </>
  );
}
