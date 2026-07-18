const { z } = require('zod');

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
});

module.exports = { categorySchema };
