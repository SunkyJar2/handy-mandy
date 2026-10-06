import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export const POST: RequestHandler = async ({ params, request, locals }) => {
  if (!locals.user) {
    return json({ error: { code: 'UNAUTHENTICATED', message: 'Please sign in.' } }, { status: 401 });
  }

  const orderId = params.id;
  const body = await request.json().catch(() => ({}));
  const technicianId = String(body.technicianId || '');

  if (!orderId || !technicianId) {
    return json({ error: { code: 'VALIDATION_FAILED', message: 'Order ID and Technician ID are required.' } }, { status: 422 });
  }

  const order = await db.order.findUnique({
    where: { id: orderId }
  });

  if (!order || order.userId !== locals.user.id) {
    return json({ error: { code: 'NOT_FOUND', message: 'Booking not found.' } }, { status: 404 });
  }

  if (order.status !== 'PENDING_ASSIGNMENT' && order.status !== 'ASSIGNED') {
    return json(
      {
        error: {
          code: 'INVALID_STATE',
          message: 'Order is not in pending assignment status.'
        }
      },
      { status: 409 }
    );
  }

  const technician = await db.technician.findUnique({
    where: { id: technicianId }
  });

  if (!technician || technician.availability !== 'AVAILABLE') {
    return json(
      {
        error: {
          code: 'TECHNICIAN_UNAVAILABLE',
          message: 'This technician is currently not available.'
        }
      },
      { status: 409 }
    );
  }

  // Update order with assigned technician
  const updatedOrder = await db.order.update({
    where: { id: orderId },
    data: {
      technicianId,
      status: 'ASSIGNED'
    }
  });

  return json({
    success: true,
    orderId: updatedOrder.id,
    orderNumber: updatedOrder.orderNumber,
    status: updatedOrder.status,
    redirectUrl: `/bookings/${updatedOrder.id}`
  });
};
