const { z } = require('zod');

const attributeValueSchema = z.object({
  value: z.string().min(1, 'Value is required'),
  extraPrice: z.number().min(0).default(0),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

const attributeSchema = z.object({
  name: z.string().min(1, 'Attribute name is required'),
  displayType: z.enum(['RADIO', 'PILLS', 'CHECKBOX', 'IMAGE']).default('RADIO'),
  values: z.array(attributeValueSchema).optional(),
});

module.exports = { attributeSchema, attributeValueSchema };
