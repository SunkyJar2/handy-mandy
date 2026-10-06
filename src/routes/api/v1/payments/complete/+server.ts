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

  const order = await db.order.findUnique({
    where: { id: orderId }
  });

  if (!order || order.userId !== locals.user.id) {
    return json({ error: { code: 'NOT_FOUND', message: 'Order not found.' } }, { status: 404 });
  }

  // Calculate estimated finish date (preferred date or +2 business days)
  let estimatedFinishDate: Date;
  if (order.preferredDate) {
    estimatedFinishDate = new Date(order.preferredDate);
  } else {
    estimatedFinishDate = new Date();
    estimatedFinishDate.setDate(estimatedFinishDate.getDate() + 2);
  }

  // Transaction: mark order PENDING_ASSIGNMENT, mark payment PAID, clear cart
  await db.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: {
        status: 'PENDING_ASSIGNMENT',
        paidAt: new Date(),
        estimatedFinishDate
      }
    });

    await tx.payment.updateMany({
      where: { orderId },
      data: {
        status: 'PAID'
      }
    });

    // Clear user cart
    await tx.cartItem.deleteMany({
      where: { userId: locals.user!.id }
    });
  });

  return json({
    success: true,
    redirectUrl: `/checkout/confirmation/${orderId}`
  });
};
