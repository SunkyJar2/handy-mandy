import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export const DELETE: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) {
    return json({ error: { code: 'UNAUTHENTICATED', message: 'Please sign in.' } }, { status: 401 });
  }

  const addressId = params.id;
  if (!addressId) {
    return json({ error: { code: 'VALIDATION_FAILED', message: 'Address ID is required.' } }, { status: 422 });
  }

  const address = await db.orm.public.Address.where({ id: addressId }).first();
  if (!address || address.userId !== locals.user.id) {
    return json({ error: { code: 'NOT_FOUND', message: 'Address not found.' } }, { status: 404 });
  }

  const wasDefault = address.isDefault;
  await db.orm.public.Address.where({ id: addressId }).delete();

  if (wasDefault) {
    const remaining = await db.orm.public.Address
      .where({ userId: locals.user.id })
      .orderBy((a) => a.createdAt.desc())
      .first();

    if (remaining) {
      await db.orm.public.Address.where({ id: remaining.id }).update({ isDefault: true });
    }
  }

  return json({ success: true, message: 'Address deleted successfully.' });
};

