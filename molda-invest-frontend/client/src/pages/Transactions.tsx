import { useEffect, useState } from 'react';
import { useRequireAuth } from '@/hooks/useAuth';
import { useTransactionStore } from '@/stores/useTransactionStore';
import { useAccountStore } from '@/stores/useAccountStore';
import { useCategoryStore } from '@/stores/useCategoryStore';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { TransactionType } from '@/types';
import { TRANSACTION_TYPE_LABELS } from '@/lib/constants';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import CreateTransactionModal from '@/components/ui/CreateTransactionModal';
import Header from '@/components/Header';

export default function Transactions() {
  const isAuthenticated = useRequireAuth();
  const [, setLocation] = useLocation();
  const { transactions, fetchTransactions, deleteTransaction, isLoading } = useTransactionStore();
  const { accounts, fetchAccounts } = useAccountStore();
  const { categories, fetchCategories } = useCategoryStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<TransactionType | ''>('');

  useEffect(() => {
    if (isAuthenticated) {
      Promise.all([fetchTransactions(), fetchAccounts(), fetchCategories()]);
    }
  }, [isAuthenticated]);

  const handleTransactionCreated = () => {
    fetchTransactions();
    fetchAccounts();
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

  const typeOptions = Object.entries(TRANSACTION_TYPE_LABELS).map(([value, label]) => ({
    value: value as string,
    label: label as string,
  }));

  return (
    <div className="min-h-screen bg-background w-500">
      <Header showBalance={true} />

      {/* Main Content */}
      <main className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Transações</h1>
            <p className="text-muted-foreground mt-1">{filteredTransactions.length} transações encontradas</p>
          </div>
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            Nova Transação
          </Button>
        </div>
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4 flex-wrap">
              <select
                className="flex-1 min-w-[200px] px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as any)}
              >
                <option value="">Todos os tipos</option>
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
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
      <CreateTransactionModal
      isOpen={isModalOpen}
      onClose={()=> setIsModalOpen(false)}
      onSuccess={handleTransactionCreated}
      />
    </div>
  );
}
