import { redirect, type RequestHandler } from '@sveltejs/kit';
import { deleteSessionCookie, invalidateSession } from '$lib/server/auth';

export const POST: RequestHandler = async ({ locals, cookies }) => {
  if (locals.sessionId) {
    await invalidateSession(locals.sessionId);
  }
  deleteSessionCookie(cookies);
  cookies.delete('hm_checkout_address', { path: '/' });
  cookies.delete('hm_checkout_options', { path: '/' });
  throw redirect(303, '/login');
};
