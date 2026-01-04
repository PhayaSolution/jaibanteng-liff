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

    return NextResponse.json({
      settings: {
        reminderEnabled: user.reminderEnabled,
        reminderLeadMinutes: user.reminderLeadMinutes,
      },
    });
  } catch (error) {
    console.error('Get reminder settings error:', error);
    return NextResponse.json(
      { error: 'Failed to get reminder settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
    const { reminderEnabled, reminderLeadMinutes } = body;

    const updateData: { reminderEnabled?: boolean; reminderLeadMinutes?: number } = {};

    if (reminderEnabled !== undefined) {
      if (typeof reminderEnabled !== 'boolean') {
        return NextResponse.json(
          { error: 'reminderEnabled must be a boolean' },
          { status: 400 }
        );
      }
      updateData.reminderEnabled = reminderEnabled;
    }

    if (reminderLeadMinutes !== undefined) {
      if (typeof reminderLeadMinutes !== 'number') {
        return NextResponse.json(
          { error: 'reminderLeadMinutes must be a number' },
          { status: 400 }
        );
      }
      // Validate that it's one of the allowed values: 15, 30, or 120
      if (![15, 30, 120].includes(reminderLeadMinutes)) {
        return NextResponse.json(
          { error: 'reminderLeadMinutes must be 15, 30, or 120' },
          { status: 400 }
        );
      }
      updateData.reminderLeadMinutes = reminderLeadMinutes;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    return NextResponse.json({
      settings: {
        reminderEnabled: updatedUser.reminderEnabled,
        reminderLeadMinutes: updatedUser.reminderLeadMinutes,
      },
    });
  } catch (error) {
    console.error('Update reminder settings error:', error);
    return NextResponse.json(
      { error: 'Failed to update reminder settings' },
      { status: 500 }
    );
  }
}

