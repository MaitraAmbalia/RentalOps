const { z } = require("zod");

const addressSchema = z.object({
  id: z.string().uuid().optional(),
  label: z.string().min(1).optional().nullable(),
  line1: z.string().min(1),
  line2: z.string().optional().nullable(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
  isBilling: z.boolean().default(false),
  isDelivery: z.boolean().default(false),
  isDefault: z.boolean().default(false),
});

module.exports = {
  addressSchema,
};
