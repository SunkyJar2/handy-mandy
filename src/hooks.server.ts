import { redirect } from '@sveltejs/kit';
import type { Handle, HandleServerError } from '@sveltejs/kit/hooks';
import { getSessionIdFromCookies, validateSession } from '$lib/server/auth';

export const handleError: HandleServerError = ({ error, event }) => {
  console.error(`[server error] ${event.request.method} ${event.url.pathname}`, error);
  return { message: 'Something went wrong. Please try again.' };
};

export const handle: Handle = async ({ event, resolve }) => {
  const sessionId = getSessionIdFromCookies(event.cookies);

  event.locals.user = null;
  event.locals.sessionId = null;

  if (sessionId) {
    try {
      const sessionData = await validateSession(sessionId);
      if (sessionData) {
        event.locals.user = sessionData.user;
        event.locals.sessionId = sessionData.sessionId;
      }
    } catch (e) {
      // A database problem must not take down every request; treat as signed out.
      console.error('[session] validation failed, treating as signed out', e);
    }
  }

  const { pathname, search } = event.url;
  const user = event.locals.user;

  // Guest-only routes
  if ((pathname === '/login' || pathname === '/register') && user) {
    throw redirect(303, '/');
  }

  // Admin routes
  if (pathname.startsWith('/admin')) {
    if (!user) {
      throw redirect(303, `/login?next=${encodeURIComponent(pathname + search)}`);
    }
    if (user.role !== 'ADMIN') {
      throw redirect(303, '/');
    }
  }

  // Customer protected routes
  const protectedPrefixes = ['/cart', '/checkout', '/bookings', '/technicians'];
  const isProtected = protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (isProtected && !user) {
    throw redirect(303, `/login?next=${encodeURIComponent(pathname + search)}`);
  }

  return resolve(event);
};
