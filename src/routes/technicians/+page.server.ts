import { redirect, fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { toIsoDateTime } from '$lib/server/date';
import type { TechnicianDto, AddressDto } from '$lib/shared/types';
import { canAssignTechnician } from '$lib/server/guards';
import { quickAddressSchema } from '$lib/shared/schemas';
import { parseQuickSurabayaAddress } from '$lib/shared/address';

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

  const [technicians, addresses, assignedOrders] = await Promise.all([
    db.orm.public.Technician
      .where({ city: 'Surabaya' })
      .include('areas')
      .orderBy((t) => t.ratingAvg.desc())
      .all(),
    db.orm.public.Address
      .where({ userId: locals.user.id })
      .orderBy((a) => a.createdAt.desc())
      .all(),
    db.orm.public.Order
      .where({ userId: locals.user.id })
      .where((o) => o.status.in(['ASSIGNED', 'SCHEDULED', 'IN_PROGRESS']))
      .all()
  ]);

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

  const mappedAddresses: AddressDto[] = addresses.map((a) => ({
    id: a.id,
    userId: a.userId,
    label: a.label ?? null,
    province: a.province,
    city: a.city,
    district: a.district,
    addressLine: a.addressLine,
    postalCode: a.postalCode,
    notes: a.notes,
    isDefault: a.isDefault
  }));

  const assignedTechnicianIds = assignedOrders
    .map((o) => o.technicianId)
    .filter((id): id is string => Boolean(id));

  return {
    technicians: mappedTechnicians,
    addresses: mappedAddresses,
    assignedTechnicianIds,
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
  },

  saveQuickAddress: async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401, { message: 'Unauthorized' });
    }

    const formData = await request.formData();
    const label = String(formData.get('label') || '');
    const rawAddress = String(formData.get('rawAddress') || '');

    const parseResult = quickAddressSchema.safeParse({ label, rawAddress });
    if (!parseResult.success) {
      return fail(422, { message: parseResult.error.issues[0]?.message || 'Invalid address.' });
    }

    const parsed = parseQuickSurabayaAddress({
      label: parseResult.data.label,
      rawAddress: parseResult.data.rawAddress
    });

    const existing = await db.orm.public.Address.where({ userId: locals.user.id }).all();

    await db.orm.public.Address.create({
      userId: locals.user.id,
      label: parsed.label,
      province: parsed.province,
      city: parsed.city,
      district: parsed.district,
      addressLine: parsed.addressLine,
      postalCode: parsed.postalCode,
      notes: null,
      isDefault: existing.length === 0
    });

    return { success: true, savedDistrict: parsed.district };
  },

  deleteAddress: async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401, { message: 'Unauthorized' });
    }

    const formData = await request.formData();
    const addressId = String(formData.get('addressId') || '');

    if (!addressId) {
      return fail(400, { message: 'Address ID required.' });
    }

    const address = await db.orm.public.Address.where({ id: addressId }).first();
    if (address && address.userId === locals.user.id) {
      const wasDefault = address.isDefault;
      await db.orm.public.Address.where({ id: addressId }).delete();
      if (wasDefault) {
        const remaining = await db.orm.public.Address
          .where({ userId: locals.user.id })
          .orderBy((a) => a.createdAt.desc())
          .first();
        if (remaining) {
          await db.orm.public.Address.where({ id: remaining.id }).update({ isDefault: true });
        }
      }
    }

    return { success: true };
  }
};
