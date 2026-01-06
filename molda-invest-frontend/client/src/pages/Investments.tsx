import { useEffect, useState } from 'react';
import { useRequireAuth } from '@/hooks/useAuth';
import { useInvestmentStore } from '@/stores/useInvestmentStore';
import { useAccountStore } from '@/stores/useAccountStore';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Modal, ModalContent, ModalFooter } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { formatCurrency, formatDate, formatPercentage } from '@/lib/formatters';
import { InvestmentType } from '@/types';
import { INVESTMENT_TYPE_LABELS, INVESTMENT_TYPE_COLORS } from '@/lib/constants';
import { Plus, TrendingUp, DollarSign, Percent, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createInvestmentSchema } from '@/lib/validators';

export default function Investments() {
  const isAuthenticated = useRequireAuth();
  const { investments, fetchInvestments, createInvestment, isLoading } = useInvestmentStore();
  const { accounts, fetchAccounts } = useAccountStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(createInvestmentSchema),
    defaultValues: {
      name: '',
      type: InvestmentType.FIXED_INCOME,
      initialValue: 0,
      currentValue: 0,
      profitability: 0,
      accountId: '',
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      Promise.all([fetchInvestments(), fetchAccounts()]);
    }
  }, [isAuthenticated]);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await createInvestment(data);
      toast.success('Investimento criado com sucesso!');
      setIsModalOpen(false);
      reset();
    } catch (error) {
      toast.error('Erro ao criar investimento');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  const totalInvested = investments.reduce((sum, inv) => sum + inv.initialValue, 0);
  const totalCurrentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalProfit = totalCurrentValue - totalInvested;
  const averageProfitability =
    investments.length > 0
      ? investments.reduce((sum, inv) => sum + (inv.profitability || 0), 0) / investments.length
      : 0;

  const investmentsByType = Object.values(InvestmentType).map((type) => {
    const typeInvestments = investments.filter((inv) => inv.type === type);
    return {
      type,
      count: typeInvestments.length,
      value: typeInvestments.reduce((sum, inv) => sum + inv.currentValue, 0),
    };
  });

  const accountOptions = accounts.map((acc) => ({
    value: acc.id as string,
    label: acc.accountName as string,
  }));

  const typeOptions = Object.entries(INVESTMENT_TYPE_LABELS).map(([value, label]) => ({
    value: value as string,
    label: label as string,
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container flex items-center justify-between h-16">
          <h1 className="text-2xl font-bold text-foreground">Investimentos</h1>
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            Novo Investimento
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Carregando investimentos...</p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Investido</p>
                      <p className="text-2xl font-bold text-foreground">
                        {formatCurrency(totalInvested)}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-indigo-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Valor Atual</p>
                      <p className="text-2xl font-bold text-foreground">
                        {formatCurrency(totalCurrentValue)}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Lucro Total</p>
                      <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(totalProfit)}
                      </p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${totalProfit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                      <TrendingUp className={`w-6 h-6 ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Rentabilidade Média</p>
                      <p className="text-2xl font-bold text-foreground">
                        {formatPercentage(averageProfitability)}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Percent className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Distribution by Type */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Distribuição por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {investmentsByType.map((item) => (
                    <div
                      key={item.type}
                      className="p-4 rounded-lg border border-border"
                      style={{ borderLeftColor: INVESTMENT_TYPE_COLORS[item.type], borderLeftWidth: 4 }}
                    >
                      <p className="text-sm text-muted-foreground mb-1">
                        {INVESTMENT_TYPE_LABELS[item.type]}
                      </p>
                      <p className="text-lg font-semibold text-foreground mb-2">
                        {formatCurrency(item.value)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.count} {item.count === 1 ? 'investimento' : 'investimentos'}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Investments List */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {investments.length} Investimentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {investments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhum investimento registrado
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {investments.map((investment) => {
                      const profit = investment.currentValue - investment.initialValue;
                      const profitPercent = (profit / investment.initialValue) * 100;

                      return (
                        <Card key={investment.id} variant="outlined">
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="font-semibold text-foreground">{investment.name}</h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {INVESTMENT_TYPE_LABELS[investment.type]}
                                </p>
                              </div>
                              <span
                                className="px-2 py-1 rounded-full text-xs font-medium text-white"
                                style={{ backgroundColor: INVESTMENT_TYPE_COLORS[investment.type] }}
                              >
                                {INVESTMENT_TYPE_LABELS[investment.type]}
                              </span>
                            </div>

                            <div className="space-y-2 text-sm mb-4">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Valor Inicial:</span>
                                <span className="font-medium">
                                  {formatCurrency(investment.initialValue)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Valor Atual:</span>
                                <span className="font-medium">
                                  {formatCurrency(investment.currentValue)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Lucro:</span>
                                <span className={`font-medium ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {profit >= 0 ? '+' : ''}{formatCurrency(profit)}
                                </span>
                              </div>
                              {investment.dueDate && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Vencimento:</span>
                                  <span className="font-medium">
                                    {formatDate(investment.dueDate)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>

      {/* Create Investment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          reset();
        }}
        title="Novo Investimento"
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nome"
            placeholder="Ex: Tesouro Direto"
            error={errors.name}
            {...register('name')}
          />

          <Select
            label="Tipo"
            options={typeOptions as any}
            error={errors.type}
            {...register('type')}
          />

          <Input
            label="Valor Inicial"
            type="number"
            placeholder="0,00"
            step="0.01"
            min="0"
            error={errors.initialValue}
            {...register('initialValue', { valueAsNumber: true })}
          />

          <Input
            label="Valor Atual"
            type="number"
            placeholder="0,00"
            step="0.01"
            min="0"
            error={errors.currentValue}
            {...register('currentValue', { valueAsNumber: true })}
          />

          <Input
            label="Rentabilidade (%)"
            type="number"
            placeholder="0,00"
            step="0.01"
            error={errors.profitability}
            {...register('profitability', { valueAsNumber: true })}
          />

          <Input
            label="Data de Vencimento"
            type="date"
            error={errors.dueDate}
            {...register('dueDate')}
          />

          <Select
            label="Conta Vinculada"
            options={accountOptions as any}
            placeholder="Selecione uma conta"
            error={errors.accountId}
            {...register('accountId')}
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
              Criar Investimento
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
