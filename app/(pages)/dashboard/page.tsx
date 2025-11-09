'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/app/components/layout/container.component';
import SafeArea from '@/app/components/layout/safe-area.component';
import SpendingGraph from '@/app/components/dashboard/spending-graph.component';
import TransactionList from '@/app/components/dashboard/transaction-list.component';
import TaskList from '@/app/components/dashboard/task-list.component';
import { SearchIcon } from '@/app/components/icons';
import BottomNavigation from '@/app/components/layout/bottom-navigation.component';

type TabType = 'dashboard' | 'task';
type PeriodType = 'วันนี้' | 'อาทิตย์นี้' | 'เดือนนี้' | 'ปีนี้';

// Mock data for different periods
const getSpendingData = (period: PeriodType) => {
  switch (period) {
    case 'วันนี้':
      // Hourly data for today (24 hours)
      return [
        { month: '00', value: 20 },
        { month: '06', value: 15 },
        { month: '12', value: 45 },
        { month: '18', value: 30 },
        { month: '24', value: 25 },
      ];
    case 'อาทิตย์นี้':
      // Daily data for this week (7 days)
      return [
        { month: 'จ', value: 120 },
        { month: 'อ', value: 150 },
        { month: 'พ', value: 100 },
        { month: 'พฤ', value: 180 },
        { month: 'ศ', value: 140 },
        { month: 'ส', value: 200 },
        { month: 'อา', value: 160 },
      ];
    case 'เดือนนี้':
      // Weekly data for this month (4-5 weeks)
      return [
        { month: 'wk1', value: 450 },
        { month: 'wk2', value: 520 },
        { month: 'wk3', value: 480 },
        { month: 'wk4', value: 550 },
      ];
    case 'ปีนี้':
      // Monthly data for this year (12 months)
      return [
        { month: 'ม.ค.', value: 1200 },
        { month: 'ก.พ.', value: 1500 },
        { month: 'มี.ค.', value: 1300 },
        { month: 'เม.ย.', value: 1400 },
        { month: 'พ.ค.', value: 1600 },
        { month: 'มิ.ย.', value: 1450 },
        { month: 'ก.ค.', value: 1700 },
        { month: 'ส.ค.', value: 1550 },
        { month: 'ก.ย.', value: 1800 },
        { month: 'ต.ค.', value: 1650 },
        { month: 'พ.ย.', value: 1750 },
        { month: 'ธ.ค.', value: 1900 },
      ];
    default:
      return [
        { month: 'jul', value: 50 },
        { month: 'aug', value: 70 },
        { month: 'sep', value: 60 },
        { month: 'oct', value: 80 },
        { month: 'nov', value: 65 },
        { month: 'dec', value: 75 },
      ];
  }
};

const transactionGroups = [
  {
    date: '28/10/2568',
    total: 300,
    transactions: [
      {
        id: '1',
        category: 'Pet Care',
        name: 'petco',
        amount: 190,
        type: 'expense' as const,
        icon: 'pet' as const,
      },
      {
        id: '2',
        category: 'Coffee',
        name: 'Amazon',
        amount: 80,
        type: 'expense' as const,
        icon: 'coffee' as const,
      },
      {
        id: '3',
        category: 'Food',
        name: 'Salad',
        amount: 59,
        type: 'expense' as const,
        icon: 'food' as const,
      },
      {
        id: '4',
        category: 'Oil',
        name: 'gas sohal 95',
        amount: 1000,
        type: 'expense' as const,
        icon: 'oil' as const,
      },
    ],
  },
  {
    date: '27/10/2568',
    total: 300,
    transactions: [
      {
        id: '5',
        category: 'Food',
        name: 'Salad',
        amount: 120,
        type: 'expense' as const,
        icon: 'food' as const,
      },
    ],
  },
];

const taskGroups = [
  {
    date: '28/10/2568',
    total: 300,
    transactions: [
      {
        id: '1',
        category: 'Pet Care',
        name: 'petco',
        amount: 190,
        type: 'expense' as const,
        icon: 'pet' as const,
        status: 'done' as const,
      },
      {
        id: '2',
        category: 'Coffee',
        name: 'Amazon',
        amount: 80,
        type: 'expense' as const,
        icon: 'coffee' as const,
        status: 'back' as const,
      },
      {
        id: '3',
        category: 'Food',
        name: 'Salad',
        amount: 59,
        type: 'expense' as const,
        icon: 'food' as const,
        status: 'done' as const,
      },
      {
        id: '4',
        category: 'Oil',
        name: 'gas sohal 95',
        amount: 1000,
        type: 'expense' as const,
        icon: 'oil' as const,
        status: 'back' as const,
      },
    ],
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('วันนี้');
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  
  const spendingData = getSpendingData(selectedPeriod);

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
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-black dark:text-white">
              ฿300.00
            </h2>
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
                <SpendingGraph 
                  data={spendingData} 
                  currentMonthIndex={selectedPeriod === 'วันนี้' ? 4 : selectedPeriod === 'อาทิตย์นี้' ? 6 : selectedPeriod === 'เดือนนี้' ? 3 : 11} 
                />
              </div>
            </div>

            {/* Transaction List */}
            <div>
              <TransactionList
                groups={transactionGroups}
                onTransactionClick={(transaction) => {
                  console.log('Transaction clicked:', transaction);
                }}
              />
              
              {/* View More Button */}
              <div className="mt-6 mb-4 text-center">
                <button className="px-6 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                  ดูเพิ่มเติม
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Task List */}
            <div>
              <TaskList
                groups={taskGroups}
                onDone={(transaction) => {
                  console.log('Done:', transaction);
                }}
                onBack={(transaction) => {
                  console.log('Back:', transaction);
                }}
              />
              
              {/* View More Button */}
              <div className="mt-6 mb-4 text-center">
                <button className="px-6 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                  ดูเพิ่มเติม
                </button>
              </div>
            </div>
          </>
        )}
      </Container>

      <BottomNavigation />
    </SafeArea>
  );
}

