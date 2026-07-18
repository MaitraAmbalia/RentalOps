const { z } = require('zod');

const quotationTemplateLineSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).default(1),
  unit: z.string().optional(),
});

const quotationTemplateSchema = z.object({
  name: z.string().min(1),
  headerHtml: z.string().optional(),
  footerHtml: z.string().optional(),
  quotationValidityDays: z.number().int().min(1).default(7),
  paymentTermsPercent: z.number().min(0).max(100).default(100),
  isDefault: z.boolean().default(false),
  lines: z.array(quotationTemplateLineSchema).optional(),
});

module.exports = { quotationTemplateSchema };
