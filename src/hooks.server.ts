import { redirect, type Handle, type HandleServerError } from '@sveltejs/kit';
import { getSessionIdFromCookies, validateSession } from '$lib/server/auth';

export const handleError: HandleServerError = ({ error, event, status }) => {
  console.error(`[server error] ${status} ${event.request.method} ${event.url.pathname}`, error);
  return { message: 'Something went wrong. Please try again.' };
};

export const handle: Handle = async ({ event, resolve }) => {
  const sessionId = getSessionIdFromCookies(event.cookies);

  if (sessionId) {
    const sessionData = await validateSession(sessionId);
    if (sessionData) {
      event.locals.user = sessionData.user;
      event.locals.sessionId = sessionData.sessionId;
    } else {
      event.locals.user = null;
      event.locals.sessionId = null;
    }
  } else {
    event.locals.user = null;
    event.locals.sessionId = null;
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
