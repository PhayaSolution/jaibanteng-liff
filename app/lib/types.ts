// Type definitions matching Prisma models and API responses

export interface User {
  id: string;
  lineUserId: string;
  displayName: string;
  pictureUrl?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  type: TransactionType;
  emoji?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = 'INCOME' | 'EXPENSE';
export type TransactionStatus = 'ACTIVE' | 'DONE' | 'BACK';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: string; // Decimal as string
  date: string;
  name: string;
  categoryId?: string | null;
  status: TransactionStatus;
  createdAt: string;
  updatedAt: string;
  category?: Category | null;
  tags?: Tag[];
}

export interface TransactionStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
  spendingData: Array<{
    date: string; // ISO string for same day, date string (YYYY-MM-DD) for multiple days
    income: number;
    expense: number;
    total: number;
  }>;
}

export interface ApiError {
  error: string;
  details?: string;
}

