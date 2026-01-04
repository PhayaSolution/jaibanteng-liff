import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getLineUserIdFromHeaders, getUserByLineUserId } from '@/app/lib/auth';
import { ReminderStatus } from '@/app/lib/types';

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
    const status = searchParams.get('status') as ReminderStatus | null;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    const where: {
      userId: string;
      status?: ReminderStatus;
      remindAt?: { gte?: Date; lte?: Date };
    } = {
      userId: user.id,
    };

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.remindAt = {};
      if (startDate) {
        where.remindAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.remindAt.lte = new Date(endDate);
      }
    }

    const reminders = await prisma.reminder.findMany({
      where,
      orderBy: { remindAt: 'asc' },
      ...(limit && { take: parseInt(limit) }),
      ...(offset && { skip: parseInt(offset) }),
    });

    return NextResponse.json({ reminders });
  } catch (error) {
    console.error('Get reminders error:', error);
    return NextResponse.json(
      { error: 'Failed to get reminders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { title, note, remindAt } = body;

    // Validation
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    if (!remindAt) {
      return NextResponse.json(
        { error: 'Remind time is required' },
        { status: 400 }
      );
    }

    const remindAtDate = new Date(remindAt);
    if (isNaN(remindAtDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid remind time format' },
        { status: 400 }
      );
    }

    const reminder = await prisma.reminder.create({
      data: {
        userId: user.id,
        title: title.trim(),
        note: note?.trim() || null,
        remindAt: remindAtDate,
        status: 'ACTIVE',
      },
    });

    return NextResponse.json({ reminder }, { status: 201 });
  } catch (error) {
    console.error('Create reminder error:', error);
    return NextResponse.json(
      { error: 'Failed to create reminder' },
      { status: 500 }
    );
  }
}

