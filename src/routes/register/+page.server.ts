import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { db } from '$lib/server/db';
import { createSession, setSessionCookie } from '$lib/server/auth';
import { registerSchema } from '$lib/shared/schemas';
import bcrypt from 'bcryptjs';

export const actions: Actions = {
  default: async ({ request, cookies, url }) => {
    const formData = await request.formData();
    const fullName = String(formData.get('fullName') || '').trim();
    const email = String(formData.get('email') || '').trim().toLowerCase();
    const phone = String(formData.get('phone') || '').trim() || undefined;
    const password = String(formData.get('password') || '');
    const nextUrl = url.searchParams.get('next') || '/';

    const parseResult = registerSchema.safeParse({
      fullName,
      email,
      phone,
      password
    });

    if (!parseResult.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parseResult.error.issues) {
        const fieldName = String(issue.path[0]);
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      }
      return fail(422, {
        fieldErrors,
        fullName,
        email,
        phone
      });
    }

    // Check unique email
    const existing = await db.user.findUnique({
      where: { email: parseResult.data.email }
    });

    if (existing) {
      return fail(409, {
        fieldErrors: {
          email: 'This email is already registered.'
        },
        fullName,
        email,
        phone
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: {
        fullName: parseResult.data.fullName,
        email: parseResult.data.email,
        phone: parseResult.data.phone || null,
        passwordHash,
        role: 'CUSTOMER'
      }
    });

    const sessionId = await createSession(user.id);
    setSessionCookie(cookies, sessionId);

    const safeNext = nextUrl.startsWith('/') && !nextUrl.startsWith('//') ? nextUrl : '/';
    throw redirect(303, safeNext);
  }
};
