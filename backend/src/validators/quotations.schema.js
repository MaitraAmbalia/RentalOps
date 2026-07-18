const { z } = require('zod');

const quotationItemSchema = z.object({
  productId: z.string().uuid(),
  productVariantId: z.string().uuid().optional(),
  quantity: z.number().int().min(1).default(1),
  unit: z.string().optional(),
  rentalStart: z.string().datetime(),
  rentalEnd: z.string().datetime(),
});

const quotationSchema = z.object({
  clientId: z.string().uuid(),
  quotationTemplateId: z.string().uuid().optional(),
  priceListId: z.string().uuid().optional(),
  quotationValidityDays: z.number().int().min(1).default(7),
  paymentTermsPercent: z.number().min(0).max(100).default(100),
  items: z.array(quotationItemSchema).min(1),
});

const quotationStatusUpdateSchema = z.object({
  status: z.enum(['DRAFT', 'SENT', 'CONFIRMED', 'CANCELLED']),
});

module.exports = { quotationSchema, quotationStatusUpdateSchema };
