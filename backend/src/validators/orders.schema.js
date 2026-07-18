const { z } = require('zod');

const orderItemSchema = z.object({
  productId: z.string().uuid(),
  productVariantId: z.string().uuid().optional(),
  quantity: z.number().min(1).default(1),
  unitPrice: z.number().min(0),
  amount: z.number().min(0), // Pre-computed by frontend for now
  rentalStart: z.string().datetime().optional(),
  rentalEnd: z.string().datetime().optional(),
});

const orderSchema = z.object({
  clientId: z.string().uuid(),
  fulfillmentType: z.enum(['COLLECT_FROM_STORE', 'HOME_DELIVERY']),
  orderSource: z.enum(['ONLINE', 'OFFLINE']),
  rentalStartDate: z.string().datetime(),
  scheduledReturnDate: z.string().datetime(),
  untaxedAmount: z.number().min(0),
  taxPercent: z.number().min(0).default(0),
  taxAmount: z.number().min(0).default(0),
  totalAmount: z.number().min(0),
  securityDepositAmount: z.number().min(0).default(0),
  items: z.array(orderItemSchema).min(1, 'Order must contain at least one item'),
});

const orderStatusUpdateSchema = z.object({
  status: z.enum(['PROCESSING', 'RENTED', 'OVERDUE', 'RETURNED', 'CANCELLED']),
});

module.exports = { orderSchema, orderStatusUpdateSchema };
