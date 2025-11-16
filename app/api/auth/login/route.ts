import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateUser } from '@/app/lib/auth';
import { sendDebugToOA } from '@/app/utils/debug.util';

interface LoginRequestBody {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
  email?: string;
  phoneNumber?: string;
}

export async function POST(request: NextRequest) {
  console.log('[API Debug] ========== Login API Called ==========');
  console.log('[API Debug] Request method:', request.method);
  console.log('[API Debug] Request URL:', request.url);
  console.log('[API Debug] Request headers:', Object.fromEntries(request.headers.entries()));

  let requestBody: LoginRequestBody | null = null;

  try {
    const body = await request.json();
    requestBody = body;
    console.log('[API Debug] Request body received:', {
      userId: body.userId,
      displayName: body.displayName,
      hasPictureUrl: !!body.pictureUrl,
      hasStatusMessage: !!body.statusMessage,
      hasEmail: !!body.email,
      hasPhoneNumber: !!body.phoneNumber,
    });

    const { userId, displayName, pictureUrl, statusMessage, email, phoneNumber } = body;
    
    console.log('[API Debug] ========== Complete User Data Received ==========');
    console.log('[API Debug] User ID:', userId);
    console.log('[API Debug] Display Name:', displayName);
    console.log('[API Debug] Picture URL:', pictureUrl || 'Not provided');
    console.log('[API Debug] Status Message:', statusMessage || 'Not provided');
    console.log('[API Debug] Email:', email || 'Not provided');
    console.log('[API Debug] Phone Number:', phoneNumber || 'Not provided');
    console.log('[API Debug] ===================================================');

    if (!userId || !displayName) {
      console.error('[API Debug] ❌ Missing required fields:', {
        hasUserId: !!userId,
        hasDisplayName: !!displayName,
      });
      return NextResponse.json(
        { error: 'Missing required fields: userId and displayName' },
        { status: 400 }
      );
    }

    console.log('[API Debug] Calling getOrCreateUser...');
    const user = await getOrCreateUser({
      userId,
      displayName,
      pictureUrl,
      statusMessage,
      email,
      phoneNumber,
    });

    console.log('[API Debug] ✅ User retrieved/created:', {
      id: user.id,
      lineUserId: user.lineUserId,
      displayName: user.displayName,
      hasPictureUrl: !!user.pictureUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });

    const response = {
      user: {
        id: user.id,
        lineUserId: user.lineUserId,
        displayName: user.displayName,
        pictureUrl: user.pictureUrl,
        email: user.email || null,
        phoneNumber: user.phoneNumber || null,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    };
    
    console.log('[API Debug] Response user data:', {
      id: response.user.id,
      lineUserId: response.user.lineUserId,
      displayName: response.user.displayName,
      hasEmail: !!response.user.email,
      hasPhoneNumber: !!response.user.phoneNumber,
    });

    console.log('[API Debug] ✅ Returning success response');
    console.log('[API Debug] ========== Login API Completed ==========');

    return NextResponse.json(response);
  } catch (error) {
    console.error('[API Debug] ❌ Login error:', error);
    if (error instanceof Error) {
      console.error('[API Debug] Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }
    console.log('[API Debug] ========== Login API Failed ==========');
    
    // Try to send error to LINE OA if we have userId
    try {
      if (requestBody?.userId) {
        await sendDebugToOA(
          requestBody.userId,
          `Login API Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'error',
          {
            url: request.url,
            method: request.method,
            error: error instanceof Error ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            } : String(error),
          }
        );
      }
    } catch (debugError) {
      // Silent fail - don't break the error response
      console.error('[API Debug] Failed to send debug to OA:', debugError);
    }
    
    return NextResponse.json(
      { error: 'Failed to login', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

