const { prisma } = require("../config/db");
const ApiError = require("../utils/apiError");

const createWorkflow = async (data) => {
  const deliveryId = (data.deliveryId && String(data.deliveryId).trim()) ? String(data.deliveryId).trim() : null;
  let scheduledDate = new Date();
  if (data.scheduledDate && !isNaN(new Date(data.scheduledDate).getTime())) {
    scheduledDate = new Date(data.scheduledDate);
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Verify order exists
    const order = await tx.order.findUnique({
      where: { id: data.orderId },
    });
    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    // 2. Verify delivery partner if provided
    if (deliveryId) {
      const partner = await tx.deliveryPartner.findUnique({
        where: { id: deliveryId },
      });
      if (!partner) {
        throw new ApiError(404, "Delivery partner not found");
      }
    }

    // 3. Create workflow
    const workflow = await tx.pickupReturnWorkflow.create({
      data: {
        orderId: data.orderId,
        deliveryId: deliveryId,
        workflowType: data.workflowType || "PICKUP",
        scheduledDate: scheduledDate,
        workflowStatus: "SCHEDULED",
      },
      include: {
        order: {
          include: {
            client: true,
            items: { include: { product: true } },
          },
        },
        deliveryPartner: true,
      }
    });

    // 4. Update delivery partner status if assigned
    if (deliveryId) {
      await tx.deliveryPartner.update({
        where: { id: deliveryId },
        data: {
          currentStatus: "OUT_ON_DELIVERY",
          currentOrderId: data.orderId,
        },
      });
    }

    return workflow;
  });
};

const getWorkflows = async (user, filters = {}) => {
  const { type, status, deliveryId, date, page = 1, limit = 100 } = filters;
  const skip = (Number(page) - 1) * Number(limit);

  const where = {};

  // Role scoping: Delivery partners can only see their own assigned workflows
  if (user.type === "DELIVERY") {
    where.deliveryId = user.id;
  } else if (deliveryId) {
    where.deliveryId = deliveryId;
  }

  if (type) {
    where.workflowType = type;
  }

  if (status) {
    where.workflowStatus = status;
  }

  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    where.scheduledDate = { gte: startOfDay, lte: endOfDay };
  }

  const [workflows, total] = await prisma.$transaction([
    prisma.pickupReturnWorkflow.findMany({
      where,
      include: {
        order: {
          include: {
            client: true,
            items: { include: { product: true } },
          },
        },
        deliveryPartner: true,
      },
      orderBy: { scheduledDate: "asc" },
      skip,
      take: Number(limit),
    }),
    prisma.pickupReturnWorkflow.count({ where }),
  ]);

  return { workflows, total };
};

const getWorkflowById = async (id, user) => {
  const workflow = await prisma.pickupReturnWorkflow.findUnique({
    where: { id },
    include: {
      order: {
        include: {
          client: true,
          items: { include: { product: true } },
        },
      },
      deliveryPartner: true,
    },
  });

  if (!workflow) {
    throw new ApiError(404, "Workflow not found");
  }

  // Delivery Partner privacy check
  if (user.type === "DELIVERY" && workflow.deliveryId !== user.id) {
    throw new ApiError(403, "Forbidden");
  }

  return workflow;
};

const updateRouteSequence = async (id, routeSequence) => {
  return await prisma.pickupReturnWorkflow.update({
    where: { id },
    data: { routeSequence: Number(routeSequence) },
  });
};

const notifyCustomer = async (id) => {
  return await prisma.pickupReturnWorkflow.update({
    where: { id },
    data: { workflowStatus: "CUSTOMER_NOTIFIED" },
  });
};

const scanQrCode = async (id, qrCode, user) => {
  const workflow = await prisma.pickupReturnWorkflow.findUnique({
    where: { id },
    include: { order: true },
  });

  if (!workflow) {
    throw new ApiError(404, "Workflow not found");
  }

  if (user.type === "DELIVERY" && workflow.deliveryId !== user.id) {
    throw new ApiError(403, "Forbidden");
  }

  // QR Code validation (checks against orderNumber)
  if (workflow.order.orderNumber !== qrCode) {
    throw new ApiError(400, "QR Code mismatch. Verification failed.");
  }

  // Update checklist to mark verification complete
  let checklist = workflow.checklist ? { ...workflow.checklist } : {};
  checklist.qrVerified = true;

  return await prisma.pickupReturnWorkflow.update({
    where: { id },
    data: {
      qrCode,
      checklist,
    },
  });
};

