const { z } = require("zod");

const couponSchema = z.object({
  code: z.string().min(3),
  discountPercent: z.coerce.number().min(0).max(100).optional(),
  fixedAmount: z.coerce.number().nonnegative().optional(),
  forNewCustomersOnly: z.boolean().default(false),
  usageLimit: z.coerce.number().int().positive().optional(),
  validFrom: z.coerce.date().optional(),
  validTo: z.coerce.date().optional(),
});

const validateCouponSchema = z.object({
  code: z.string().min(3),
  vendorId: z.string().uuid(),
  isNewCustomer: z.boolean().default(false),
});

module.exports = { couponSchema, validateCouponSchema };
