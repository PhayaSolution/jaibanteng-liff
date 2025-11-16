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
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Calculate totals only for filtered transactions
    const totalIncome = transactions
      .filter((t: TransactionSelect) => t.type === 'INCOME')
      .reduce((sum: number, t: TransactionSelect) => sum + Number(t.amount), 0);

    const totalExpense = transactions
      .filter((t: TransactionSelect) => t.type === 'EXPENSE')
      .reduce((sum: number, t: TransactionSelect) => sum + Number(t.amount), 0);

    const balance = totalIncome - totalExpense;

    // Send all transactions with ISO date strings
    // Client will convert to local timezone and group according to selected period
    const spendingData = transactions.map((transaction: TransactionSelect) => ({
      date: transaction.date.toISOString(), // ISO string with full datetime for client to convert to local timezone
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

