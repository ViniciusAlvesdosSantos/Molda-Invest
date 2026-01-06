import { useEffect, useState } from 'react';
import { useRequireAuth } from '@/hooks/useAuth';
import { useAccountStore } from '@/stores/useAccountStore';
import { useTransactionStore } from '@/stores/useTransactionStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { TransactionType } from '@/types';
import { TrendingUp, TrendingDown, Wallet, DollarSign, LogOut } from 'lucide-react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';

export default function Dashboard() {
  const isAuthenticated = useRequireAuth();
  const [, setLocation] = useLocation();
  const { user, logout } = useAuthStore();
  const { accounts, fetchAccounts } = useAccountStore();
  const { transactions, fetchTransactions, expensesByCategory, fetchExpensesByCategory } = useTransactionStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('Dashboard mounted');
    const loadData = async () => {
      try {
        console.log('Loading dashboard data');
        // setIsLoading(true);
        // await Promise.all([
        //   fetchAccounts(),
        //   fetchTransactions(),
        //   fetchExpensesByCategory(),
        // ]);
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

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const monthlyIncome = transactions
    .filter((t) => t.type === TransactionType.INCOME)
    .reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpense = transactions
    .filter((t) => t.type === TransactionType.EXPENSE)
    .reduce((sum, t) => sum + t.amount, 0);
  const monthlyBalance = monthlyIncome - monthlyExpense;

  const handleLogout = () => {
    logout();
    setLocation('/login');
    toast.success('Logout realizado com sucesso');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">Molda Invest</h1>
              <p className="text-xs text-muted-foreground">Gestão Financeira</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Saldo Total</p>
              <p className="text-lg font-semibold text-foreground">
                {formatCurrency(totalBalance)}
              </p>
            </div>

            <div className="flex items-center gap-2 pl-4 border-l border-border">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-sm font-semibold text-indigo-600">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-foreground">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                leftIcon={<LogOut className="w-4 h-4" />}
              >
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Carregando dados...</p>
          </div>
        ) : (
          <>
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
                      <p className="text-sm text-muted-foreground mb-1">Balanço (Mês)</p>
                      <p className={`text-2xl font-bold ${monthlyBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(monthlyBalance)}
                      </p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${monthlyBalance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                      <DollarSign className={`w-6 h-6 ${monthlyBalance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Transactions Section */}
            <Card>
              <CardHeader>
                <CardTitle>Transações Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhuma transação registrada
                  </p>
                ) : (
                  <div className="space-y-2">
                    {transactions.slice(0, 5).map((transaction) => (
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
                )}
              </CardContent>
            </Card>

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
    </div>
  );
}
