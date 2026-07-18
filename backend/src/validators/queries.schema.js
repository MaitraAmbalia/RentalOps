const { z } = require('zod');

const createQuerySchema = z.object({
  orderId: z.string().uuid(),
  queryType: z.enum(['DAMAGED_GOOD', 'PRODUCT_MISSING', 'OTHER']),
  description: z.string().min(10, "Description must be at least 10 characters long").optional(),
});

const updateQueryStatusSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED']),
});

module.exports = { createQuerySchema, updateQueryStatusSchema };

