import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getLineUserIdFromHeaders, getUserByLineUserId } from '@/app/lib/auth';
import { ReminderStatus } from '@/app/lib/types';

type UpdateReminderBody = Partial<{
  title: string;
  note: string | null;
  remindAt: string;
  status: ReminderStatus;
}>;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const reminder = await prisma.reminder.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!reminder) {
      return NextResponse.json(
        { error: 'Reminder not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ reminder });
  } catch (error) {
    console.error('Get reminder error:', error);
    return NextResponse.json(
      { error: 'Failed to get reminder' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = (await request.json()) as UpdateReminderBody;
    const { title, note, remindAt, status } = body;

    // Check if reminder exists and belongs to user
    const existingReminder = await prisma.reminder.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingReminder) {
      return NextResponse.json(
        { error: 'Reminder not found' },
        { status: 404 }
      );
    }

    // Validate title if provided
    if (title !== undefined && (typeof title !== 'string' || title.trim().length === 0)) {
      return NextResponse.json(
        { error: 'Title cannot be empty' },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (status !== undefined && !['ACTIVE', 'DONE'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be ACTIVE or DONE' },
        { status: 400 }
      );
    }

    // Validate remindAt if provided
    let remindAtDate: Date | undefined;
    if (remindAt !== undefined) {
      remindAtDate = new Date(remindAt);
      if (isNaN(remindAtDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid remind time format' },
          { status: 400 }
        );
      }
    }

    // Build update data
    const updateData: {
      title?: string;
      note?: string | null;
      remindAt?: Date;
      status?: ReminderStatus;
    } = {};

    if (title !== undefined) updateData.title = title.trim();
    if (note !== undefined) updateData.note = note?.trim() || null;
    if (remindAtDate !== undefined) updateData.remindAt = remindAtDate;
    if (status !== undefined) updateData.status = status;

    const reminder = await prisma.reminder.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ reminder });
  } catch (error) {
    console.error('Update reminder error:', error);
    return NextResponse.json(
      { error: 'Failed to update reminder' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Check if reminder exists and belongs to user
    const existingReminder = await prisma.reminder.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingReminder) {
      return NextResponse.json(
        { error: 'Reminder not found' },
        { status: 404 }
      );
    }

    await prisma.reminder.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete reminder error:', error);
    return NextResponse.json(
      { error: 'Failed to delete reminder' },
      { status: 500 }
    );
  }
}

