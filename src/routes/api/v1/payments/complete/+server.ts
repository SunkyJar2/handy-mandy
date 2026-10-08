import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    return json({ error: { code: 'UNAUTHENTICATED', message: 'Please sign in.' } }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const orderId = String(body.orderId || '');

  if (!orderId) {
    return json({ error: { code: 'VALIDATION_FAILED', message: 'Order ID is required.' } }, { status: 422 });
  }

  const order = await db.orm.public.Order.where({ id: orderId }).first();

  if (!order || order.userId !== locals.user.id) {
    return json({ error: { code: 'NOT_FOUND', message: 'Order not found.' } }, { status: 404 });
  }

  // Calculate estimated finish date (preferred date or +2 business days)
  let estimatedFinishDateStr: string;
  if (order.preferredDate) {
    estimatedFinishDateStr = String(order.preferredDate).slice(0, 10);
  } else {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    estimatedFinishDateStr = d.toISOString().slice(0, 10);
  }

  // Transaction: mark order PENDING_ASSIGNMENT, mark payment PAID, clear cart
  await db.transaction(async (tx) => {
    await tx.orm.public.Order.where({ id: orderId }).update({
      status: 'PENDING_ASSIGNMENT',
      paidAt: Temporal.Instant.fromEpochMilliseconds(Date.now()),
      estimatedFinishDate: estimatedFinishDateStr
    });

    await tx.orm.public.Payment.where({ orderId }).updateAll({
      status: 'PAID'
    });

    // Clear user cart
    await tx.orm.public.CartItem.where({ userId: locals.user!.id }).deleteAll();
  });

  return json({
    success: true,
    redirectUrl: `/checkout/confirmation/${orderId}`
  });
};
