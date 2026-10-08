import type { Cookies } from '@sveltejs/kit';
import { db } from './db';
import type { UserDto } from '$lib/shared/types';

const SESSION_COOKIE_NAME = 'hm_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days in seconds

export async function createSession(userId: string): Promise<string> {
  const expiresAt = Temporal.Instant.fromEpochMilliseconds(Date.now() + SESSION_MAX_AGE * 1000);
  const session = await db.orm.public.Session.create({
    userId,
    expiresAt
  });
  return session.id;
}

export async function validateSession(sessionId: string): Promise<{ user: UserDto; sessionId: string } | null> {
  if (!sessionId) return null;

  try {
    const session = await db.orm.public.Session.where({ id: sessionId })
      .include('user')
      .first();

    if (!session || !session.user) return null;

    const expiresAtMs = typeof session.expiresAt?.epochMilliseconds === 'number'
      ? session.expiresAt.epochMilliseconds
      : session.expiresAt instanceof Date
        ? session.expiresAt.getTime()
        : new Date(String(session.expiresAt)).getTime();

    if (expiresAtMs < Date.now()) {
      await db.orm.public.Session.where({ id: sessionId }).delete().catch(() => {});
      return null;
    }

    return {
      user: {
        id: session.user.id,
        fullName: session.user.fullName,
        email: session.user.email,
        phone: session.user.phone,
        role: session.user.role
      },
      sessionId: session.id
    };
  } catch (err) {
    console.error('Session validation error:', err);
    return null;
  }
}

export async function invalidateSession(sessionId: string): Promise<void> {
  if (!sessionId) return;
  await db.orm.public.Session.where({ id: sessionId }).delete().catch(() => {});
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
