import { NextRequest, NextResponse } from 'next/server';
import { format } from 'date-fns';
import { prisma } from '@/app/lib/prisma';
import { getLineUserIdFromHeaders, getUserByLineUserId } from '@/app/lib/auth';
import { TransactionType } from '@/app/lib/types';

/**
 * Escape CSV field value
 * Handles commas, quotes, and newlines
 */
function escapeCsvField(value: string | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }

  const str = String(value);
  
  // If contains comma, quote, or newline, wrap in quotes and escape quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  
  return str;
}

/**
 * Format date to Thai locale date string (DD/MM/YYYY)
 */
function formatDate(date: Date): string {
  const formatter = new Intl.DateTimeFormat('th-TH', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(date);
}

/**
 * Format time to HH:mm
 * If time is 00:00, try to use createdAt time as fallback
 */
function formatTime(date: Date, createdAt?: Date): string {
  const formatter = new Intl.DateTimeFormat('th-TH', {
    timeZone: 'Asia/Bangkok',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const dateInBangkok = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }));
  const hours = dateInBangkok.getHours();
  const minutes = dateInBangkok.getMinutes();

  // If time is 00:00 and we have createdAt, try to use createdAt time
  if (hours === 0 && minutes === 0 && createdAt) {
    const createdAtInBangkok = new Date(createdAt.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }));
    const createdAtHours = createdAtInBangkok.getHours();
    const createdAtMinutes = createdAtInBangkok.getMinutes();
    
    // Only use createdAt if it's not also 00:00
    if (createdAtHours !== 0 || createdAtMinutes !== 0) {
      return `${String(createdAtHours).padStart(2, '0')}:${String(createdAtMinutes).padStart(2, '0')}`;
    }
  }

  return formatter.format(dateInBangkok);
}

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
    const type = searchParams.get('type') as TransactionType | null;

    // Validate required params
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate are required' },
        { status: 400 }
      );
    }

    const where: any = {
      userId: user.id,
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    };

    if (type && ['INCOME', 'EXPENSE'].includes(type)) {
      where.type = type;
    }

    // Fetch transactions with related data
    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    });

    // Build CSV content
    // Add UTF-8 BOM for Excel compatibility with Thai characters and emojis
    let csvContent = '\ufeff';
    
    // CSV Header
    csvContent += 'วันที่,เวลา,ประเภท,จำนวนเงิน,หมวดหมู่,รายการ,แท็ก\n';

    // CSV Rows
    for (const transaction of transactions) {
      const date = formatDate(transaction.date);
      const time = formatTime(transaction.date, transaction.createdAt);
      const type = transaction.type === 'INCOME' ? 'รายรับ' : 'รายจ่าย';
      const amount = Number(transaction.amount).toFixed(2);
      const category = transaction.category?.name || 'ไม่มีหมวดหมู่';
      const name = escapeCsvField(transaction.name);
      const tags = transaction.tags
        .map((tt) => tt.tag.name)
        .join('; ');

      csvContent += [
        date,
        time,
        type,
        amount,
        escapeCsvField(category),
        name,
        escapeCsvField(tags),
      ].join(',') + '\n';
    }

    // Generate filename with date range
    const startDateStr = format(new Date(startDate), 'yyyyMMdd');
    const endDateStr = format(new Date(endDate), 'yyyyMMdd');
    const filename = `transactions_${startDateStr}-${endDateStr}.csv`;

    // Return CSV response
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      },
    });
  } catch (error) {
    console.error('Export CSV error:', error);
    return NextResponse.json(
      { error: 'Failed to export CSV' },
      { status: 500 }
    );
  }
}

