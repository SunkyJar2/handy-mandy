import { redirect, type RequestHandler } from '@sveltejs/kit';
import { deleteSessionCookie, invalidateSession } from '$lib/server/auth';

export const POST: RequestHandler = async ({ locals, cookies }) => {
  if (locals.sessionId) {
    await invalidateSession(locals.sessionId);
  }
  deleteSessionCookie(cookies);
  throw redirect(303, '/login');
};
