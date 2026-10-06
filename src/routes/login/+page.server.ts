import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { createSession, setSessionCookie } from '$lib/server/auth';
import { loginSchema } from '$lib/shared/schemas';
import bcrypt from 'bcryptjs';

export const load: PageServerLoad = async ({ url }) => {
  return {
    next: url.searchParams.get('next') || '/'
  };
};

export const actions: Actions = {
  default: async ({ request, cookies, url }) => {
    const formData = await request.formData();
    const email = String(formData.get('email') || '').trim();
    const password = String(formData.get('password') || '');
    const nextUrl = url.searchParams.get('next') || '/';

    const parseResult = loginSchema.safeParse({ email, password });
    if (!parseResult.success) {
      return fail(400, {
        message: 'Please provide a valid email and password.',
        email
      });
    }

    const user = await db.user.findUnique({
      where: { email: parseResult.data.email }
    });

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

    // Safe redirect guard
    const safeNext = nextUrl.startsWith('/') && !nextUrl.startsWith('//') ? nextUrl : '/';
    throw redirect(303, safeNext);
  }
};
