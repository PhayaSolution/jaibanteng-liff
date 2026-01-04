import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { sendLinePushMessage, formatReminderNotification } from '@/app/lib/line';

/**
 * Reminder Cron Job
 * 
 * This endpoint should be called every 15 minutes by an external scheduler (or Vercel Cron).
 * It will:
 * 1. Find all ACTIVE reminders due within the next 120 minutes (max lead time)
 * 2. For each reminder, compute notifyAt = remindAt - user.reminderLeadMinutes
 * 3. Filter reminders where notifyAt is within the last 30 minutes (lookback window)
 * 4. Filter out reminders that have already been sent for their current remindAt time
 * 5. Group reminders by user
 * 6. Send aggregated LINE messages to users with reminderEnabled = true
 * 7. Log delivery status to prevent duplicate sends
 * 
 * Authentication:
 * - Vercel Cron: Uses CRON_SECRET in vercel.json and verifies via headers
 * - External: Use x-cron-secret header or Authorization: Bearer token
 */
export async function GET(request: NextRequest) {
  // Authenticate the request
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');
  const cronSecretHeader = request.headers.get('x-cron-secret');

  // Vercel Cron sends the CRON_SECRET as Authorization: Bearer <token>
  const providedSecret = cronSecretHeader || authHeader?.replace('Bearer ', '');

  // Allow unauthenticated access if CRON_SECRET is not set (for development)
  // In production, CRON_SECRET should always be set
  if (cronSecret && providedSecret !== cronSecret) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  if (!cronSecret) {
    console.warn('[Reminder Cron] CRON_SECRET not set - running without authentication (dev mode)');
  }

  try {
    const now = new Date();
    const maxLeadMinutes = 120; // Maximum lead time (2 hours)
    const lookbackMinutes = 30; // Lookback window for sending (30 minutes)
    const maxRemindAt = new Date(now.getTime() + maxLeadMinutes * 60 * 1000);
    const lookbackStart = new Date(now.getTime() - lookbackMinutes * 60 * 1000);

    console.log(`[Reminder Cron] Running at ${now.toISOString()}`);
    console.log(`[Reminder Cron] Looking for reminders with remindAt up to ${maxRemindAt.toISOString()}`);

    // Find all ACTIVE reminders due within the next maxLeadMinutes (120 minutes)
    // Join with user to check reminderEnabled and get reminderLeadMinutes
    const reminders = await prisma.reminder.findMany({
      where: {
        status: 'ACTIVE',
        remindAt: {
          gt: now,
          lte: maxRemindAt,
        },
        user: {
          reminderEnabled: true,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            lineUserId: true,
            reminderEnabled: true,
            reminderLeadMinutes: true,
          },
        },
        deliveries: {
          where: {
            status: 'SENT',
          },
          select: {
            sentFor: true,
          },
        },
      },
    });

    // For each reminder, compute notifyAt = remindAt - user.reminderLeadMinutes
    // Filter reminders where notifyAt is within the lookback window
    // Also filter out reminders that have already been sent for this exact remindAt time
    const remindersToSend = reminders.filter((reminder) => {
      // Compute when this reminder should be sent (notifyAt)
      const notifyAt = new Date(
        reminder.remindAt.getTime() - reminder.user.reminderLeadMinutes * 60 * 1000
      );

      // Only send if notifyAt is within the lookback window (last 30 minutes)
      // This ensures we catch reminders that should be sent now, even if cron is slightly delayed
      if (notifyAt < lookbackStart || notifyAt > now) {
        return false;
      }

      // Check if already sent for this exact remindAt time
      const alreadySent = reminder.deliveries.some(
        (d) => d.sentFor.getTime() === reminder.remindAt.getTime()
      );

      return !alreadySent;
    });

    console.log(`[Reminder Cron] Found ${reminders.length} potential reminders, ${remindersToSend.length} to send`);

    if (remindersToSend.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No reminders to send',
        stats: {
          checked: reminders.length,
          sent: 0,
          failed: 0,
        },
      });
    }

    // Group reminders by user
    const remindersByUser = new Map<
      string,
      {
        userId: string;
        lineUserId: string;
        reminders: typeof remindersToSend;
      }
    >();

    for (const reminder of remindersToSend) {
      const userId = reminder.userId;
      const existing = remindersByUser.get(userId);

      if (existing) {
        existing.reminders.push(reminder);
      } else {
        remindersByUser.set(userId, {
          userId,
          lineUserId: reminder.user.lineUserId,
          reminders: [reminder],
        });
      }
    }

    console.log(`[Reminder Cron] Sending to ${remindersByUser.size} users`);

    // Send messages and log deliveries
    let sentCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (const [userId, userData] of remindersByUser) {
      // Format the notification message
      const message = formatReminderNotification(
        userData.reminders.map((r) => ({
          title: r.title,
          note: r.note,
          remindAt: r.remindAt,
        }))
      );

      // Send LINE message
      const result = await sendLinePushMessage(userData.lineUserId, message);

      // Log deliveries for each reminder
      const deliveryStatus = result.success ? 'SENT' : 'FAILED';
      const deliveryError = result.error || null;

      for (const reminder of userData.reminders) {
        try {
          await prisma.reminderDelivery.create({
            data: {
              reminderId: reminder.id,
              userId: reminder.userId,
              sentFor: reminder.remindAt,
              status: deliveryStatus,
              error: deliveryError,
            },
          });
        } catch (deliveryError) {
          // If there's a unique constraint violation, it means it was already sent
          console.error(`[Reminder Cron] Failed to log delivery for reminder ${reminder.id}:`, deliveryError);
        }
      }

      if (result.success) {
        sentCount += userData.reminders.length;
        console.log(`[Reminder Cron] Successfully sent ${userData.reminders.length} reminders to user ${userId}`);
      } else {
        failedCount += userData.reminders.length;
        errors.push(`User ${userId}: ${result.error}`);
        console.error(`[Reminder Cron] Failed to send to user ${userId}:`, result.error);
      }
    }

    console.log(`[Reminder Cron] Completed. Sent: ${sentCount}, Failed: ${failedCount}`);

    return NextResponse.json({
      success: true,
      stats: {
        checked: reminders.length,
        sent: sentCount,
        failed: failedCount,
        users: remindersByUser.size,
      },
      ...(errors.length > 0 && { errors }),
    });
  } catch (error) {
    console.error('[Reminder Cron] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process reminders',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Also support POST for external schedulers that use POST
export async function POST(request: NextRequest) {
  return GET(request);
}

