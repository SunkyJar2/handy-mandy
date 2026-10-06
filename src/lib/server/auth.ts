import type { Cookies } from '@sveltejs/kit';
import { db } from './db';
import type { UserDto } from '$lib/shared/types';

const SESSION_COOKIE_NAME = 'hm_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days in seconds

export async function createSession(userId: string): Promise<string> {
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);
  const session = await db.session.create({
    data: {
      userId,
      expiresAt
    }
  });
  return session.id;
}

export async function validateSession(sessionId: string): Promise<{ user: UserDto; sessionId: string } | null> {
  if (!sessionId) return null;

  const session = await db.session.findUnique({
    where: { id: sessionId },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true
        }
      }
    }
  });

  if (!session) return null;

  if (session.expiresAt.getTime() < Date.now()) {
    await db.session.delete({ where: { id: sessionId } }).catch(() => {});
    return null;
  }

  return {
    user: session.user,
    sessionId: session.id
  };
}

export async function invalidateSession(sessionId: string): Promise<void> {
  if (!sessionId) return;
  await db.session.delete({ where: { id: sessionId } }).catch(() => {});
}

export function setSessionCookie(cookies: Cookies, sessionId: string): void {
  cookies.set(SESSION_COOKIE_NAME, sessionId, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_MAX_AGE
  });
}

export function deleteSessionCookie(cookies: Cookies): void {
  cookies.delete(SESSION_COOKIE_NAME, {
    path: '/'
  });
}

export function getSessionIdFromCookies(cookies: Cookies): string | undefined {
  return cookies.get(SESSION_COOKIE_NAME);
}
