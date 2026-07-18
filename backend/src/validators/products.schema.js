const { z } = require('zod');

const productAttributeValueSchema = z.object({
  attributeValueId: z.string().uuid(),
});

const productVariantSchema = z.object({
  sku: z.string().min(1),
  quantityOnHand: z.number().int().min(0).default(0),
  quantityAvailable: z.number().int().min(0).default(0),
  attributeValues: z.array(productAttributeValueSchema),
});

const productAttributeSchema = z.object({
  attributeId: z.string().uuid(),
});

const productSchema = z.object({
  categoryId: z.string().uuid().optional(),
  name: z.string().min(1, 'Product name is required'),
  productDefinition: z.string().optional(),
  type: z.enum(['GOODS', 'SERVICE']).default('GOODS'),
  images: z.array(z.string().url()).optional(),
  isPublished: z.boolean().default(false),
  rentalPrice: z.number().min(0),
  costPrice: z.number().min(0).default(0),
  quantityOnHand: z.number().int().min(0).default(0),
  
  periodicity: z.enum(['HOUR', 'DAY', 'NIGHT', 'WEEK']).default('DAY'),
  pickupTime: z.string().optional(),
  returnTime: z.string().optional(),
  paddingTimeMinutes: z.number().int().min(0).optional(),
  lateFeeRatePerHour: z.number().min(0).optional(),
  securityDepositCalcType: z.enum(['FIXED', 'PERCENT_OF_RENTAL']).optional(),
  securityDepositValue: z.number().min(0).optional(),

  brand: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  duration: z.string().optional().nullable(),

  attributes: z.array(productAttributeSchema).optional(),
  variants: z.array(productVariantSchema).optional(),
});

module.exports = { productSchema, productVariantSchema };
