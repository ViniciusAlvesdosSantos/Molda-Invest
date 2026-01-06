import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuthStore } from '@/stores/useAuthStore';
import { useAccountStore } from '@/stores/useAccountStore';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/formatters';
import { 
  Wallet, 
  LogOut, 
  Menu, 
  X, 
  Home, 
  CreditCard, 
  ArrowLeftRight, 
  TrendingUp,
  Tag
} from 'lucide-react';
import { toast } from 'sonner';

interface HeaderProps {
  showBalance?: boolean;
}

export default function Header({ showBalance = true }: HeaderProps) {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuthStore();
  const { accounts } = useAccountStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);

  const handleLogout = () => {
    logout();
    setLocation('/login');
    toast.success('Logout realizado com sucesso');
  };

  const navigate = (path: string) => {
    setLocation(path);
    setIsMenuOpen(false);
  };

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: CreditCard, label: 'Contas', path: '/accounts' },
    { icon: ArrowLeftRight, label: 'Transações', path: '/transactions' },
    { icon: Tag, label: 'Categorias', path: '/categories' },
    { icon: TrendingUp, label: 'Investimentos', path: '/investments' },
  ];

  return (
    <>
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6 text-foreground" />
            </button>
            
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">Molda Invest</h1>
              <p className="text-xs text-muted-foreground">Gestão Financeira</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {showBalance && (
              <div className="text-right hidden sm:block">
                <p className="text-sm text-muted-foreground">Saldo Total</p>
                <p className="text-lg font-semibold text-foreground">
                  {formatCurrency(totalBalance)}
                </p>
              </div>
            )}

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
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar Menu */}
      <div
        className={`fixed inset-0 bg-black/30 bg-opacity-50 z-50 transition-opacity duration-300 ${
          isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMenuOpen(false)}
      >
        <div
          className={`fixed left-0 top-0 h-full w-80 bg-card shadow-xl transform transition-transform duration-300 ${
            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Molda Invest</h2>
                <p className="text-xs text-muted-foreground">Menu</p>
              </div>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-foreground" />
            </button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-border bg-muted/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-lg font-semibold text-indigo-600">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{user?.name}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            {showBalance && (
              <div className="mt-3 p-3 bg-card rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Saldo Total</p>
                <p className="text-xl font-bold text-foreground">
                  {formatCurrency(totalBalance)}
                </p>
              </div>
            )}
          </div>

          {/* Menu Items */}
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
              >
                <item.icon className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium text-foreground">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
            <Button
              variant="ghost"
              className="w-full justify-start"
              leftIcon={<LogOut className="w-5 h-5" />}
              onClick={handleLogout}
            >
              Sair da conta
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
