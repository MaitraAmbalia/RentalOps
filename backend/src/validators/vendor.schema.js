const { z } = require("zod");

const updateVendorSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  companyName: z.string().min(2).optional(),
  companyProductCategory: z.string().min(2).optional(),
  gstNo: z.string().min(4).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  companyLogo: z.string().url().optional().or(z.literal('').optional()),
});

const settingsSchema = z.object({
  lateFeeEnabled: z.boolean(),
  defaultLateFeeRatePerHour: z.coerce.number().nonnegative(),
  lateFeeGracePeriodMinutes: z.coerce.number().int().nonnegative().optional(),
  maxLateFeeCap: z.coerce.number().nonnegative().nullable().optional(),
  defaultDepositCalcType: z.enum(['FIXED', 'PERCENT_OF_RENTAL']),
  defaultDepositValue: z.coerce.number().nonnegative(),
  defaultTaxPercent: z.coerce.number().min(0).max(100),
  defaultPriceListId: z.string().uuid().nullable().optional(),
  defaultLateFeeProductId: z.string().uuid().nullable().optional(),
  warrantyEnabled: z.boolean().optional(),
  policyDraftEnabled: z.boolean().optional(),
});

module.exports = {
  updateVendorSchema,
  settingsSchema,
};

