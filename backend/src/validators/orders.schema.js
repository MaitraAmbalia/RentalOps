const { z } = require('zod');

const orderItemSchema = z.object({
  productId: z.string().uuid(),
  productVariantId: z.string().uuid().optional(),
  quantity: z.number().min(1).default(1),
  unitPrice: z.number().min(0),
  amount: z.number().min(0), // Pre-computed by frontend for now
  rentalStart: z.string().datetime().optional(),
  rentalEnd: z.string().datetime().optional(),
}).refine((item) => {
  if (item.rentalStart && item.rentalEnd) {
    return new Date(item.rentalEnd) > new Date(item.rentalStart);
  }
  return true;
}, {
  message: 'Item rental end date must be strictly after rental start date',
  path: ['rentalEnd']
});

const orderSchema = z.object({
  clientId: z.string().uuid().optional(),
  fulfillmentType: z.enum(['COLLECT_FROM_STORE', 'HOME_DELIVERY']),
  orderSource: z.enum(['ONLINE', 'OFFLINE']),
  rentalStartDate: z.string().datetime(),
  scheduledReturnDate: z.string().datetime(),
  untaxedAmount: z.number().min(0),
  taxPercent: z.number().min(0).default(0),
  taxAmount: z.number().min(0).default(0),
  totalAmount: z.number().min(0),
  securityDepositAmount: z.number().min(0).default(0),
  couponCode: z.string().optional(),
  items: z.array(orderItemSchema).min(1, 'Order must contain at least one item'),
}).refine((data) => {
  const start = new Date(data.rentalStartDate);
  const end = new Date(data.scheduledReturnDate);
  return end > start;
}, {
  message: 'Scheduled return date must be strictly after rental start date',
  path: ['scheduledReturnDate']
}).refine((data) => {
  const start = new Date(data.rentalStartDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today.getTime() - 12 * 60 * 60 * 1000);
  return start >= yesterday;
}, {
  message: 'Rental start date cannot be in the past',
  path: ['rentalStartDate']
});

const orderStatusUpdateSchema = z.object({
  status: z.enum(['PROCESSING', 'RENTED', 'OVERDUE', 'RETURNED', 'CANCELLED']),
});

module.exports = { orderSchema, orderStatusUpdateSchema };
