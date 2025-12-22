import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getLineUserIdFromHeaders, getUserByLineUserId } from '@/app/lib/auth';

type TransactionSelect = {
  type: 'INCOME' | 'EXPENSE';
  amount: unknown;
  date: Date;
};

export async function GET(request: NextRequest) {
  try {
    const lineUserId = getLineUserIdFromHeaders(request.headers);

    if (!lineUserId) {
      return NextResponse.json(
        { error: 'Missing x-line-user-id header' },
        { status: 401 }
      );
    }

    const user = await getUserByLineUserId(lineUserId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type') as 'INCOME' | 'EXPENSE' | null;

    const where: {
      userId: string;
      type?: 'INCOME' | 'EXPENSE';
      date?: {
        gte?: Date;
        lte?: Date;
      };
    } = {
      userId: user.id,
    };

    if (type) {
      where.type = type;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    // Get transactions filtered by date range
    const transactions = await prisma.transaction.findMany({
      where,
      select: {
        type: true,
        amount: true,
        date: true,
        categoryId: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Get transactions for the current month to calculate budget progress
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const monthlyTransactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        date: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      select: {
        type: true,
        amount: true,
        categoryId: true,
      },
    });

    // Get categories to match with budgets
    const categories = await prisma.category.findMany({
      where: { userId: user.id },
    });

    // Calculate totals for the requested period
    const totalIncome = transactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const balance = totalIncome - totalExpense;

    // Calculate category-wise stats using monthly transactions
    const categoryStats = categories
      .filter(cat => cat.type === 'EXPENSE')
      .map(cat => {
        const spent = monthlyTransactions
          .filter(t => t.categoryId === cat.id && t.type === 'EXPENSE')
          .reduce((sum, t) => sum + Number(t.amount), 0);
        
        return {
          id: cat.id,
          name: cat.name,
          emoji: cat.emoji,
          budget: cat.budget ? Number(cat.budget) : null,
          spent,
        };
      })
      .filter(cat => cat.budget !== null || cat.spent > 0)
      .sort((a, b) => (b.budget || 0) - (a.budget || 0) || b.spent - a.spent);

    // Send all transactions with ISO date strings
    const spendingData = transactions.map((transaction) => ({
      date: transaction.date.toISOString(),
      income: transaction.type === 'INCOME' ? Number(transaction.amount) : 0,
      expense: transaction.type === 'EXPENSE' ? Number(transaction.amount) : 0,
      total: transaction.type === 'INCOME' ? Number(transaction.amount) : -Number(transaction.amount),
    }));

    return NextResponse.json({
      stats: {
        totalIncome,
        totalExpense,
        balance,
        transactionCount: transactions.length,
        spendingData,
        categoryStats,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json(
      { error: 'Failed to get stats' },
      { status: 500 }
    );
  }
}

