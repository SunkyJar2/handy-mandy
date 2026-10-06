import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Enter your full name (2–80 letters).')
    .max(80, 'Full name cannot exceed 80 characters.')
    .regex(/^[\p{L}][\p{L} .'-]*$/u, 'Name can only contain letters, spaces, and hyphens.'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Enter a valid email address.')
    .max(254, 'Email is too long.'),
  phone: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || /^(\+62|62|0)8[1-9][0-9]{7,11}$/.test(val), {
      message: 'Enter a valid Indonesian mobile number (e.g. 081234567890).'
    }),
  password: z
    .string()
    .min(8, 'Use 8+ characters with a letter and a number.')
    .max(72, 'Password cannot exceed 72 characters.')
    .regex(/[A-Za-z]/, 'Password must contain at least one letter.')
    .regex(/[0-9]/, 'Password must contain at least one digit.')
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.')
});

export const addressSchema = z.object({
  province: z.string().trim().min(2, 'Province is required.').max(100),
  city: z
    .string()
    .trim()
    .min(2, 'City is required.')
    .max(100)
    .refine((val) => val.toLowerCase().includes('surabaya'), {
      message: 'Currently Handy Mandy only services Surabaya.'
    }),
  district: z.string().trim().min(2, 'District (Kecamatan) is required.').max(100),
  addressLine: z.string().trim().min(5, 'Address line must be at least 5 characters.').max(200),
  postalCode: z.string().trim().regex(/^\d{5}$/, 'Postal code must be 5 digits.'),
  notes: z.string().trim().max(200, 'Notes cannot exceed 200 characters.').optional().nullable(),
  isDefault: z.boolean().optional().default(false)
});

export const checkoutOptionsSchema = z.object({
  includeInstallation: z.boolean().default(false),
  includeHub: z.boolean().default(false),
  preferredDate: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => {
        if (!val) return true;
        const d = new Date(val);
        if (isNaN(d.getTime())) return false;
        // Not in the past
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return d >= today;
      },
      { message: 'Preferred installation date must be tomorrow or later.' }
    ),
  specialInstructions: z.string().trim().max(500, 'Special instructions cannot exceed 500 characters.').optional().nullable()
});

export const createOrderSchema = checkoutOptionsSchema.extend({
  addressId: z.string().min(1, 'Please select or add an address.')
});

export const adminProductSchema = z.object({
  name: z.string().trim().min(2, 'Product name is required.').max(80),
  description: z.string().trim().min(10, 'Description must be at least 10 characters.').max(500),
  priceIdr: z.coerce.number().int().min(1000, 'Price must be at least Rp 1.000').max(100000000),
  categoryId: z.string().min(1, 'Category is required.'),
  imageUrl: z.string().trim().min(1, 'Image URL or path is required.'),
  isFeatured: z.boolean().optional().default(false),
  kind: z.enum(['DEVICE', 'ADDON']).default('DEVICE')
});
