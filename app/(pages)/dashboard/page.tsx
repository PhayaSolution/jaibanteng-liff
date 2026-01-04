'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, addDays } from 'date-fns';
import { enUS } from 'date-fns/locale';
import Container from '@/app/components/layout/container.component';
import SafeArea from '@/app/components/layout/safe-area.component';
import SpendingGraph from '@/app/components/dashboard/spending-graph.component';
import TransactionList from '@/app/components/dashboard/transaction-list.component';
import ReminderList from '@/app/components/dashboard/reminder-list.component';
import BudgetProgress from '@/app/components/dashboard/budget-progress.component';
import { SearchIcon, PlusIcon } from '@/app/components/icons';
import BottomNavigation from '@/app/components/layout/bottom-navigation.component';
import { Transaction, Reminder } from '@/app/lib/types';
import { getUserSession } from '@/app/utils/storage.util';
import QuickAdd from '@/app/components/dashboard/quick-add.component';
import { fetchTransactions, fetchTransactionStats, deleteTransaction, updateTransaction, fetchFrequentTransactions, createTransaction, TransactionShortcut, fetchReminders, updateReminder, deleteReminder } from '@/app/lib/api';

import { transformTransactionsToGroups, TransactionGroup } from '@/app/lib/utils';

type TabType = 'dashboard' | 'task';
type PeriodType = 'Today' | 'This Week' | 'This Month' | 'This Year';

interface ReminderGroup {
  date: string;
  reminders: Array<{
    id: string;
    title: string;
    note?: string | null;
    remindAt: string;
    status: 'ACTIVE' | 'DONE';
  }>;
}

// Helper to get date range for period
function getDateRange(period: PeriodType): { startDate: string; endDate: string } {
  const now = new Date();
  let start: Date;
  let end: Date = endOfDay(now);

  switch (period) {
    case 'Today':
      start = startOfDay(now);
      break;
    case 'This Week':
      start = startOfWeek(now, { weekStartsOn: 1 }); // Monday
      end = endOfWeek(now, { weekStartsOn: 1 });
      break;
    case 'This Month':
      start = startOfMonth(now);
      end = endOfMonth(now);
      break;
    case 'This Year':
      start = startOfYear(now);
      end = endOfYear(now);
      break;
    default:
      start = startOfDay(now);
  }

  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  };
}

// Helper to get page date range (10 days per page)
// For initial load: calculates forward from periodStart
// For load more: calculates backward from cursorEnd
function getPageDateRange(
  periodStartDate: string, 
  cursorEndDate: string,
  isInitialLoad: boolean = false
): { pageStartDate: string; pageEndDate: string; hasMore: boolean } {
  const periodStart = startOfDay(new Date(periodStartDate));
  const periodEnd = endOfDay(new Date(cursorEndDate));
  
  let pageStart: Date;
  let pageEnd: Date;
  
  if (isInitialLoad) {
    // For initial load: start from periodStart and go forward 10 days
    pageStart = periodStart;
    // Calculate page end: 9 days after page start (to get 10 days total)
    const pageEndDay = startOfDay(periodStart);
    const pageEndDate = addDays(pageEndDay, 9);
    pageEnd = endOfDay(pageEndDate);
    
    // Ensure page end doesn't go beyond period end
    if (pageEnd > periodEnd) {
      pageEnd = periodEnd;
    }
  } else {
    // For load more: calculate backward from cursorEnd
    const cursorEndDay = startOfDay(periodEnd);
    const pageStartDate = subDays(cursorEndDay, 9);
    pageStart = pageStartDate < periodStart ? periodStart : pageStartDate;
    pageEnd = periodEnd;
  }
  
  // Check if there's more data to load
  // For initial load: check if pageEnd < periodEnd
  // For load more: check if pageStart > periodStart
  const hasMore = isInitialLoad 
    ? pageEnd.getTime() < periodEnd.getTime()
    : pageStart.getTime() > periodStart.getTime();
  
  return {
    pageStartDate: pageStart.toISOString(),
    pageEndDate: pageEnd.toISOString(),
    hasMore,
  };
}

