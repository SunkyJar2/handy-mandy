import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { addressSchema } from '$lib/shared/schemas';

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) {
    return json({ error: { code: 'UNAUTHENTICATED', message: 'Please sign in.' } }, { status: 401 });
  }

  const addresses = await db.address.findMany({
    where: { userId: locals.user.id },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }]
  });

  return json({ addresses });
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

  const address = await db.address.create({
    data: {
      userId: locals.user.id,
      province: parseResult.data.province,
      city: parseResult.data.city,
      district: parseResult.data.district,
      addressLine: parseResult.data.addressLine,
      postalCode: parseResult.data.postalCode,
      notes: parseResult.data.notes || null,
      isDefault: parseResult.data.isDefault ?? false
    }
  });

  return json({ success: true, address }, { status: 201 });
};
