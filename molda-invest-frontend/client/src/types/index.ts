// User and Authentication Types
export enum UserStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  INACTIVE = 'INACTIVE',
}

export interface User {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  status: UserStatus;
  isEmailVerified: boolean;
  isFirstLogin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  isFirstLogin: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  cpf: string;
  phone: string;
}

export interface LoginRequest {
  identifier: string; // email or CPF
}

export interface VerifyOTPRequest {
  identifier: string;
  otpCode: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Account Types
export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  CLOSED = 'CLOSED',
}

export interface Account {
  id: string;
  accountName: string;
  color: string;
  balance: number;
  status: AccountStatus;
  icon: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountRequest {
  accountName: string;
  color?: string;
  icon?: string;
  balance?: number;
}

export interface UpdateAccountRequest {
  accountName?: string;
  color?: string;
  icon?: string;
  balance?: number;
  status?: AccountStatus;
}

// Transaction Types
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  INVESTMENT = 'INVESTMENT',
  TRANSFER = 'TRANSFER',
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: TransactionType;
  notes?: string;
  tags: string[];
  accountId: string;
  categoryId?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionRequest {
  description: string;
  amount: number;
  date: string;
  type: TransactionType;
  categoryId?: string;
  accountId: string;
  notes?: string;
  tags?: string[];
}

export interface UpdateTransactionRequest {
  description?: string;
  amount?: number;
  date?: string;
  type?: TransactionType;
  categoryId?: string;
  accountId?: string;
  notes?: string;
  tags?: string[];
}

export interface ExpenseByCategory {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  totalAmount: number;
  percentage: number;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  budget: number | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  icon?: string;
  color?: string;
  type: TransactionType;
  budget?: number;
}

export interface UpdateCategoryRequest {
  name?: string;
  icon?: string;
  color?: string;
  type?: TransactionType;
  budget?: number;
}

// Investment Types
export enum InvestmentType {
  FIXED_INCOME = 'FIXED_INCOME',
  VARIABLE_INCOME = 'VARIABLE_INCOME',
  REAL_ESTATE = 'REAL_ESTATE',
  CRYPTOCURRENCY = 'CRYPTOCURRENCY',
}

export interface Investment {
  id: string;
  name: string;
  type: InvestmentType;
  initialValue: number;
  currentValue: number;
  profitability?: number;
  dueDate?: string;
  accountId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvestmentRequest {
  name: string;
  type: InvestmentType;
  initialValue: number;
  currentValue: number;
  profitability?: number;
  dueDate?: string;
  accountId: string;
}

export interface UpdateInvestmentRequest {
  name?: string;
  type?: InvestmentType;
  initialValue?: number;
  currentValue?: number;
  profitability?: number;
  dueDate?: string;
  accountId?: string;
}

// Query Params
export interface TransactionFilters {
  accountId?: string;
  type?: TransactionType;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
}

export interface ExpenseByCategoryFilters {
  startDate?: string;
  endDate?: string;
}

// API Error Response
export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

// Dashboard Summary
export interface DashboardSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlyBalance: number;
  recentTransactions: Transaction[];
  expensesByCategory: ExpenseByCategory[];
}

// Investment Summary
export interface InvestmentSummary {
  totalInvested: number;
  totalCurrentValue: number;
  totalProfit: number;
  averageProfitability: number;
  investments: Investment[];
}
