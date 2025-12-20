import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getLineUserIdFromHeaders, getUserByLineUserId } from '@/app/lib/auth';

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
    const type = searchParams.get('type') || 'EXPENSE'; // Default to EXPENSE

    const where: any = {
      userId: user.id,
      type: type as any,
    };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: true,
      },
    });

    const categoryMap: Record<string, { id: string; name: string; emoji: string | null; amount: number }> = {};
    let total = 0;

    transactions.forEach((t) => {
      const amount = Number(t.amount);
      total += amount;
      const catId = t.categoryId || 'uncategorized';
      
      if (!categoryMap[catId]) {
        categoryMap[catId] = {
          id: catId,
          name: t.category?.name || 'Uncategorized',
          emoji: t.category?.emoji || (catId === 'uncategorized' ? '📁' : null),
          amount: 0,
        };
      }
      categoryMap[catId].amount += amount;
    });

    const byCategory = Object.values(categoryMap).map((cat) => ({
      ...cat,
      percentage: total > 0 ? (cat.amount / total) * 100 : 0,
    })).sort((a, b) => b.amount - a.amount);

    return NextResponse.json({
      total,
      byCategory,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Failed to get stats' },
      { status: 500 }
    );
  }
}
