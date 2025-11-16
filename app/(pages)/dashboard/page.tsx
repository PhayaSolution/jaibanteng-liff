'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, addDays } from 'date-fns';
import { th } from 'date-fns/locale';
import Container from '@/app/components/layout/container.component';
import SafeArea from '@/app/components/layout/safe-area.component';
import SpendingGraph from '@/app/components/dashboard/spending-graph.component';
import TransactionList from '@/app/components/dashboard/transaction-list.component';
import TaskList from '@/app/components/dashboard/task-list.component';
import { SearchIcon } from '@/app/components/icons';
import BottomNavigation from '@/app/components/layout/bottom-navigation.component';
import { fetchTransactions, fetchTransactionStats, deleteTransaction } from '@/app/lib/api';
import { Transaction } from '@/app/lib/types';
import { getUserSession } from '@/app/utils/storage.util';

type TabType = 'dashboard' | 'task';
type PeriodType = 'วันนี้' | 'อาทิตย์นี้' | 'เดือนนี้' | 'ปีนี้';

interface TransactionGroup {
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
    status: 'done' | 'back';
  }>;
}

// Helper to get date range for period
function getDateRange(period: PeriodType): { startDate: string; endDate: string } {
  const now = new Date();
  let start: Date;
  let end: Date = endOfDay(now);

  switch (period) {
    case 'วันนี้':
      start = startOfDay(now);
      break;
    case 'อาทิตย์นี้':
      start = startOfWeek(now, { weekStartsOn: 1 }); // Monday
      end = endOfWeek(now, { weekStartsOn: 1 });
      break;
    case 'เดือนนี้':
      start = startOfMonth(now);
      end = endOfMonth(now);
      break;
    case 'ปีนี้':
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

// Transform transactions to groups
function transformTransactionsToGroups(transactions: Transaction[]): TransactionGroup[] {
  const groupsMap = new Map<string, TransactionGroup>();

  transactions.forEach((tx) => {
    const date = format(new Date(tx.date), 'dd/MM/yyyy', { locale: th });
    
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

// Transform transactions to task groups (filter by status BACK)
function transformTransactionsToTaskGroups(transactions: Transaction[]): TaskGroup[] {
  const backTransactions = transactions.filter((tx) => tx.status === 'BACK');
  const groupsMap = new Map<string, TaskGroup>();

  backTransactions.forEach((tx) => {
    const date = format(new Date(tx.date), 'dd/MM/yyyy', { locale: th });
    
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
      status: 'back',
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
    case 'วันนี้': {
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
    case 'อาทิตย์นี้': {
      // Fill in missing days of the week and aggregate balance by day name
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
      const dataMap = new Map<string, number>();
      
      spendingData.forEach((item) => {
        const dateKey = format(new Date(item.date), 'EEE', { locale: th });
        const currentValue = dataMap.get(dateKey) || 0;
        dataMap.set(dateKey, currentValue + (item.income - item.expense));
      });
      
      const result: Array<{ month: string; value: number }> = [];
      for (let d = new Date(weekStart); d <= weekEnd; d.setDate(d.getDate() + 1)) {
        const dayKey = format(d, 'EEE', { locale: th });
        result.push({
          month: dayKey,
          value: dataMap.get(dayKey) || 0,
        });
      }
      return result;
    }
    case 'เดือนนี้': {
      // Fill in missing days of the month and aggregate balance by day number
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      const dataMap = new Map<string, number>();
      
      spendingData.forEach((item) => {
        const dateKey = format(new Date(item.date), 'd', { locale: th });
        const currentValue = dataMap.get(dateKey) || 0;
        dataMap.set(dateKey, currentValue + (item.income - item.expense));
      });
      
      const result: Array<{ month: string; value: number }> = [];
      for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1)) {
        const dayKey = format(d, 'd', { locale: th });
        result.push({
          month: dayKey,
          value: dataMap.get(dayKey) || 0,
        });
      }
      return result;
    }
    case 'ปีนี้': {
      // Group by month and aggregate balance, fill in missing months
      const now = new Date();
      const yearStart = startOfYear(now);
      const yearEnd = endOfYear(now);
      const dataMap = new Map<string, number>();
      
      spendingData.forEach((item) => {
        const monthKey = format(new Date(item.date), 'MMM', { locale: th });
        const currentValue = dataMap.get(monthKey) || 0;
        dataMap.set(monthKey, currentValue + (item.income - item.expense));
      });
      
      const result: Array<{ month: string; value: number }> = [];
      for (let d = new Date(yearStart); d <= yearEnd; d.setMonth(d.getMonth() + 1)) {
        const monthKey = format(d, 'MMM', { locale: th });
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
          month: format(date, 'MMM', { locale: th }),
          value: item.income - item.expense,
        };
      });
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('วันนี้');
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
      const shouldPaginate = period === 'วันนี้' || period === 'อาทิตย์นี้';
      
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

  return (
    <SafeArea className="min-h-dvh bg-white dark:bg-black">
      <Container className="py-4 pb-20">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            {/* Period Selector Button */}
            <div className="relative inline-block">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as PeriodType)}
                className="appearance-none px-4 py-2 pr-8 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-medium text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <option value="วันนี้">วันนี้</option>
                <option value="อาทิตย์นี้">อาทิตย์นี้</option>
                <option value="เดือนนี้">เดือนนี้</option>
                <option value="ปีนี้">ปีนี้</option>
              </select>
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black dark:text-white pointer-events-none"
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
              className="p-2 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <SearchIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Balance - Centered */}
          <div className="text-center">
            {isLoadingStats ? (
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-black dark:text-white">
                ...
              </h2>
            ) : error ? (
              <h2 className="text-lg font-medium text-red-600 dark:text-red-400">
                {error}
              </h2>
            ) : (
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-black dark:text-white">
                ฿{balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-8 border-b border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`group relative px-4 py-3 text-sm font-semibold transition-all duration-300 ease-in-out ${
                activeTab === 'dashboard'
                  ? 'text-black dark:text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <span className="relative z-10">Dashboard</span>
              {activeTab === 'dashboard' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black dark:bg-white transition-all duration-300 ease-in-out"></span>
              )}
              {activeTab !== 'dashboard' && (
                <span className="absolute bottom-0 left-1/2 right-1/2 h-0.5 bg-transparent transition-all duration-300 ease-in-out group-hover:left-0 group-hover:right-0 group-hover:bg-gray-300 dark:group-hover:bg-gray-600"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('task')}
              className={`group relative px-4 py-3 text-sm font-semibold transition-all duration-300 ease-in-out ${
                activeTab === 'task'
                  ? 'text-black dark:text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <span className="relative z-10">Task</span>
              {activeTab === 'task' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black dark:bg-white transition-all duration-300 ease-in-out"></span>
              )}
              {activeTab !== 'task' && (
                <span className="absolute bottom-0 left-1/2 right-1/2 h-0.5 bg-transparent transition-all duration-300 ease-in-out group-hover:left-0 group-hover:right-0 group-hover:bg-gray-300 dark:group-hover:bg-gray-600"></span>
              )}
            </button>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'dashboard' ? (
          <>
            {/* Spending Graph - Full Width on Desktop, Scrollable on Mobile */}
            <div className="mb-4 -mx-4 sm:-mx-6 md:-mx-8 lg:-mx-8 overflow-x-auto lg:overflow-x-visible scroll-smooth">
              <div className="w-full min-w-[800px] lg:min-w-full">
                {isLoadingStats ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">กำลังโหลดกราฟ...</p>
                  </div>
                ) : (
                  <SpendingGraph 
                    data={spendingData} 
                    currentMonthIndex={spendingData.length > 0 ? spendingData.length - 1 : 0} 
                  />
                )}
              </div>
            </div>

            {/* Transaction List */}
            <div>
              {isLoadingList ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">กำลังโหลดรายการ...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-600 dark:text-red-400">{error}</p>
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
                    <div className="mt-6 mb-4 text-center">
                      <button
                        onClick={loadMoreTransactions}
                        disabled={isLoadingMore}
                        className="px-6 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoadingMore ? 'กำลังโหลด...' : 'ดูเพิ่มเติม'}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">ไม่มีรายการธุรกรรม</p>
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
                  <p className="text-gray-500 dark:text-gray-400">กำลังโหลดรายการ...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-600 dark:text-red-400">{error}</p>
                </div>
              ) : taskGroups.length > 0 ? (
                <>
                  <TaskList
                    groups={taskGroups}
                    onDone={(transaction) => {
                      console.log('Done:', transaction);
                    }}
                    onBack={(transaction) => {
                      console.log('Back:', transaction);
                    }}
                    onDelete={handleDeleteTransaction}
                  />
                  
                  {/* View More Button */}
                  {hasMore && (
                    <div className="mt-6 mb-4 text-center">
                      <button
                        onClick={loadMoreTransactions}
                        disabled={isLoadingMore}
                        className="px-6 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoadingMore ? 'กำลังโหลด...' : 'ดูเพิ่มเติม'}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">ไม่มีรายการงาน</p>
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

