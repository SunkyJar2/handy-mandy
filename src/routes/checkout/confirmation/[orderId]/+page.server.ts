import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async ({ params, locals }) => {
  if (!locals.user) {
    throw error(401, 'Please sign in');
  }

  const order = await db.orm.public.Order
    .where({ id: params.orderId })
    .include('technician')
    .first();

  if (!order || order.userId !== locals.user.id) {
    throw error(404, 'Order not found');
  }

  return {
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalIdr: order.totalIdr,
      technicianId: order.technicianId
    }
  };
};
