import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { toIsoDateTime } from '$lib/server/date';
import type { OrderDetailDto } from '$lib/shared/types';

export const load: PageServerLoad = async ({ params, locals }) => {
  if (!locals.user) {
    throw redirect(303, `/login?next=/bookings/${params.id}`);
  }

  const order = await db.orm.public.Order
    .where({ id: params.id })
    .include('technician', (t) => t.include('areas'))
    .include('items')
    .first();

  if (!order || order.userId !== locals.user.id) {
    throw error(404, 'Booking not found');
  }

  const addr = (order.addressSnapshot as any) || {};

  const orderDetail: OrderDetailDto = {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status as any,
    createdAt: toIsoDateTime(order.createdAt),
    itemNames: order.items.filter((i) => i.lineType === 'DEVICE').map((i) => i.nameSnapshot),
    totalIdr: order.totalIdr,
    technician: order.technician
      ? {
          id: order.technician.id,
          fullName: order.technician.fullName,
          avatarUrl: order.technician.avatarUrl,
          ratingAvg: Number(order.technician.ratingAvg),
          city: order.technician.city
        }
      : null,
    address: {
      province: addr.province || '',
      city: addr.city || '',
      district: addr.district || '',
      addressLine: addr.addressLine || '',
      postalCode: addr.postalCode || '',
      notes: addr.notes || null
    },
    includeInstallation: order.includeInstallation,
    preferredDate: order.preferredDate ? String(order.preferredDate).slice(0, 10) : null,
    specialInstructions: order.specialInstructions,
    estimatedFinishDate: order.estimatedFinishDate ? String(order.estimatedFinishDate).slice(0, 10) : null,
    lines: order.items.map((item) => ({
      lineType: item.lineType as any,
      name: item.nameSnapshot,
      imageUrl: item.imageSnapshot,
      unitPriceIdr: item.unitPriceIdr,
      quantity: item.quantity,
      lineTotalIdr: item.lineTotalIdr
    })),
    devicesSubtotalIdr: order.devicesSubtotalIdr,
    installationFeeIdr: order.installationFeeIdr,
    addOnsIdr: order.addOnsIdr
  };

  return {
    order: orderDetail
  };
};
