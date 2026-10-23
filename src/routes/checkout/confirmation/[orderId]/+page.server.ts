import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async ({ params, locals }) => {
  if (!locals.user) {
    throw error(401, 'Please sign in');
  }

  const order = await db.orm.public.Order
    .where({ id: params.orderId })
    .include('technician')
    .include('items')
    .first();

  if (!order || order.userId !== locals.user.id) {
    throw error(404, 'Order not found');
  }

  if (order.status === 'PENDING_PAYMENT') {
    throw redirect(303, '/checkout/review');
  }

  return {
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalIdr: order.totalIdr,
      technicianId: order.technicianId,
      lines: order.items.map((i) => ({
        id: i.id,
        lineType: i.lineType,
        nameSnapshot: i.nameSnapshot,
        unitPriceIdr: i.unitPriceIdr,
        quantity: i.quantity,
        lineTotalIdr: i.lineTotalIdr
      }))
    }
  };
};
