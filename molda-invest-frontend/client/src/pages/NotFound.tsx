import { useLocation } from 'wouter';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Home } from 'lucide-react';

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-12 pb-8">
          <div className="text-6xl font-bold text-indigo-600 mb-4">404</div>
          <h1 className="text-2xl font-semibold mb-2">Página não encontrada</h1>
          <p className="text-muted-foreground mb-8">
            Desculpe, a página que você está procurando não existe.
          </p>
          <Button
            onClick={() => setLocation('/dashboard')}
            variant="primary"
            className="w-full"
            leftIcon={<Home className="w-4 h-4" />}
          >
            Voltar ao Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
