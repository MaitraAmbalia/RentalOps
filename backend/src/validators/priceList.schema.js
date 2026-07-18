const { z } = require("zod");

const priceListSchema = z.object({
  name: z.string().min(2),
  isSelectable: z.boolean().default(true),
  validFrom: z.coerce.date().optional(),
  validTo: z.coerce.date().optional(),
});

module.exports = { priceListSchema };
