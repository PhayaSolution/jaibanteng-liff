// Type definitions matching Prisma models and API responses

export interface User {
  id: string;
  lineUserId: string;
  displayName: string;
  pictureUrl?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  reminderEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  type: TransactionType;
  emoji?: string | null;
  budget?: string | null;
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
  categoryStats?: Array<{
    id: string;
    name: string;
    emoji?: string | null;
    budget: number | null;
    spent: number;
  }>;
}

export interface ApiError {
  error: string;
  details?: string;
}

// Reminder types
export type ReminderStatus = 'ACTIVE' | 'DONE';
export type DeliveryStatus = 'SENT' | 'FAILED';

export interface Reminder {
  id: string;
  userId: string;
  title: string;
  note?: string | null;
  remindAt: string;
  status: ReminderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ReminderDelivery {
  id: string;
  reminderId: string;
  userId: string;
  sentFor: string;
  status: DeliveryStatus;
  sentAt: string;
  error?: string | null;
}

export interface ReminderSettings {
  reminderEnabled: boolean;
  reminderLeadMinutes: number;
}