const completeWorkflow = async (id, data, user) => {
  return await prisma.$transaction(async (tx) => {
    const workflow = await tx.pickupReturnWorkflow.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            items: true,
          },
        },
      },
    });

    if (!workflow) {
      throw new ApiError(404, "Workflow not found");
    }

    if (user.type === "DELIVERY" && workflow.deliveryId !== user.id) {
      throw new ApiError(403, "Forbidden");
    }

    // 1. Update workflow record with complete details
    const updatedWorkflow = await tx.pickupReturnWorkflow.update({
      where: { id },
      data: {
        workflowStatus: "COMPLETED",
        checklist: data.checklist || undefined,
        conditionInspectionNotes: data.conditionInspectionNotes || undefined,
        missingAccessories: data.missingAccessories || undefined,
        damageReported: data.damageReported || false,
        damageDescription: data.damageDescription || undefined,
        damageImages: data.damageImages || undefined,
      },
    });

    // 2. Update Delivery Partner back to AVAILABLE
    await tx.deliveryPartner.update({
      where: { id: workflow.deliveryId },
      data: {
        currentStatus: "AVAILABLE",
        currentOrderId: null,
      },
    });

    // 3. Fulfill order states
    let updatedOrder = null;
    if (workflow.workflowType === "PICKUP") {
      updatedOrder = await tx.order.update({
        where: { id: workflow.orderId },
        data: { status: "RENTED" },
      });
    } else if (workflow.workflowType === "RETURN") {
      updatedOrder = await tx.order.update({
        where: { id: workflow.orderId },
        data: { status: "RETURNED" },
      });

      // Stock replenishment & damage handling
      for (const item of workflow.order.items) {
        if (item.productVariantId) {
          await tx.productVariant.update({
            where: { id: item.productVariantId },
            data: {
              quantityAvailable: { increment: Number(item.quantity) },
            },
          });
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              quantityOnHand: { increment: Number(item.quantity) },
            },
          });
        }

        if (data.damageReported) {
          await tx.product.update({
            where: { id: item.productId },
            data: { currentStatus: "IN_MAINTENANCE" },
          });
        }
      }
    }

    return { workflow: updatedWorkflow, order: updatedOrder };
  });
};

const updateWorkflow = async (id, data, user = { type: 'VENDOR' }) => {
  if (data.status === 'COMPLETED' || data.workflowStatus === 'COMPLETED') {
    const res = await completeWorkflow(id, data, user);
    return res.workflow || res;
  }

  const updateData = {};
  if (data.deliveryId !== undefined) updateData.deliveryId = data.deliveryId;
  if (data.scheduledDate !== undefined) updateData.scheduledDate = new Date(data.scheduledDate);
  if (data.status !== undefined) updateData.workflowStatus = data.status;
  if (data.workflowStatus !== undefined) updateData.workflowStatus = data.workflowStatus;
  if (data.routeSequence !== undefined) updateData.routeSequence = Number(data.routeSequence);

  return await prisma.$transaction(async (tx) => {
    const workflow = await tx.pickupReturnWorkflow.update({
      where: { id },
      data: updateData,
      include: {
        order: {
          include: {
            client: true,
            items: { include: { product: true } },
          },
        },
        deliveryPartner: true,
      }
    });

    if (data.deliveryId) {
      await tx.deliveryPartner.update({
        where: { id: data.deliveryId },
        data: {
          currentStatus: "OUT_ON_DELIVERY",
          currentOrderId: workflow.orderId,
        },
      });
    }

    return workflow;
  });
};

module.exports = {
  createWorkflow,
  getWorkflows,
  getWorkflowById,
  updateRouteSequence,
  notifyCustomer,
  scanQrCode,
  completeWorkflow,
  updateWorkflow,
};
