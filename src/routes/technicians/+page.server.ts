import { redirect, fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import type { TechnicianDto } from '$lib/shared/types';
import { canAssignTechnician } from '$lib/server/guards';

export const load: PageServerLoad = async ({ url, locals }) => {
  if (!locals.user) {
    throw redirect(303, '/login?next=/technicians');
  }

  const orderId = url.searchParams.get('orderId');
  let targetOrder = null;

  if (orderId) {
    targetOrder = await db.orm.public.Order.where({ id: orderId }).first();
    if (!targetOrder || targetOrder.userId !== locals.user.id || !canAssignTechnician(targetOrder.status)) {
      targetOrder = null;
    }
  }

  // If no orderId in query, find latest PENDING_ASSIGNMENT order for user to enable convenient 1-click assignment
  if (!targetOrder) {
    targetOrder = await db.orm.public.Order
      .where({ userId: locals.user.id, status: 'PENDING_ASSIGNMENT' })
      .orderBy((o) => o.createdAt.desc())
      .first();
  }

  if (targetOrder && !canAssignTechnician(targetOrder.status)) {
    targetOrder = null;
  }

  const technicians = await db.orm.public.Technician
    .where({ city: 'Surabaya' })
    .include('areas')
    .orderBy((t) => t.ratingAvg.desc())
    .all();

  const mappedTechnicians: TechnicianDto[] = technicians.map((t) => ({
    id: t.id,
    fullName: t.fullName,
    avatarUrl: t.avatarUrl,
    city: t.city,
    ratingAvg: Number(t.ratingAvg),
    ratingCount: t.ratingCount,
    areas: t.areas.map((a) => a.area),
    highlight: t.highlight,
    availability: t.availability as any
  }));

  return {
    technicians: mappedTechnicians,
    targetOrder: targetOrder
      ? {
          id: targetOrder.id,
          orderNumber: targetOrder.orderNumber,
          status: targetOrder.status as any
        }
      : null
  };
};

export const actions: Actions = {
  assign: async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401, { message: 'Unauthorized' });
    }

    const formData = await request.formData();
    const orderId = String(formData.get('orderId') || '');
    const technicianId = String(formData.get('technicianId') || '');

    if (!orderId || !technicianId) {
      return fail(400, { message: 'Order and Technician IDs are required.' });
    }

    const order = await db.orm.public.Order.where({ id: orderId }).first();

    if (!order || order.userId !== locals.user.id) {
      return fail(404, { message: 'Booking not found.' });
    }

    if (!canAssignTechnician(order.status as any)) {
      return fail(409, { message: 'Order cannot be assigned a technician in its current status.' });
    }

    const technician = await db.orm.public.Technician.where({ id: technicianId }).first();

    if (!technician || technician.availability !== 'AVAILABLE') {
      return fail(409, { message: 'This technician is unavailable.' });
    }

    await db.orm.public.Order.where({ id: orderId }).update({
      technicianId,
      status: 'ASSIGNED'
    });

    throw redirect(303, `/bookings/${orderId}`);
  }
};
