import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { toIsoDateTime } from '$lib/server/date';
import type { OrderSummaryDto } from '$lib/shared/types';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    throw redirect(303, '/login?next=/bookings');
  }

  const orders = await db.orm.public.Order
    .where({ userId: locals.user.id })
    .where((o) => o.status.neq('PENDING_PAYMENT'))
    .include('technician')
    .include('items', (items) => items.where({ lineType: 'DEVICE' }))
    .orderBy((o) => o.createdAt.desc())
    .all();

  const mappedOrders: OrderSummaryDto[] = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status as any,
    createdAt: toIsoDateTime(o.createdAt),
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
