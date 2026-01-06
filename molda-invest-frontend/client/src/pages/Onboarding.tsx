import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Wallet, ArrowLeftRight, Tag, ChevronRight, ChevronLeft } from 'lucide-react';

const ONBOARDING_STEPS = [
  {
    title: 'Bem-vindo ao Molda Invest',
    description: 'Sua plataforma completa de gestão financeira e investimentos',
    icon: '👋',
  },
  {
    title: 'Crie suas Contas',
    description: 'Organize seu dinheiro em diferentes contas: Salário, Poupança, Carteira, Cartão de Crédito, etc.',
    icon: <Wallet className="w-12 h-12 text-indigo-600" />,
  },
  {
    title: 'Registre suas Transações',
    description: 'Acompanhe todas as suas receitas, despesas, transferências e investimentos',
    icon: <ArrowLeftRight className="w-12 h-12 text-indigo-600" />,
  },
  {
    title: 'Configure Categorias',
    description: 'Crie categorias personalizadas para melhor organização de suas transações',
    icon: <Tag className="w-12 h-12 text-indigo-600" />,
  },
  {
    title: 'Acompanhe Investimentos',
    description: 'Monitore renda fixa, variável, imóveis e criptomoedas em um único lugar',
    icon: '📈',
  },
];

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);

  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      localStorage.removeItem('isFirstLogin');
      setLocation('/dashboard');
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    localStorage.removeItem('isFirstLogin');
    setLocation('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-12 pb-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            {typeof step.icon === 'string' ? (
              <span className="text-6xl">{step.icon}</span>
            ) : (
              step.icon
            )}
          </div>

          {/* Content */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold mb-3">{step.title}</h2>
            <p className="text-muted-foreground">{step.description}</p>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center gap-2 mb-8">
            {ONBOARDING_STEPS.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'bg-indigo-600 w-8'
                    : index < currentStep
                    ? 'bg-indigo-300 w-2'
                    : 'bg-gray-300 w-2'
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="space-y-3">
            <Button
              onClick={handleNext}
              variant="primary"
              className="w-full"
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              {isLastStep ? 'Começar' : 'Próximo'}
            </Button>

            <div className="flex gap-3">
              {currentStep > 0 && (
                <Button
                  onClick={handlePrevious}
                  variant="secondary"
                  className="flex-1"
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                >
                  Anterior
                </Button>
              )}
              <Button
                onClick={handleSkip}
                variant="ghost"
                className={currentStep > 0 ? 'flex-1' : 'w-full'}
              >
                Pular
              </Button>
            </div>
          </div>

          {/* Step Counter */}
          <div className="text-center mt-6 text-sm text-muted-foreground">
            Etapa {currentStep + 1} de {ONBOARDING_STEPS.length}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
