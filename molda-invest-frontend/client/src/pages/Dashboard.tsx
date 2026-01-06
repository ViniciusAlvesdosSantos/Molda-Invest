import { useEffect, useState } from 'react';
import { useRequireAuth } from '@/hooks/useAuth';
import { useAccountStore } from '@/stores/useAccountStore';
import { useTransactionStore } from '@/stores/useTransactionStore';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { TransactionType } from '@/types';
import { TrendingUp, TrendingDown, DollarSign, Plus, Wallet } from 'lucide-react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import CreateTransactionModal from '@/components/ui/CreateTransactionModal';
import ExpensesByCategory from '@/components/ExpensesByCategory';
import Header from '@/components/Header';

export default function Dashboard() {
  const isAuthenticated = useRequireAuth();
  const [, setLocation] = useLocation();
  const { accounts, fetchAccounts } = useAccountStore();
  const { transactions, fetchTransactions } = useTransactionStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    console.log('Dashboard mounted');
    const loadData = async () => {
      try {
        console.log('Loading dashboard data');
        setIsLoading(true);
        await Promise.all([
          fetchAccounts(),
          fetchTransactions(),
        ]);
      } catch (error) {
        toast.error('Erro ao carregar dados');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);
  const monthlyIncome = transactions
    .filter((t) => t.type === TransactionType.INCOME)
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const monthlyExpense = transactions
    .filter((t) => t.type === TransactionType.EXPENSE)
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const monthlyBalance = monthlyIncome - monthlyExpense;

  // Cálculos inteligentes para insights
  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpense) / monthlyIncome) * 100 : 0;
  const averageDailyExpense = monthlyExpense / 30;
  const projectedMonthlyExpense = averageDailyExpense * 30;
  const daysUntilMonthEnd = 30 - new Date().getDate();
  const budgetRemaining = monthlyIncome - monthlyExpense;
  const canSpendPerDay = daysUntilMonthEnd > 0 ? budgetRemaining / daysUntilMonthEnd : 0;

  // Análise de tendência
  const isHealthyFinance = savingsRate >= 20;
  const isWarningFinance = savingsRate < 20 && savingsRate >= 10;
  const isDangerFinance = savingsRate < 10;

  const handleTransactionCreated = () => {
    fetchAccounts();
    fetchTransactions();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header showBalance={true} />

      {/* Main Content */}
      <main className="container py-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Carregando dados...</p>
          </div>
        ) : (
          <>
            {/* Insights Inteligentes */}
            {monthlyIncome > 0 && (
              <Card className="mb-6 border-l-4" style={{ borderLeftColor: isHealthyFinance ? '#10b981' : isWarningFinance ? '#f59e0b' : '#ef4444' }}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">💡 Insight Financeiro</h3>
                      {isHealthyFinance && (
                        <p className="text-sm text-muted-foreground mb-2">
                          Excelente! Você está economizando <span className="font-semibold text-green-600">{savingsRate.toFixed(1)}%</span> da sua renda. 
                          Continue assim e você terá uma reserva sólida.
                        </p>
                      )}
                      {isWarningFinance && (
                        <p className="text-sm text-muted-foreground mb-2">
                          Atenção! Sua taxa de poupança é de <span className="font-semibold text-orange-600">{savingsRate.toFixed(1)}%</span>. 
                          Tente aumentar para pelo menos 20% cortando pequenas despesas.
                        </p>
                      )}
                      {isDangerFinance && (
                        <p className="text-sm text-muted-foreground mb-2">
                          Alerta! Você está economizando apenas <span className="font-semibold text-red-600">{savingsRate.toFixed(1)}%</span>. 
                          Revise seus gastos urgentemente para evitar endividamento.
                        </p>
                      )}
                      <div className="flex flex-wrap gap-4 mt-3">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Você pode gastar </span>
                          <span className="font-semibold text-foreground">{formatCurrency(canSpendPerDay)}</span>
                          <span className="text-muted-foreground"> por dia até o fim do mês</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Saldo Total</p>
                      <p className="text-2xl font-bold text-foreground">
                        {formatCurrency(totalBalance)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {accounts.length} {accounts.length === 1 ? 'conta' : 'contas'}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <Wallet className="w-6 h-6 text-indigo-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Receitas (Mês)</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(monthlyIncome)}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        ↑ Entradas
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Despesas (Mês)</p>
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(monthlyExpense)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Média: {formatCurrency(averageDailyExpense)}/dia
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                      <TrendingDown className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Taxa de Poupança</p>
                      <p className={`text-2xl font-bold ${isHealthyFinance ? 'text-green-600' : isWarningFinance ? 'text-orange-600' : 'text-red-600'}`}>
                        {savingsRate.toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {isHealthyFinance ? '✓ Saudável' : isWarningFinance ? '⚠ Atenção' : '⚠ Crítico'}
                      </p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isHealthyFinance ? 'bg-green-100' : isWarningFinance ? 'bg-orange-100' : 'bg-red-100'}`}>
                      <DollarSign className={`w-6 h-6 ${isHealthyFinance ? 'text-green-600' : isWarningFinance ? 'text-orange-600' : 'text-red-600'}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Transactions and Categories Section - Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Transactions Section */}
              <Card>
                <CardHeader className="flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <CardTitle>Transações Recentes</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Plus className="w-4 h-4" />}
                      onClick={() => setIsModalOpen(true)}
                    >
                      Nova Transação
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {transactions.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Nenhuma transação registrada
                    </p>
                  ) : (
                    <div className="overflow-y-auto pr-2" style={{ maxHeight: '400px' }}>
                      <div className="space-y-2">
                        {transactions.slice(0, 10).map((transaction) => (
                          <div
                            key={transaction.id}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-foreground">{transaction.description}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(transaction.date)}
                              </p>
                            </div>
                            <p className={`font-semibold ${transaction.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'}`}>
                              {transaction.type === TransactionType.INCOME ? '+' : '-'}
                              {formatCurrency(transaction.amount)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Expenses by Category Section */}
              <ExpensesByCategory />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => setLocation('/accounts')}
              >
                Gerenciar Contas
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setLocation('/transactions')}
              >
                Registrar Transação
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setLocation('/investments')}
              >
                Ver Investimentos
              </Button>
            </div>
          </>
        )}
      </main>

      {/* Create Transaction Modal */}
      <CreateTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleTransactionCreated}
      />
    </div>
  );
}
