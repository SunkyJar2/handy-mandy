import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { addressSchema } from '$lib/shared/schemas';

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) {
    return json({ error: { code: 'UNAUTHENTICATED', message: 'Please sign in.' } }, { status: 401 });
  }

  const addresses = await db.orm.public.Address
    .where({ userId: locals.user.id })
    .orderBy((a) => a.createdAt.desc())
    .all();

  const mapped = addresses.map((a) => ({
    id: a.id,
    userId: a.userId,
    province: a.province,
    city: a.city,
    district: a.district,
    addressLine: a.addressLine,
    postalCode: a.postalCode,
    notes: a.notes,
    isDefault: a.isDefault,
    createdAt: a.createdAt ? new Date(a.createdAt.epochMilliseconds).toISOString() : ''
  }));

  return json({ addresses: mapped });
};

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    return json({ error: { code: 'UNAUTHENTICATED', message: 'Please sign in.' } }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const parseResult = addressSchema.safeParse(body);

  if (!parseResult.success) {
    return json(
      {
        error: {
          code: 'VALIDATION_FAILED',
          message: parseResult.error.issues[0]?.message || 'Invalid address data.'
        }
      },
      { status: 422 }
    );
  }

  const address = await db.orm.public.Address.create({
    userId: locals.user.id,
    province: parseResult.data.province,
    city: parseResult.data.city,
    district: parseResult.data.district,
    addressLine: parseResult.data.addressLine,
    postalCode: parseResult.data.postalCode,
    notes: parseResult.data.notes || null,
    isDefault: parseResult.data.isDefault ?? false
  });

  return json({
    success: true,
    address: {
      id: address.id,
      userId: address.userId,
      province: address.province,
      city: address.city,
      district: address.district,
      addressLine: address.addressLine,
      postalCode: address.postalCode,
      notes: address.notes,
      isDefault: address.isDefault,
      createdAt: address.createdAt ? new Date(address.createdAt.epochMilliseconds).toISOString() : ''
    }
  }, { status: 201 });
};
