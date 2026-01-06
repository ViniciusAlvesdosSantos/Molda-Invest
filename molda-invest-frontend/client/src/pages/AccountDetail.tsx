import { useEffect, useState } from 'react';
import { useRequireAuth } from '@/hooks/useAuth';
import { useAccountStore } from '@/stores/useAccountStore';
import { useTransactionStore } from '@/stores/useTransactionStore';
import { useLocation, useParams } from 'wouter';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { TransactionType } from '@/types';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export default function AccountDetail() {
  const isAuthenticated = useRequireAuth();
  const [, setLocation] = useLocation();
  const { id } = useParams();
  const { fetchAccountById } = useAccountStore();
  const { transactions, fetchTransactions } = useTransactionStore();
  const [account, setAccount] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const accountData = await fetchAccountById(id);
        setAccount(accountData);
        await fetchTransactions({ accountId: id });
      } catch (error) {
        toast.error('Erro ao carregar conta');
        setLocation('/accounts');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, id]);

  if (!isAuthenticated || isLoading) {
    return null;
  }

  if (!account) {
    return null;
  }

  const accountTransactions = transactions.filter((t) => t.accountId === id);
  const income = accountTransactions
    .filter((t) => t.type === TransactionType.INCOME)
    .reduce((sum, t) => sum + t.amount, 0);
  const expense = accountTransactions
    .filter((t) => t.type === TransactionType.EXPENSE)
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = income - expense;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => setLocation('/accounts')}
            >
              Voltar
            </Button>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                style={{ backgroundColor: account.color + '20' }}
              >
                {account.icon || '💰'}
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">{account.accountName}</h1>
                <p className="text-sm text-muted-foreground">Detalhes da Conta</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Saldo Atual</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(account.balance)}
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
                  <p className="text-sm text-muted-foreground mb-1">Receitas</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(income)}
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
                  <p className="text-sm text-muted-foreground mb-1">Despesas</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(expense)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Transações</CardTitle>
          </CardHeader>
          <CardContent>
            {accountTransactions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhuma transação nesta conta
              </p>
            ) : (
              <div className="space-y-2">
                {accountTransactions.map((transaction) => (
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
      </main>
    </div>
  );
}
