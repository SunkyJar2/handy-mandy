import { redirect, fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import type { TechnicianDto } from '$lib/shared/types';

export const load: PageServerLoad = async ({ url, locals }) => {
  if (!locals.user) {
    throw redirect(303, '/login?next=/technicians');
  }

  const orderId = url.searchParams.get('orderId');
  let targetOrder = null;

  if (orderId) {
    targetOrder = await db.order.findUnique({
      where: { id: orderId }
    });
    if (!targetOrder || targetOrder.userId !== locals.user.id) {
      targetOrder = null;
    }
  }

  // If no orderId in query, find latest PENDING_ASSIGNMENT order for user to enable convenient 1-click assignment
  if (!targetOrder) {
    targetOrder = await db.order.findFirst({
      where: {
        userId: locals.user.id,
        status: 'PENDING_ASSIGNMENT'
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  const technicians = await db.technician.findMany({
    where: { city: 'Surabaya' },
    include: { areas: true },
    orderBy: [{ availability: 'asc' }, { ratingAvg: 'desc' }]
  });

  const mappedTechnicians: TechnicianDto[] = technicians.map((t) => ({
    id: t.id,
    fullName: t.fullName,
    avatarUrl: t.avatarUrl,
    city: t.city,
    ratingAvg: Number(t.ratingAvg),
    ratingCount: t.ratingCount,
    areas: t.areas.map((a) => a.area),
    highlight: t.highlight,
    availability: t.availability
  }));

  return {
    technicians: mappedTechnicians,
    targetOrder: targetOrder
      ? {
          id: targetOrder.id,
          orderNumber: targetOrder.orderNumber,
          status: targetOrder.status
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

    const order = await db.order.findUnique({
      where: { id: orderId }
    });

    if (!order || order.userId !== locals.user.id) {
      return fail(404, { message: 'Booking not found.' });
    }

    const technician = await db.technician.findUnique({
      where: { id: technicianId }
    });

    if (!technician || technician.availability !== 'AVAILABLE') {
      return fail(409, { message: 'This technician is unavailable.' });
    }

    await db.order.update({
      where: { id: orderId },
      data: {
        technicianId,
        status: 'ASSIGNED'
      }
    });

    throw redirect(303, `/bookings/${orderId}`);
  }
};
