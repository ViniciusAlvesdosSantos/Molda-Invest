import { useEffect, useState } from 'react';
import { useRequireAuth } from '@/hooks/useAuth';
import { useCategoryStore } from '@/stores/useCategoryStore';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Modal, ModalContent, ModalFooter } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { TransactionType } from '@/types';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/lib/constants';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCategorySchema } from '@/lib/validators';

export default function Categories() {
  const isAuthenticated = useRequireAuth();
  const { categories, fetchCategories, createCategory, deleteCategory, isLoading } = useCategoryStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<TransactionType>(TransactionType.INCOME);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: '',
      icon: CATEGORY_ICONS[0],
      color: CATEGORY_COLORS[0],
      type: TransactionType.INCOME,
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchCategories();
    }
  }, [isAuthenticated]);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await createCategory(data);
      toast.success('Categoria criada com sucesso!');
      setIsModalOpen(false);
      reset();
    } catch (error) {
      toast.error('Erro ao criar categoria');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja deletar esta categoria?')) {
      try {
        await deleteCategory(id);
        toast.success('Categoria deletada com sucesso!');
      } catch (error: any) {
        const message = error.response?.data?.message || 'Erro ao deletar categoria';
        toast.error(message);
      }
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  const filteredCategories = categories.filter((cat) => cat.type === activeTab);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container flex items-center justify-between h-16">
          <h1 className="text-2xl font-bold text-foreground">Categorias</h1>
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            Nova Categoria
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-border">
          {[TransactionType.INCOME, TransactionType.EXPENSE].map((type) => (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === type
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {type === TransactionType.INCOME ? 'Receitas' : 'Despesas'}
            </button>
          ))}
        </div>

        {/* Categories Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Carregando categorias...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Nenhuma categoria criada</p>
            <Button
              variant="primary"
              onClick={() => setIsModalOpen(true)}
            >
              Criar Primeira Categoria
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredCategories.map((category) => (
              <Card key={category.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                      style={{ backgroundColor: category.color + '20' }}
                    >
                      {category.icon}
                    </div>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>

                  <h3 className="font-semibold text-foreground">{category.name}</h3>
                  <div
                    className="w-full h-2 rounded-full mt-2"
                    style={{ backgroundColor: category.color }}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Create Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          reset();
        }}
        title="Nova Categoria"
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nome"
            placeholder="Ex: Alimentação"
            error={errors.name}
            {...register('name')}
          />

          <Select
            label="Tipo"
            options={[
              { value: TransactionType.INCOME, label: 'Receita' },
              { value: TransactionType.EXPENSE, label: 'Despesa' },
            ] as any}
            error={errors.type}
            {...register('type')}
          />

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Emoji
            </label>
            <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto">
              {CATEGORY_ICONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className="p-2 rounded-lg border border-border hover:bg-muted transition-colors text-2xl"
                  onClick={() => {
                    // This would need to be handled with form state
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Cor
            </label>
            <div className="grid grid-cols-5 gap-2">
              {CATEGORY_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className="w-8 h-8 rounded-lg border-2 border-transparent hover:border-foreground transition-colors"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

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
              Criar Categoria
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
