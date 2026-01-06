import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Format a number as Brazilian Real currency
 * @param value - The numeric value to format
 * @returns Formatted string like "R$ 1.234,56"
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Format a date string to dd/MM/yyyy
 * @param dateString - ISO date string
 * @returns Formatted date like "25/12/2024"
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  } catch {
    return dateString;
  }
};

/**
 * Format a datetime string to dd/MM/yyyy HH:mm
 * @param dateString - ISO datetime string
 * @returns Formatted datetime like "25/12/2024 14:30"
 */
export const formatDateTime = (dateString: string): string => {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR });
  } catch {
    return dateString;
  }
};

/**
 * Format a date to relative time (e.g., "há 2 horas")
 * @param dateString - ISO date string
 * @returns Relative time string
 */
export const formatRelativeTime = (dateString: string): string => {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'agora';
    if (diffMins < 60) return `há ${diffMins}m`;
    if (diffHours < 24) return `há ${diffHours}h`;
    if (diffDays < 7) return `há ${diffDays}d`;

    return formatDate(dateString);
  } catch {
    return dateString;
  }
};

/**
 * Apply CPF mask to a string
 * @param value - The input string
 * @returns Masked string like "123.456.789-10"
 */
export const maskCPF = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  const match = cleaned.match(/(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})/);
  if (!match) return value;

  let result = match[1];
  if (match[2]) result += '.' + match[2];
  if (match[3]) result += '.' + match[3];
  if (match[4]) result += '-' + match[4];

  return result;
};

/**
 * Apply phone mask to a string
 * @param value - The input string
 * @returns Masked string like "(11) 98765-4321"
 */
export const maskPhone = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  const match = cleaned.match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
  if (!match) return value;

  let result = '';
  if (match[1]) result += '(' + match[1];
  if (match[2]) result += ') ' + match[2];
  if (match[3]) result += '-' + match[3];

  return result;
};

/**
 * Remove mask from CPF
 * @param value - The masked CPF string
 * @returns Unmasked string
 */
export function unmaskCPF(value: string): string {
  return value.replace(/\D/g, '');
};

/**
 * Remove mask from phone
 * @param value - The masked phone string
 * @returns Unmasked string
 */
export const unmaskPhone = (value: string): string => {
  return value.replace(/\D/g, '');
};

/**
 * Format a percentage value
 * @param value - The numeric value
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string like "12,34%"
 */
export const formatPercentage = (value: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
};

/**
 * Format a number with thousand separator
 * @param value - The numeric value
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string like "1.234,56"
 */
export const formatNumber = (value: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

/**
 * Validate CPF format
 * @param cpf - The CPF string (with or without mask)
 * @returns true if valid, false otherwise
 */
export const isValidCPF = (cpf: string): boolean => {
  const cleaned = unmaskCPF(cpf);
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleaned)) return false;

  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleaned.substring(i - 1, i)) * (11 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.substring(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleaned.substring(i - 1, i)) * (12 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.substring(10, 11))) return false;

  return true;
};

/**
 * Validate email format
 * @param email - The email string
 * @returns true if valid, false otherwise
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
