const { z } = require("zod");

const createDeliveryPartnerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(10),
  password: z.string().min(6).optional(),
  companyName: z.string().optional().nullable(),
});

module.exports = {
  createDeliveryPartnerSchema,
};
