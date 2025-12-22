'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, addDays } from 'date-fns';
import { enUS } from 'date-fns/locale';
import Container from '@/app/components/layout/container.component';
import SafeArea from '@/app/components/layout/safe-area.component';
import SpendingGraph from '@/app/components/dashboard/spending-graph.component';
import TransactionList from '@/app/components/dashboard/transaction-list.component';
import TaskList from '@/app/components/dashboard/task-list.component';
import { SearchIcon } from '@/app/components/icons';
import BottomNavigation from '@/app/components/layout/bottom-navigation.component';
import { fetchTransactions, fetchTransactionStats, deleteTransaction, updateTransaction } from '@/app/lib/api';
import { Transaction } from '@/app/lib/types';
import { getUserSession } from '@/app/utils/storage.util';

import { transformTransactionsToGroups, TransactionGroup } from '@/app/lib/utils';

type TabType = 'dashboard' | 'task';
type PeriodType = 'Today' | 'This Week' | 'This Month' | 'This Year';

interface TaskGroup {
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
    status?: 'done' | 'active';
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

// Transform transactions to task groups (show all transactions, filter by selected period)
function transformTransactionsToTaskGroups(transactions: Transaction[]): TaskGroup[] {
  // Show all transactions in the selected period (not just BACK status)
  const groupsMap = new Map<string, TaskGroup>();

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
      status: tx.status === 'DONE' ? 'done' : 'active', // Only 2 states: 'done' or 'active'
    });
  });

  return Array.from(groupsMap.values()).sort((a, b) => {
    const dateA = new Date(a.date.split('/').reverse().join('-'));
    const dateB = new Date(b.date.split('/').reverse().join('-'));
    return dateB.getTime() - dateA.getTime();
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
  const taskGroups = transformTransactionsToTaskGroups(transactions);
  
  // Stats and chart state
  const [spendingData, setSpendingData] = useState<Array<{ month: string; value: number }>>([]);
  const [balance, setBalance] = useState<number>(0);
  
  // Loading and error states
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(true);
  const [isLoadingList, setIsLoadingList] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
    setHasMore(false);
    setIsLoadingMore(false);
    
    // Load stats and initial transactions in parallel
    loadStatsForPeriod(selectedPeriod);
    loadInitialTransactionsForPeriod(selectedPeriod);
  }, [selectedPeriod, loadStatsForPeriod, loadInitialTransactionsForPeriod]);

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

  return (
    <SafeArea className="h-dvh bg-gray-50 dark:bg-black flex flex-col overflow-hidden">
      <Container className="py-4 pb-32 sm:pb-24 flex-1 overflow-y-auto min-h-0">
        {/* Header */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center justify-between">
            {/* Period Selector Button */}
            <div className="relative inline-block">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as PeriodType)}
                className="appearance-none px-4 py-2 pr-10 rounded-full border-0 bg-white dark:bg-zinc-900 shadow-sm text-sm font-semibold text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all cursor-pointer focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none"
              >
                <option value="Today">Today</option>
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
                <option value="This Year">This Year</option>
              </select>
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>

            {/* Search Icon */}
            <button
              onClick={() => router.push('/dashboard/search')}
              className="p-2.5 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white bg-white dark:bg-zinc-900 shadow-sm hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-full transition-all"
            >
              <SearchIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Balance - Centered */}
          <div className="text-center py-2">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Available Balance</span>
            {isLoadingStats ? (
              <h2 className="mt-1 text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white animate-pulse">
                ...
              </h2>
            ) : error ? (
              <h2 className="mt-1 text-lg font-medium text-rose-600 dark:text-rose-500">
                {error}
              </h2>
            ) : (
              <h2 className="mt-1 text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
                ฿{balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex p-1 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === 'dashboard'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-md'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-800'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('task')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === 'task'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-md'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-800'
              }`}
            >
              Task
            </button>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'dashboard' ? (
          <>
            {/* Spending Graph */}
            <div className="mb-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-4 overflow-hidden">
              <div className="overflow-x-auto lg:overflow-x-visible scroll-smooth pb-2">
                <div className="w-full min-w-[600px] lg:min-w-full">
                  {isLoadingStats ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 dark:text-gray-400">Loading graph...</p>
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

            {/* Transaction List */}
            <div>
              {isLoadingList ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">Loading transactions...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-rose-600 dark:text-rose-500">{error}</p>
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
                    <div className="mt-6 mb-8 text-center">
                      <button
                        onClick={loadMoreTransactions}
                        disabled={isLoadingMore}
                        className="px-6 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-full shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoadingMore ? 'Loading...' : 'Load more'}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">No transactions found</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Task List */}
            <div>
              {isLoadingList ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">Loading tasks...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-600 dark:text-red-400">{error}</p>
                </div>
              ) : taskGroups.length > 0 ? (
                <>
                  <TaskList
                    groups={taskGroups}
                    onDone={handleDoneTransaction}
                    onBack={handleBackTransaction}
                    onDelete={handleDeleteTransaction}
                    onDoneAllForDate={handleDoneAllForDate}
                    onDoneAllForPeriod={handleDoneAllForPeriod}
                    selectedPeriod={selectedPeriod}
                  />
                  
                  {/* View More Button */}
                  {hasMore && (
                    <div className="mt-6 mb-8 text-center">
                      <button
                        onClick={loadMoreTransactions}
                        disabled={isLoadingMore}
                        className="px-6 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-full shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoadingMore ? 'Loading...' : 'Load more'}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">No tasks found</p>
                </div>
              )}
            </div>
          </>
        )}
      </Container>

      <BottomNavigation />
    </SafeArea>
  );
}

