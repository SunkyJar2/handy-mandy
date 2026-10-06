import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import type { OrderSummaryDto } from '$lib/shared/types';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    throw redirect(303, '/login?next=/bookings');
  }

  const orders = await db.order.findMany({
    where: {
      userId: locals.user.id,
      status: { not: 'PENDING_PAYMENT' } // Spec: exclude abandoned cart orders
    },
    include: {
      technician: true,
      items: {
        where: { lineType: 'DEVICE' }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const mappedOrders: OrderSummaryDto[] = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    createdAt: o.createdAt.toISOString(),
    itemNames: o.items.map((i) => i.nameSnapshot),
    totalIdr: o.totalIdr,
    technician: o.technician
      ? {
          id: o.technician.id,
          fullName: o.technician.fullName,
          avatarUrl: o.technician.avatarUrl,
          ratingAvg: Number(o.technician.ratingAvg),
          city: o.technician.city
        }
      : null
  }));

  return {
    orders: mappedOrders
  };
};
