import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getLineUserIdFromHeaders, getUserByLineUserId } from '@/app/lib/auth';
import { TransactionType, TransactionStatus } from '@prisma/client';

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
    const body = await request.json();
    const { type, amount, date, name, categoryId, tagIds, status } = body;

    // Check if transaction exists and belongs to user
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingTransaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Validate type if provided
    if (type !== undefined && !['INCOME', 'EXPENSE'].includes(type)) {
      return NextResponse.json(
        { error: 'Transaction type must be INCOME or EXPENSE' },
        { status: 400 }
      );
    }

    // Validate amount if provided
    if (amount !== undefined && (typeof amount !== 'number' || amount <= 0)) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    // Validate name if provided
    if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
      return NextResponse.json(
        { error: 'Transaction name cannot be empty' },
        { status: 400 }
      );
    }

    // Validate category belongs to user if provided
    if (categoryId !== undefined && categoryId !== null) {
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          userId: user.id,
        },
      });

      if (!category) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        );
      }
    }

    // Validate tags belong to user if provided
    if (tagIds !== undefined && Array.isArray(tagIds) && tagIds.length > 0) {
      const tags = await prisma.tag.findMany({
        where: {
          id: { in: tagIds },
          userId: user.id,
        },
      });

      if (tags.length !== tagIds.length) {
        return NextResponse.json(
          { error: 'One or more tags not found' },
          { status: 404 }
        );
      }
    }

    // Update transaction
    const updateData: any = {};
    if (type !== undefined) updateData.type = type as TransactionType;
    if (amount !== undefined) updateData.amount = amount;
    if (date !== undefined) updateData.date = new Date(date);
    if (name !== undefined) updateData.name = name.trim();
    if (categoryId !== undefined) updateData.categoryId = categoryId || null;
    if (status !== undefined) updateData.status = status as TransactionStatus;

    // Handle tags update
    if (tagIds !== undefined) {
      // Delete existing tags
      await prisma.transactionTag.deleteMany({
        where: { transactionId: id },
      });

      // Create new tags if provided
      if (tagIds.length > 0) {
        await prisma.transactionTag.createMany({
          data: tagIds.map((tagId: string) => ({
            transactionId: id,
            tagId,
          })),
        });
      }
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    // Transform the response
    const transformedTransaction = {
      ...transaction,
      tags: transaction.tags.map((tt) => tt.tag),
    };

    return NextResponse.json({ transaction: transformedTransaction });
  } catch (error) {
    console.error('Update transaction error:', error);
    return NextResponse.json(
      { error: 'Failed to update transaction' },
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

    // Check if transaction exists and belongs to user
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingTransaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    await prisma.transaction.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete transaction error:', error);
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    );
  }
}

