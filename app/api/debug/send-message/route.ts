import { NextRequest, NextResponse } from 'next/server';

/**
 * Send debug message to LINE OA
 * POST /api/debug/send-message
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, message, type = 'info', data } = body;

    if (!userId || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and message' },
        { status: 400 }
      );
    }

    const channelAccessToken = process.env.NEXT_PUBLIC_LINE_CHANNEL_ACCESS_TOKEN;

    if (!channelAccessToken) {
      console.error('[Debug API] Channel Access Token not configured');
      return NextResponse.json(
        { error: 'Channel Access Token not configured' },
        { status: 500 }
      );
    }

    // Format debug message
    const timestamp = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });
    let formattedMessage = `🔍 [${type.toUpperCase()}] ${timestamp}\n\n${message}`;

    if (data) {
      formattedMessage += `\n\n📊 Data:\n${JSON.stringify(data, null, 2)}`;
    }

    // Send message via LINE Messaging API
    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${channelAccessToken}`,
      },
      body: JSON.stringify({
        to: userId,
        messages: [
          {
            type: 'text',
            text: formattedMessage,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('[Debug API] Failed to send message:', errorData);
      return NextResponse.json(
        { error: 'Failed to send message to LINE OA', details: errorData },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Debug message sent successfully',
    });
  } catch (error) {
    console.error('[Debug API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to send debug message', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

