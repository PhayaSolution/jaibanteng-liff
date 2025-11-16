import { prisma } from './prisma';

export interface LineProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
  email?: string;
  phoneNumber?: string;
}

type PrismaUser = Awaited<ReturnType<typeof prisma.user.findUnique>>;

/**
 * Get or create user from LINE profile
 */
export async function getOrCreateUser(profile: LineProfile): Promise<NonNullable<PrismaUser>> {
  let user = await prisma.user.findUnique({
    where: { lineUserId: profile.userId },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        lineUserId: profile.userId,
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl,
        email: profile.email,
        phoneNumber: profile.phoneNumber,
      },
    });
  } else {
    // Update user profile if it has changed
    if (
      user.displayName !== profile.displayName ||
      user.pictureUrl !== profile.pictureUrl ||
      user.email !== profile.email ||
      user.phoneNumber !== profile.phoneNumber
    ) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          displayName: profile.displayName,
          pictureUrl: profile.pictureUrl,
          email: profile.email,
          phoneNumber: profile.phoneNumber,
        },
      });
    }
  }

  return user;
}

/**
 * Get user by LINE userId
 */
export async function getUserByLineUserId(lineUserId: string): Promise<PrismaUser> {
  return prisma.user.findUnique({
    where: { lineUserId },
  });
}

/**
 * Get user by ID
 */
export async function getUserById(id: string): Promise<PrismaUser> {
  return prisma.user.findUnique({
    where: { id },
  });
}

/**
 * Extract LINE userId from request headers
 * Expects header: x-line-user-id
 */
export function getLineUserIdFromHeaders(headers: Headers): string | null {
  return headers.get('x-line-user-id');
}

