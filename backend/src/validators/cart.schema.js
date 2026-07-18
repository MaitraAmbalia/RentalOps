const { z } = require("zod");

const cartItemSchema = z.object({
  productId: z.string().uuid(),
  productVariantId: z.string().uuid().optional().nullable(),
  quantity: z.coerce.number().int().positive().default(1),
  rentalStart: z.coerce.date(),
  rentalEnd: z.coerce.date(),
}).refine(d => d.rentalEnd > d.rentalStart, {
  message: 'rentalEnd must be after rentalStart',
  path: ['rentalEnd']
});

const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().positive().optional(),
  rentalStart: z.coerce.date().optional(),
  rentalEnd: z.coerce.date().optional(),
}).refine(d => {
  if (d.rentalStart && d.rentalEnd) {
    return d.rentalEnd > d.rentalStart;
  }
  return true;
}, {
  message: 'rentalEnd must be after rentalStart',
  path: ['rentalEnd']
});

const saveForLaterSchema = z.object({
  savedForLater: z.boolean(),
});

const applyCouponSchema = z.object({
  code: z.string().min(3),
});

const wishlistSchema = z.object({
  productId: z.string().uuid(),
});

module.exports = {
  cartItemSchema,
  updateCartItemSchema,
  saveForLaterSchema,
  applyCouponSchema,
  wishlistSchema,
};
