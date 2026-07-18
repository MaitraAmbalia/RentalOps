const { z } = require("zod");

const createWorkflowSchema = z.object({
  orderId: z.string().uuid("Invalid order ID"),
  deliveryId: z.string().uuid("Invalid delivery partner ID"),
  workflowType: z.enum(["PICKUP", "RETURN"]),
  scheduledDate: z.string().datetime("Invalid scheduled date format"),
});

const completeWorkflowSchema = z.object({
  checklist: z.string().optional().transform((val) => {
    if (!val) return undefined;
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  }),
  conditionInspectionNotes: z.string().optional(),
  missingAccessories: z.string().optional().transform((val) => {
    if (!val) return [];
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    return val.split(",").map(item => item.trim()).filter(Boolean);
  }),
  damageReported: z.string().optional().transform((val) => val === "true"),
  damageDescription: z.string().optional(),
});

module.exports = {
  createWorkflowSchema,
  completeWorkflowSchema,
};
