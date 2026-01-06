import { TransactionType, InvestmentType, AccountStatus, UserStatus } from '@/types';

// Account Icons
export const ACCOUNT_ICONS = [
  { value: 'SALARY', label: 'Salário', icon: '💰' },
  { value: 'SAVINGS', label: 'Poupança', icon: '🏦' },
  { value: 'WALLET', label: 'Carteira', icon: '👛' },
  { value: 'CREDIT_CARD', label: 'Cartão de Crédito', icon: '💳' },
  { value: 'INVESTMENT', label: 'Investimento', icon: '📈' },
];

// Account Colors
export const ACCOUNT_COLORS = [
  { value: '#3B82F6', label: 'Azul' },
  { value: '#10B981', label: 'Verde' },
  { value: '#F59E0B', label: 'Âmbar' },
  { value: '#EF4444', label: 'Vermelho' },
  { value: '#8B5CF6', label: 'Roxo' },
  { value: '#EC4899', label: 'Rosa' },
  { value: '#06B6D4', label: 'Ciano' },
  { value: '#6366F1', label: 'Indigo' },
];

// Category Icons (Emojis)
export const CATEGORY_ICONS = [
  '🍔', '🍕', '🍜', '🥗', '☕',
  '🛒', '🛍️', '👕', '👗', '👠',
  '🏥', '💊', '🏋️', '🧘', '💆',
  '🎬', '🎮', '🎵', '🎨', '📚',
  '✈️', '🚗', '🚕', '🚌', '🚆',
  '🏠', '🏡', '🏢', '🏗️', '🔧',
  '💻', '📱', '⌚', '🖥️', '⌨️',
  '🎓', '📖', '✏️', '📝', '🎒',
];

// Category Colors
export const CATEGORY_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#ABEBC6',
  '#F5B7B1', '#D7BDE2', '#A9DFBF', '#F9E79F', '#F5CBA7',
];

// Transaction Types
export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  [TransactionType.INCOME]: 'Receita',
  [TransactionType.EXPENSE]: 'Despesa',
  [TransactionType.INVESTMENT]: 'Investimento',
  [TransactionType.TRANSFER]: 'Transferência',
};

export const TRANSACTION_TYPE_COLORS: Record<TransactionType, string> = {
  [TransactionType.INCOME]: '#10B981',
  [TransactionType.EXPENSE]: '#EF4444',
  [TransactionType.INVESTMENT]: '#3B82F6',
  [TransactionType.TRANSFER]: '#8B5CF6',
};

// Investment Types
export const INVESTMENT_TYPE_LABELS: Record<InvestmentType, string> = {
  [InvestmentType.FIXED_INCOME]: 'Renda Fixa',
  [InvestmentType.VARIABLE_INCOME]: 'Renda Variável',
  [InvestmentType.REAL_ESTATE]: 'Imóvel',
  [InvestmentType.CRYPTOCURRENCY]: 'Criptomoeda',
};

export const INVESTMENT_TYPE_COLORS: Record<InvestmentType, string> = {
  [InvestmentType.FIXED_INCOME]: '#3B82F6',
  [InvestmentType.VARIABLE_INCOME]: '#F59E0B',
  [InvestmentType.REAL_ESTATE]: '#8B5CF6',
  [InvestmentType.CRYPTOCURRENCY]: '#EC4899',
};

// Account Status
export const ACCOUNT_STATUS_LABELS: Record<AccountStatus, string> = {
  [AccountStatus.ACTIVE]: 'Ativa',
  [AccountStatus.SUSPENDED]: 'Suspensa',
  [AccountStatus.CLOSED]: 'Fechada',
};

// User Status
export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  [UserStatus.PENDING]: 'Pendente',
  [UserStatus.ACTIVE]: 'Ativo',
  [UserStatus.SUSPENDED]: 'Suspenso',
  [UserStatus.INACTIVE]: 'Inativo',
};

// Date Presets
export const DATE_PRESETS = [
  { label: 'Hoje', value: 'today' },
  { label: 'Semana', value: 'week' },
  { label: 'Mês', value: 'month' },
  { label: 'Ano', value: 'year' },
  { label: 'Personalizado', value: 'custom' },
];

// Pagination
export const ITEMS_PER_PAGE = 10;

// OTP Timer (in seconds)
export const OTP_TIMER_SECONDS = 600; // 10 minutes

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
    LOGIN: '/auth/login',
    VERIFY_OTP: '/auth/verify-otp',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
  },
  ACCOUNTS: {
    LIST: '/accounts',
    DETAIL: '/accounts/:id',
    BALANCE: '/accounts/balance/:id',
    CREATE: '/accounts',
    UPDATE: '/accounts/:id',
    DELETE: '/accounts/:id',
  },
  TRANSACTIONS: {
    LIST: '/transactions',
    DETAIL: '/transactions/:id',
    EXPENSES_BY_CATEGORY: '/transactions/expenses-by-category',
    CREATE: '/transactions',
    UPDATE: '/transactions/:id',
    DELETE: '/transactions/:id',
  },
  CATEGORIES: {
    LIST: '/categories',
    DETAIL: '/categories/:id',
    CREATE: '/categories',
    UPDATE: '/categories/:id',
    DELETE: '/categories/:id',
  },
  INVESTMENTS: {
    LIST: '/investments',
    DETAIL: '/investments/:id',
    CREATE: '/investments',
    UPDATE: '/investments/:id',
    DELETE: '/investments/:id',
  },
};
