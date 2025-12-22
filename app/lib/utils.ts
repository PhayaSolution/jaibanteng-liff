import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Transaction } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface TransactionGroup {
  date: string;
  total: number;
  transactions: Array<{
    id: string;
    category: string;
    categoryEmoji?: string | null;
    name: string;
    amount: number;
    type: 'income' | 'expense';
    tags?: string[];
    createdAt?: string;
    date?: string;
  }>;
}

export function transformTransactionsToGroups(transactions: Transaction[]): TransactionGroup[] {
  const groupsMap = new Map<string, TransactionGroup>();

  transactions.forEach((tx) => {
    const date = format(new Date(tx.date), 'dd/MM/yyyy', { locale: enUS });
    
    if (!groupsMap.has(date)) {
      groupsMap.set(date, {
        date,
        total: 0,
        transactions: [],
      });
    }

    const group = groupsMap.get(date)!;
    const amount = parseFloat(tx.amount);
    const isIncome = tx.type === 'INCOME';
    
    group.total += isIncome ? amount : -amount;
    
    group.transactions.push({
      id: tx.id,
      category: tx.category?.name || 'Uncategorized',
      categoryEmoji: tx.category?.emoji || null,
      name: tx.name,
      amount,
      type: isIncome ? 'income' : 'expense',
      tags: tx.tags && tx.tags.length > 0 
        ? tx.tags.map(tag => `#${tag.name}`)
        : undefined,
      createdAt: tx.createdAt,
      date: tx.date,
    });
  });

  // Sort by date descending
  return Array.from(groupsMap.values()).sort((a, b) => {
    const dateA = new Date(a.date.split('/').reverse().join('-'));
    const dateB = new Date(b.date.split('/').reverse().join('-'));
    return dateB.getTime() - dateA.getTime();
  });
}






