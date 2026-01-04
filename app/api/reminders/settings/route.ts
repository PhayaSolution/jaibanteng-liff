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
    const { reminderEnabled } = body;

    if (typeof reminderEnabled !== 'boolean') {
      return NextResponse.json(
        { error: 'reminderEnabled must be a boolean' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { reminderEnabled },
    });

    return NextResponse.json({
      settings: {
        reminderEnabled: updatedUser.reminderEnabled,
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