// Transform reminders to groups by date
function transformRemindersToGroups(reminders: Reminder[]): ReminderGroup[] {
  const groupsMap = new Map<string, ReminderGroup>();

  reminders.forEach((reminder) => {
    const date = format(new Date(reminder.remindAt), 'dd/MM/yyyy', { locale: enUS });
    
    if (!groupsMap.has(date)) {
      groupsMap.set(date, {
        date,
        reminders: [],
      });
    }

    const group = groupsMap.get(date)!;
    
    group.reminders.push({
      id: reminder.id,
      title: reminder.title,
      note: reminder.note,
      remindAt: reminder.remindAt,
      status: reminder.status,
    });
  });

  return Array.from(groupsMap.values()).sort((a, b) => {
    const dateA = new Date(a.date.split('/').reverse().join('-'));
    const dateB = new Date(b.date.split('/').reverse().join('-'));
    return dateA.getTime() - dateB.getTime(); // Ascending order for reminders
  });
}

// Transform stats spending data for graph
function transformSpendingDataForGraph(
  spendingData: Array<{ date: string; income: number; expense: number; total: number }>,
  period: PeriodType
): Array<{ month: string; value: number }> {
  if (spendingData.length === 0) {
    return [{ month: '-', value: 0 }];
  }

  switch (period) {
    case 'Today': {
      // For today, show all 24 hours (0-23)
      // Convert ISO date strings from API to local timezone and group by hour
      const hourMap = new Map<number, number>();
      
      spendingData.forEach((item) => {
        // Parse ISO date string and convert to local timezone
        const date = new Date(item.date);
        const hour = date.getHours(); // Local timezone hour
        
        // Aggregate income and expense for this hour
        const currentValue = hourMap.get(hour) || 0;
        hourMap.set(hour, currentValue + (item.income - item.expense));
      });
      
      const result: Array<{ month: string; value: number }> = [];
      
      // Show all 24 hours (0-23)
      for (let h = 0; h <= 23; h++) {
        const nextHour = h + 1;
        // For the last hour (23), show "23-24" instead of "23-00"
        const label = nextHour === 24 
          ? `${h.toString().padStart(2, '0')}-24`
          : `${h.toString().padStart(2, '0')}-${nextHour.toString().padStart(2, '0')}`;
        result.push({
          month: label,
          value: hourMap.get(h) || 0,
        });
      }
      
      return result;
    }
    case 'This Week': {
      // Fill in missing days of the week and aggregate balance by day name
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
      const dataMap = new Map<string, number>();
      
      spendingData.forEach((item) => {
        const dateKey = format(new Date(item.date), 'EEE', { locale: enUS });
        const currentValue = dataMap.get(dateKey) || 0;
        dataMap.set(dateKey, currentValue + (item.income - item.expense));
      });
      
      const result: Array<{ month: string; value: number }> = [];
      for (let d = new Date(weekStart); d <= weekEnd; d.setDate(d.getDate() + 1)) {
        const dayKey = format(d, 'EEE', { locale: enUS });
        result.push({
          month: dayKey,
          value: dataMap.get(dayKey) || 0,
        });
      }
      return result;
    }
    case 'This Month': {
      // Fill in missing days of the month and aggregate balance by day number
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      const dataMap = new Map<string, number>();
      
      spendingData.forEach((item) => {
        const dateKey = format(new Date(item.date), 'd', { locale: enUS });
        const currentValue = dataMap.get(dateKey) || 0;
        dataMap.set(dateKey, currentValue + (item.income - item.expense));
      });
      
      const result: Array<{ month: string; value: number }> = [];
      for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1)) {
        const dayKey = format(d, 'd', { locale: enUS });
        result.push({
          month: dayKey,
          value: dataMap.get(dayKey) || 0,
        });
      }
      return result;
    }
    case 'This Year': {
      // Group by month and aggregate balance, fill in missing months
      const now = new Date();
      const yearStart = startOfYear(now);
      const yearEnd = endOfYear(now);
      const dataMap = new Map<string, number>();
      
      spendingData.forEach((item) => {
        const monthKey = format(new Date(item.date), 'MMM', { locale: enUS });
        const currentValue = dataMap.get(monthKey) || 0;
        dataMap.set(monthKey, currentValue + (item.income - item.expense));
      });
      
      const result: Array<{ month: string; value: number }> = [];
      for (let d = new Date(yearStart); d <= yearEnd; d.setMonth(d.getMonth() + 1)) {
        const monthKey = format(d, 'MMM', { locale: enUS });
        result.push({
          month: monthKey,
          value: dataMap.get(monthKey) || 0,
        });
      }
      return result;
    }
    default:
      return spendingData.map((item) => {
        const date = new Date(item.date);
        return {
          month: format(date, 'MMM', { locale: enUS }),
          value: item.income - item.expense,
        };
      });
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('Today');
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  
  // Pagination state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [periodStartDate, setPeriodStartDate] = useState<string>('');
  const [periodEndDate, setPeriodEndDate] = useState<string>('');
  const [currentPageStartDate, setCurrentPageStartDate] = useState<string>('');
  const [currentPageEndDate, setCurrentPageEndDate] = useState<string>('');
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  
  // Derived groups from transactions
  const transactionGroups = transformTransactionsToGroups(transactions);
  
  // Reminders state
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoadingReminders, setIsLoadingReminders] = useState<boolean>(true);
  const reminderGroups = transformRemindersToGroups(reminders);
  
  // Stats and chart state
  const [spendingData, setSpendingData] = useState<Array<{ month: string; value: number }>>([]);
  const [balance, setBalance] = useState<number>(0);
  const [categoryStats, setCategoryStats] = useState<any[]>([]);
  
  // Loading and error states
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(true);
  const [isLoadingList, setIsLoadingList] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isBudgetExpanded, setIsBudgetExpanded] = useState<boolean>(false);
  const [shortcuts, setShortcuts] = useState<TransactionShortcut[]>([]);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const [isLoadingShortcuts, setIsLoadingShortcuts] = useState<boolean>(true);

  // Load stats for the full period (chart and balance)
  const loadStatsForPeriod = useCallback(async (period: PeriodType) => {
    const session = getUserSession();
    if (!session?.lineUserId) {
      setError('Not authenticated');
      router.push('/splash');
      return;
    }

    setIsLoadingStats(true);
    setError(null);

    try {
      const { startDate, endDate } = getDateRange(period);
      
      const stats = await fetchTransactionStats(session.lineUserId, {
        startDate,
        endDate,
      });

      setSpendingData(transformSpendingDataForGraph(stats.spendingData, period));
      setBalance(stats.balance);
      setCategoryStats(stats.categoryStats || []);
    } catch (err) {
      console.error('Failed to load stats:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load stats';
      const errorObj = err as { error?: string };
      setError(errorObj.error || errorMessage);
      if (errorObj.error?.includes('401') || errorObj.error?.includes('Unauthorized')) {
        router.push('/splash');
      }
    } finally {
      setIsLoadingStats(false);
    }
  }, [router]);

  // Load shortcuts
  const loadShortcuts = useCallback(async () => {
    const session = getUserSession();
    if (!session?.lineUserId) return;

    setIsLoadingShortcuts(true);
    try {
      const data = await fetchFrequentTransactions(session.lineUserId);
      setShortcuts(data.shortcuts);
      setLastTransaction(data.lastTransaction);
    } catch (err) {
      console.error('Failed to load shortcuts:', err);
    } finally {
      setIsLoadingShortcuts(false);
    }
  }, []);

  // Load reminders for the period
  const loadRemindersForPeriod = useCallback(async (period: PeriodType) => {
    const session = getUserSession();
    if (!session?.lineUserId) return;

    setIsLoadingReminders(true);
    try {
      const { startDate, endDate } = getDateRange(period);
      const data = await fetchReminders(session.lineUserId, {
        startDate,
        endDate,
      });
      setReminders(data);
    } catch (err) {
      console.error('Failed to load reminders:', err);
    } finally {
      setIsLoadingReminders(false);
    }
  }, []);

  // Load initial transactions for the period (first 10-day page)
  const loadInitialTransactionsForPeriod = useCallback(async (period: PeriodType) => {
    const session = getUserSession();
    if (!session?.lineUserId) {
      setError('Not authenticated');
      router.push('/splash');
      return;
    }

    setIsLoadingList(true);
    setError(null);

    try {
      const { startDate, endDate } = getDateRange(period);
      setPeriodStartDate(startDate);
      setPeriodEndDate(endDate);

      // For month and year periods, load all data at once (no pagination)
      // For today and week periods, use pagination (10 days per page)
      const shouldPaginate = period === 'Today' || period === 'This Week';
      
      let pageStartDate: string;
      let pageEndDate: string;
      let hasMorePages: boolean;
      
      if (shouldPaginate) {
        // Get first page (10 days) - start from beginning of period
        const pageRange = getPageDateRange(startDate, endDate, true);
        pageStartDate = pageRange.pageStartDate;
        pageEndDate = pageRange.pageEndDate;
        hasMorePages = pageRange.hasMore;
      } else {
        // Load entire period for month and year
        pageStartDate = startDate;
        pageEndDate = endDate;
        hasMorePages = false;
      }
      
      const pageTransactions = await fetchTransactions(session.lineUserId, {
        startDate: pageStartDate,
        endDate: pageEndDate,
      });

      setTransactions(pageTransactions);
      setCurrentPageStartDate(pageStartDate);
      setCurrentPageEndDate(pageEndDate);
      setHasMore(hasMorePages);
    } catch (err) {
      console.error('Failed to load transactions:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load transactions';
      const errorObj = err as { error?: string };
      setError(errorObj.error || errorMessage);
      if (errorObj.error?.includes('401') || errorObj.error?.includes('Unauthorized')) {
        router.push('/splash');
      }
    } finally {
      setIsLoadingList(false);
      setIsLoadingMore(false);
    }
  }, [router]);

  // Load more transactions (next 10-day page)
  const loadMoreTransactions = useCallback(async () => {
    if (!hasMore || isLoadingMore) {
      return;
    }

    const session = getUserSession();
    if (!session?.lineUserId) {
      setError('Not authenticated');
      return;
    }

    setIsLoadingMore(true);

    try {
      // Calculate next page: start from 1 day after current page end, go forward 10 days
      const currentPageEnd = new Date(currentPageEndDate);
      const nextPageStart = startOfDay(addDays(currentPageEnd, 1));
      const nextPageEndDay = addDays(nextPageStart, 9);
      const nextPageEnd = endOfDay(nextPageEndDay);
      
      // Ensure next page end doesn't go beyond period end
      const periodEnd = endOfDay(new Date(periodEndDate));
      const actualNextPageEnd = nextPageEnd > periodEnd ? periodEnd : nextPageEnd;
      
      // Check if there's more data to load
      const hasMorePages = actualNextPageEnd.getTime() < periodEnd.getTime();
      
      const pageStartDate = nextPageStart.toISOString();
      const pageEndDate = actualNextPageEnd.toISOString();

      const pageTransactions = await fetchTransactions(session.lineUserId, {
        startDate: pageStartDate,
        endDate: pageEndDate,
      });

      // Merge with existing transactions (append, then re-derive groups)
      setTransactions((prev) => {
        // Combine and deduplicate by id
        const existingIds = new Set(prev.map(t => t.id));
        const newTransactions = pageTransactions.filter(t => !existingIds.has(t.id));
        return [...prev, ...newTransactions];
      });

      setCurrentPageStartDate(pageStartDate);
      setCurrentPageEndDate(pageEndDate);
      setHasMore(hasMorePages);
    } catch (err) {
      console.error('Failed to load more transactions:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load more transactions';
      const errorObj = err as { error?: string };
      alert(errorObj.error || errorMessage);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, currentPageEndDate, periodEndDate]);

  // Load data when period changes
  useEffect(() => {
    // Reset pagination state
    setTransactions([]);
    setReminders([]);
    setHasMore(false);
    setIsLoadingMore(false);
    
    // Load shortcuts, stats, transactions, and reminders in parallel
    loadShortcuts();
    loadStatsForPeriod(selectedPeriod);
    loadInitialTransactionsForPeriod(selectedPeriod);
    loadRemindersForPeriod(selectedPeriod);
  }, [selectedPeriod, loadStatsForPeriod, loadInitialTransactionsForPeriod, loadShortcuts, loadRemindersForPeriod]);

  const handleDeleteTransaction = async (transaction: { id: string }) => {
    const session = getUserSession();
    if (!session?.lineUserId) {
      setError('Not authenticated');
      return;
    }

    try {
      await deleteTransaction(session.lineUserId, transaction.id);
      // Remove transaction from local state and reload stats
      setTransactions((prev) => prev.filter(t => t.id !== transaction.id));
      // Reload stats to update balance
      await loadStatsForPeriod(selectedPeriod);
    } catch (err) {
      console.error('Failed to delete transaction:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete transaction';
      const errorObj = err as { error?: string };
      alert(errorObj.error || errorMessage);
    }
  };

  const handleDoneTransaction = async (transaction: { id: string }) => {
    const session = getUserSession();
    if (!session?.lineUserId) {
      setError('Not authenticated');
      return;
    }

    try {
      await updateTransaction(session.lineUserId, transaction.id, { status: 'DONE' });
      // Update transaction status in local state
      setTransactions((prev) =>
        prev.map((t) => (t.id === transaction.id ? { ...t, status: 'DONE' as const } : t))
      );
    } catch (err) {
      console.error('Failed to mark transaction as done:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark transaction as done';
      const errorObj = err as { error?: string };
      alert(errorObj.error || errorMessage);
    }
  };

  const handleBackTransaction = async (transaction: { id: string }) => {
    const session = getUserSession();
    if (!session?.lineUserId) {
      setError('Not authenticated');
      return;
    }

    try {
      // Change status from DONE back to ACTIVE
      await updateTransaction(session.lineUserId, transaction.id, { status: 'ACTIVE' });
      // Update transaction status in local state
      setTransactions((prev) =>
        prev.map((t) => (t.id === transaction.id ? { ...t, status: 'ACTIVE' as const } : t))
      );
    } catch (err) {
      console.error('Failed to mark transaction as active:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark transaction as active';
      const errorObj = err as { error?: string };
      alert(errorObj.error || errorMessage);
    }
  };

  const handleDoneAllForDate = async (date: string) => {
    const session = getUserSession();
    if (!session?.lineUserId) {
      setError('Not authenticated');
      return;
    }

    // Find all transactions for this date that are not already DONE
    const transactionsForDate = transactions.filter((tx) => {
      const txDate = format(new Date(tx.date), 'dd/MM/yyyy', { locale: enUS });
      return txDate === date && tx.status !== 'DONE';
    });

    if (transactionsForDate.length === 0) {
      alert('No tasks to mark as done for today');
      return;
    }

    if (!confirm(`Do you want to mark all ${transactionsForDate.length} items as done for ${date}?`)) {
      return;
    }

    try {
      // Update all transactions in parallel
      await Promise.all(
        transactionsForDate.map((tx) =>
          updateTransaction(session.lineUserId, tx.id, { status: 'DONE' })
        )
      );
      
      // Update transactions in local state
      setTransactions((prev) =>
        prev.map((t) => {
          const txDate = format(new Date(t.date), 'dd/MM/yyyy', { locale: enUS });
          if (txDate === date && t.status !== 'DONE') {
            return { ...t, status: 'DONE' as const };
          }
          return t;
        })
      );
    } catch (err) {
      console.error('Failed to mark all transactions as done:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark all transactions as done';
      const errorObj = err as { error?: string };
      alert(errorObj.error || errorMessage);
    }
  };

  const handleDoneAllForPeriod = async () => {
    const session = getUserSession();
    if (!session?.lineUserId) {
      setError('Not authenticated');
      return;
    }

    // Find all transactions in the current period that are not already DONE
    const { startDate, endDate } = getDateRange(selectedPeriod);
    const transactionsInPeriod = transactions.filter((tx) => {
      const txDate = new Date(tx.date);
      const periodStart = new Date(startDate);
      const periodEnd = new Date(endDate);
      return txDate >= periodStart && txDate <= periodEnd && tx.status !== 'DONE';
    });

    if (transactionsInPeriod.length === 0) {
      alert(`No tasks to mark as done for ${selectedPeriod}`);
      return;
    }

    if (!confirm(`Do you want to mark all ${transactionsInPeriod.length} items as done for ${selectedPeriod}?`)) {
      return;
    }

    try {
      // Update all transactions in parallel
      await Promise.all(
        transactionsInPeriod.map((tx) =>
          updateTransaction(session.lineUserId, tx.id, { status: 'DONE' })
        )
      );
      
      // Update transactions in local state
      const periodStart = new Date(startDate);
      const periodEnd = new Date(endDate);
      setTransactions((prev) =>
        prev.map((t) => {
          const txDate = new Date(t.date);
          if (txDate >= periodStart && txDate <= periodEnd && t.status !== 'DONE') {
            return { ...t, status: 'DONE' as const };
          }
          return t;
        })
      );
    } catch (err) {
      console.error('Failed to mark all transactions as done:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark all transactions as done';
      const errorObj = err as { error?: string };
      alert(errorObj.error || errorMessage);
    }
  };

  const handleQuickAdd = (shortcut: {
    name: string;
    amount: number;
    categoryId: string | null;
    type: 'INCOME' | 'EXPENSE';
  }) => {
    const params = new URLSearchParams({
      type: shortcut.type,
      amount: shortcut.amount.toString(),
      name: shortcut.name,
    });
    
    if (shortcut.categoryId) {
      params.append('categoryId', shortcut.categoryId);
    }

    router.push(`/transaction/add?${params.toString()}`);
  };

  // Reminder handlers
  const handleDoneReminder = async (reminder: { id: string }) => {
    const session = getUserSession();
    if (!session?.lineUserId) {
      setError('Not authenticated');
      return;
    }

    try {
      await updateReminder(session.lineUserId, reminder.id, { status: 'DONE' });
      setReminders((prev) =>
        prev.map((r) => (r.id === reminder.id ? { ...r, status: 'DONE' as const } : r))
      );
    } catch (err) {
      console.error('Failed to mark reminder as done:', err);
      const errorObj = err as { error?: string };
      alert(errorObj.error || 'Failed to mark reminder as done');
    }
  };

  const handleBackReminder = async (reminder: { id: string }) => {
    const session = getUserSession();
    if (!session?.lineUserId) {
      setError('Not authenticated');
      return;
    }

    try {
      await updateReminder(session.lineUserId, reminder.id, { status: 'ACTIVE' });
      setReminders((prev) =>
        prev.map((r) => (r.id === reminder.id ? { ...r, status: 'ACTIVE' as const } : r))
      );
    } catch (err) {
      console.error('Failed to mark reminder as active:', err);
      const errorObj = err as { error?: string };
      alert(errorObj.error || 'Failed to mark reminder as active');
    }
  };

  const handleDeleteReminder = async (reminder: { id: string }) => {
    const session = getUserSession();
    if (!session?.lineUserId) {
      setError('Not authenticated');
      return;
    }

    try {
      await deleteReminder(session.lineUserId, reminder.id);
      setReminders((prev) => prev.filter((r) => r.id !== reminder.id));
    } catch (err) {
      console.error('Failed to delete reminder:', err);
      const errorObj = err as { error?: string };
      alert(errorObj.error || 'Failed to delete reminder');
    }
  };

  const session = getUserSession();
  const displayName = session?.displayName || 'คุณ';

  return (
    <SafeArea className="h-dvh bg-background dark:bg-zinc-950 flex flex-col overflow-hidden">
      <Container className="py-6 pb-36 sm:pb-32 flex-1 overflow-y-auto min-h-0 no-scrollbar">
        {/* Header & Greeting */}
        <div className="mb-8 space-y-6 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-foreground">
                สวัสดีครับ {displayName}
              </h2>
              <p className="text-sm font-medium text-foreground/40 font-prompt">
                วันนี้ให้ละมุนช่วยจดอะไรดีครับ?
              </p>
            </div>
            {/* Search Icon */}
            <Link
              href="/dashboard/search"
              className="p-3.5 text-foreground/50 hover:text-primary bg-white dark:bg-zinc-900 shadow-xl shadow-black/5 rounded-3xl transition-all active:scale-90"
            >
              <SearchIcon className="w-5 h-5" />
            </Link>
          </div>

          {/* Balance Card - Premium Design */}
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full opacity-50 group-hover:opacity-70 transition-opacity" />
            <div className="relative glass p-8 rounded-[2.5rem] text-center border-white/40 dark:border-white/5 shadow-2xl shadow-primary/10">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-base font-black uppercase tracking-[0.2em] text-foreground/30 font-prompt">
                  บันทึกความละมุน
                </span>
                {/* Period Selector Button - Inline with label */}
                <div className="relative inline-block">
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value as PeriodType)}
                    className="appearance-none pl-2 pr-6 py-1 rounded-full border-0 bg-primary/10 text-sm font-bold text-primary hover:bg-primary/20 transition-all cursor-pointer focus:outline-none uppercase tracking-wider"
                  >
                    <option value="Today">Today</option>
                    <option value="This Week">Week</option>
                    <option value="This Month">Month</option>
                    <option value="This Year">Year</option>
                  </select>
                  <svg
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-primary pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {isLoadingStats ? (
                <div className="h-14 flex items-center justify-center">
                  <div className="w-32 h-10 bg-foreground/5 animate-pulse rounded-2xl" />
                </div>
              ) : error ? (
                <h2 className="text-lg font-medium text-destructive">
                  {error}
                </h2>
              ) : (
                <h2 className="text-5xl font-black text-foreground tracking-tighter">
                  {balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บ.
                </h2>
              )}
            </div>
          </div>
        </div>

        {/* Tabs - Glass Design */}
        <div className="mb-8">
          <div className="flex p-1.5 glass rounded-3xl shadow-xl shadow-black/5 border-white/20">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 py-3 px-4 rounded-2xl text-sm font-bold transition-all duration-300 font-prompt ${
                activeTab === 'dashboard'
                  ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-[1.02]'
                  : 'text-foreground/40 hover:text-foreground/60'
              }`}
            >
              แดชบอร์ด
            </button>
            <button
              onClick={() => setActiveTab('task')}
              className={`flex-1 py-3 px-4 rounded-2xl text-sm font-bold transition-all duration-300 font-prompt ${
                activeTab === 'task'
                  ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-[1.02]'
                  : 'text-foreground/40 hover:text-foreground/60'
              }`}
            >
              รายการจด
            </button>
          </div>
        </div>

        {/* Quick Add Section */}
        <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <QuickAdd 
            shortcuts={shortcuts} 
            lastTransaction={lastTransaction} 
            onSelect={handleQuickAdd}
            isLoading={isLoadingShortcuts}
          />
        </div>

        {/* Content based on active tab */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {activeTab === 'dashboard' ? (
            <>
              {/* Spending Graph Card */}
              <div className="mb-8 glass rounded-[2.5rem] shadow-xl shadow-black/5 p-6 border-white/20">
                <div className="flex items-center justify-between mb-4 px-2">
                  <h3 className="text-sm font-black text-foreground/30 uppercase tracking-[0.2em] font-prompt">
                    แนวโน้มการเงิน
                  </h3>
                </div>
                <div className="overflow-x-auto lg:overflow-x-visible scroll-smooth no-scrollbar">
                  <div className="w-full min-w-[600px] lg:min-w-full">
                    {isLoadingStats ? (
                      <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <p className="text-xs font-medium text-foreground/30 font-prompt">กําลังวาดกราฟ...</p>
                      </div>
                    ) : (
                      <SpendingGraph 
                        data={spendingData} 
                        currentMonthIndex={spendingData.length > 0 ? spendingData.length - 1 : 0} 
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Budget Progress Card */}
              {categoryStats.length > 0 && (
                <div className="mb-8 glass rounded-[2.5rem] shadow-xl shadow-black/5 p-6 border-white/20">
                  <button 
                    onClick={() => setIsBudgetExpanded(!isBudgetExpanded)}
                    className="w-full flex items-center justify-between group"
                  >
                    <h3 className="text-sm font-black text-foreground/30 uppercase tracking-[0.2em] font-prompt text-left">
                      งบประมาณรายหมวด
                    </h3>
                    <div className={`p-1.5 rounded-full bg-foreground/5 transition-all duration-300 ${isBudgetExpanded ? 'rotate-180 bg-primary/10 text-primary' : 'text-foreground/30'}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  
                  {isBudgetExpanded && (
                    <div className="mt-6 animate-fade-in-up">
                      <BudgetProgress 
                        categories={categoryStats} 
                        isLoading={isLoadingStats} 
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Transaction List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-sm font-black text-foreground/30 uppercase tracking-[0.2em] font-prompt">
                    รายการล่าสุด
                  </h3>
                </div>
                {isLoadingList ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3 glass rounded-[2.5rem]">
                    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <p className="text-xs font-medium text-foreground/30 font-prompt">รอสักครู่นะครับ...</p>
                  </div>
                ) : error ? (
                  <div className="glass p-12 rounded-[2.5rem] text-center">
                    <p className="text-sm font-medium text-destructive font-prompt">{error}</p>
                  </div>
                ) : transactionGroups.length > 0 ? (
                  <>
                    <TransactionList
                      groups={transactionGroups}
                      onTransactionClick={(transaction) => {
                        console.log('Transaction clicked:', transaction);
                      }}
                      onDelete={handleDeleteTransaction}
                    />
                    
                    {/* View More Button */}
                    {hasMore && (
                      <div className="mt-10 mb-8 text-center">
                        <button
                          onClick={loadMoreTransactions}
                          disabled={isLoadingMore}
                          className="px-10 py-4 text-xs font-bold text-foreground/40 hover:text-primary glass rounded-full shadow-lg shadow-black/5 border-white/20 transition-all active:scale-95 disabled:opacity-50 font-prompt"
                        >
                          {isLoadingMore ? 'แป๊บเดียวครับ...' : 'ดูเพิ่มอีกนิด'}
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="glass p-16 rounded-[2.5rem] text-center border-dashed border-2 border-foreground/5">
                    <p className="text-sm font-medium text-foreground/30 font-prompt">ยังไม่มีรายการวันนี้เลยครับ</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Reminder List Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-sm font-black text-foreground/30 uppercase tracking-[0.2em] font-prompt">
                    การแจ้งเตือน
                  </h3>
                  <Link
                    href="/reminders/add"
                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-primary rounded-2xl hover:brightness-105 shadow-lg shadow-primary/20 transition-all active:scale-95 font-prompt"
                  >
                    <PlusIcon className="w-4 h-4" />
                    เพิ่ม
                  </Link>
                </div>
                {isLoadingReminders ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3 glass rounded-[2.5rem]">
                    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <p className="text-xs font-medium text-foreground/30 font-prompt">กำลังโหลดการแจ้งเตือน...</p>
                  </div>
                ) : error ? (
                  <div className="glass p-12 rounded-[2.5rem] text-center">
                    <p className="text-sm font-medium text-destructive font-prompt">{error}</p>
                  </div>
                ) : reminderGroups.length > 0 ? (
                  <ReminderList
                    groups={reminderGroups}
                    onDone={handleDoneReminder}
                    onBack={handleBackReminder}
                    onDelete={handleDeleteReminder}
                  />
                ) : (
                  <div className="glass p-16 rounded-[2.5rem] text-center border-dashed border-2 border-foreground/5">
                    <div className="flex flex-col items-center gap-4">
                      <span className="text-4xl">🔔</span>
                      <p className="text-sm font-medium text-foreground/30 font-prompt">ยังไม่มีการแจ้งเตือนครับ</p>
                      <Link
                        href="/reminders/add"
                        className="px-6 py-3 text-sm font-bold text-white bg-primary rounded-2xl hover:brightness-105 shadow-lg shadow-primary/20 transition-all active:scale-95 font-prompt"
                      >
                        + เพิ่มการแจ้งเตือน
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </Container>

      <BottomNavigation />
    </SafeArea>
  );
}

