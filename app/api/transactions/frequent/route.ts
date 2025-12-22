import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getLineUserIdFromHeaders, getUserByLineUserId } from '@/app/lib/auth';
import { subMonths } from 'date-fns';

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

    // Filter for the last 1 month as requested
    const oneMonthAgo = subMonths(new Date(), 1);

    // Group by Category, Name, and Amount to find specific frequent patterns within the last month
    const frequentItems = await prisma.transaction.groupBy({
      by: ['categoryId', 'name', 'amount', 'type'],
      where: { 
        userId: user.id,
        type: 'EXPENSE',
        date: { gte: oneMonthAgo },
        categoryId: { not: null } // Hide items without categories as requested implicitly ("group as category")
      },
      _count: {
        id: true
      },
      _max: {
        date: true
      },
      orderBy: [
        {
          _count: {
            id: 'desc'
          }
        },
        {
          _max: {
            date: 'desc'
          }
        }
      ],
      take: 12, // Take a few more to have variety
    });

    // Get categories to include emoji and name
    const categoryIds = frequentItems.map(item => item.categoryId).filter((id): id is string => id !== null);
    const categories = await prisma.category.findMany({
      where: {
        id: { in: categoryIds }
      }
    });

    const categoryMap = new Map(categories.map(c => [c.id, c]));

    // Format the shortcuts, showing them grouped by category primarily
    const shortcuts = frequentItems.map(item => {
      const category = item.categoryId ? categoryMap.get(item.categoryId) : null;
      return {
        name: item.name,
        amount: parseFloat(item.amount.toString()),
        categoryId: item.categoryId,
        categoryName: category?.name || 'Uncategorized',
        categoryEmoji: category?.emoji || '💰',
        type: item.type,
        count: item._count.id,
        lastUsed: item._max.date,
      };
    });

    // Get the single most recent transaction for "Repeat Last"
    const lastTransaction = await prisma.transaction.findFirst({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
      include: { category: true }
    });

    return NextResponse.json({ 
      shortcuts,
      lastTransaction: lastTransaction ? {
        ...lastTransaction,
        amount: parseFloat(lastTransaction.amount.toString())
      } : null
    });
  } catch (error) {
    console.error('Get frequent transactions error:', error);
    return NextResponse.json(
      { error: 'Failed to get frequent transactions' },
      { status: 500 }
    );
  }
}
