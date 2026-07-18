const { z } = require("zod");

const createWorkflowSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  deliveryId: z.string().optional().nullable().or(z.literal("")),
  workflowType: z.enum(["PICKUP", "RETURN"]).optional().default("PICKUP"),
  scheduledDate: z.string().optional(),
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
