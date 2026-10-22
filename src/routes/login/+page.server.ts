import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { createSession, setSessionCookie } from '$lib/server/auth';
import { loginSchema } from '$lib/shared/schemas';
import { sanitizeNextUrl } from '$lib/shared/url';
import bcrypt from 'bcryptjs';

export const load: PageServerLoad = async ({ url }) => {
  return {
    next: sanitizeNextUrl(url.searchParams.get('next'))
  };
};

export const actions: Actions = {
  default: async ({ request, cookies, url }) => {
    const formData = await request.formData();
    const email = String(formData.get('email') || '').trim();
    const password = String(formData.get('password') || '');
    const nextUrl = sanitizeNextUrl(url.searchParams.get('next'));

    const parseResult = loginSchema.safeParse({ email, password });
    if (!parseResult.success) {
      return fail(400, {
        message: 'Please provide a valid email and password.',
        email
      });
    }

    const user = await db.orm.public.User.where({
      email: parseResult.data.email
    }).first();

    if (!user) {
      return fail(401, {
        message: 'Email or password is incorrect.',
        email
      });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return fail(401, {
        message: 'Email or password is incorrect.',
        email
      });
    }

    const sessionId = await createSession(user.id);
    setSessionCookie(cookies, sessionId);

    throw redirect(303, nextUrl);
  }
};
