const { z } = require("zod");

const updateClientSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().min(7).optional(),
});

module.exports = {
  updateClientSchema,
};
