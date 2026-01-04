/**
 * LINE Messaging API helper
 * Server-side only - uses channel access token from environment
 */

interface SendMessageResult {
  success: boolean;
  error?: string;
}

/**
 * Send a push message to a LINE user
 */
export async function sendLinePushMessage(
  lineUserId: string,
  message: string
): Promise<SendMessageResult> {
  const channelAccessToken = process.env.NEXT_PUBLIC_LINE_CHANNEL_ACCESS_TOKEN;

  if (!channelAccessToken) {
    console.error('[LINE API] Channel Access Token not configured');
    return {
      success: false,
      error: 'Channel Access Token not configured',
    };
  }

  try {
    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${channelAccessToken}`,
      },
      body: JSON.stringify({
        to: lineUserId,
        messages: [
          {
            type: 'text',
            text: message,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('[LINE API] Failed to send message:', errorData);
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorData}`,
      };
    }

    return { success: true };
  } catch (error) {
    console.error('[LINE API] Error sending message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Format reminders into a notification message
 */
export function formatReminderNotification(
  reminders: Array<{
    title: string;
    note?: string | null;
    remindAt: Date;
  }>
): string {
  const formatTime = (date: Date) => {
    return date.toLocaleString('th-TH', {
      timeZone: 'Asia/Bangkok',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('th-TH', {
      timeZone: 'Asia/Bangkok',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  let message = '🔔 แจ้งเตือนจากละมุน\n\n';

  if (reminders.length === 1) {
    const r = reminders[0];
    message += `📌 ${r.title}\n`;
    if (r.note) {
      message += `📝 ${r.note}\n`;
    }
    message += `⏰ ${formatDate(r.remindAt)} ${formatTime(r.remindAt)}\n`;
  } else {
    message += `มี ${reminders.length} รายการที่ต้องทำ:\n\n`;
    reminders.forEach((r, idx) => {
      message += `${idx + 1}. ${r.title}`;
      if (r.note) {
        message += ` - ${r.note}`;
      }
      message += `\n   ⏰ ${formatTime(r.remindAt)}\n`;
    });
  }

  message += '\n💡 เปิดแอปเพื่อดูรายละเอียดเพิ่มเติม';

  return message;
}

