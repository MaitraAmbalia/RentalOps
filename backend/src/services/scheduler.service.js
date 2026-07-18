const { prisma } = require("../config/db");
const ApiError = require("../utils/apiError");

const getMonthDays = (year, month) => {
  const date = new Date(year, month - 1, 1);
  const days = [];
  while (date.getMonth() === month - 1) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

const getSchedulerData = async (vendorId, month, year) => {
  const m = Number(month) || new Date().getMonth() + 1;
  const y = Number(year) || new Date().getFullYear();

  const startDate = new Date(y, m - 1, 1, 0, 0, 0, 0);
  const endDate = new Date(y, m, 0, 23, 59, 59, 999);

  // Fetch orders overlapping the month
  const orders = await prisma.order.findMany({
    where: {
      vendorId,
      status: { not: "CANCELLED" },
      OR: [
        { rentalStartDate: { lte: endDate }, scheduledReturnDate: { gte: startDate } },
        { createdAt: { gte: startDate, lte: endDate } },
      ],
    },
    include: {
      client: true,
      items: { include: { product: true } },
      workflows: true,
    },
  });

  const monthDays = getMonthDays(y, m);
  const daysResult = [];

  for (const day of monthDays) {
    const dayStr = day.toISOString().split("T")[0];
    const dayStart = new Date(day.setHours(0, 0, 0, 0));
    const dayEnd = new Date(day.setHours(23, 59, 59, 999));

    const dayStatuses = new Set();
    const dayOrders = [];

    for (const order of orders) {
      const orderStart = new Date(order.rentalStartDate);
      const orderEnd = new Date(order.scheduledReturnDate);

      // Determine statuses for this day
      // 1. PICKUP: Start date is today and there is a scheduled pickup workflow
      const hasPickupToday = order.workflows.some(
        w => w.workflowType === "PICKUP" &&
             new Date(w.scheduledDate) >= dayStart &&
             new Date(w.scheduledDate) <= dayEnd &&
             w.workflowStatus === "SCHEDULED"
      );
      if (hasPickupToday) {
        dayStatuses.add("PICKUP");
      }

      // 2. LATE_PICKUP: Start date was in the past (before today), status still PROCESSING
      const isLatePickup = orderStart < dayStart && order.status === "PROCESSING";
      if (isLatePickup && dayStart <= new Date()) {
        dayStatuses.add("LATE_PICKUP");
      }

      // 3. BOOKED: active rental (status RENTED) and day falls within rental range
      const isBooked = order.status === "RENTED" && dayStart >= orderStart && dayEnd <= orderEnd;
      if (isBooked) {
        dayStatuses.add("BOOKED");
      }

      // 4. LATE_DELIVERY: return date has passed, status OVERDUE
      const isLateDelivery = order.status === "OVERDUE" && dayStart > orderEnd;
      if (isLateDelivery) {
        dayStatuses.add("LATE_DELIVERY");
      }

      // If any status matched or the order overlaps this day, include it in summary list
      const overlaps = (orderStart <= dayEnd && orderEnd >= dayStart);
      if (overlaps || hasPickupToday || isLatePickup) {
        const itemNames = order.items.map(item => item.product?.name).filter(Boolean).join(", ");
        dayOrders.push({
          orderId: order.id,
          orderNumber: order.orderNumber,
          productName: itemNames || "No products",
          clientName: `${order.client.firstName} ${order.client.lastName}`,
          qty: order.items.reduce((acc, curr) => acc + curr.quantity, 0),
          status: order.status,
        });
      }
    }

    daysResult.push({
      date: dayStr,
      statuses: Array.from(dayStatuses),
      orders: dayOrders,
    });
  }

  return daysResult;
};

const getSchedulerDayDetails = async (vendorId, dateStr) => {
  const targetDate = new Date(dateStr);
  if (isNaN(targetDate.getTime())) {
    throw new ApiError(400, "Invalid date format. Use YYYY-MM-DD");
  }

  const dayStart = new Date(targetDate.setHours(0, 0, 0, 0));
  const dayEnd = new Date(targetDate.setHours(23, 59, 59, 999));

  // Get orders active on this day
  const orders = await prisma.order.findMany({
    where: {
      vendorId,
      status: { not: "CANCELLED" },
      rentalStartDate: { lte: dayEnd },
      scheduledReturnDate: { gte: dayStart },
    },
    include: {
      client: true,
      items: {
        include: {
          product: {
            include: {
              variants: true,
            },
          },
        },
      },
    },
  });

  return orders.flatMap(order => {
    return order.items.map(item => {
      const isAvailable = item.product?.quantityOnHand > 0 || 
        (item.product?.variants && item.product.variants.some(v => v.quantityAvailable > 0));
      
      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        productName: item.product?.name || "Unknown Product",
        clientName: `${order.client.firstName} ${order.client.lastName}`,
        qty: item.quantity,
        availability: isAvailable ? "Available" : "Out of Stock",
      };
    });
  });
};

const getSchedulerRangeData = async (vendorId, fromStr, toStr) => {
  const from = new Date(fromStr);
  const to = new Date(toStr);
  if (isNaN(from.getTime()) || isNaN(to.getTime())) {
    throw new ApiError(400, "Invalid date formats. Use YYYY-MM-DD");
  }

  const startDate = new Date(from.setHours(0, 0, 0, 0));
  const endDate = new Date(to.setHours(23, 59, 59, 999));

  const orders = await prisma.order.findMany({
    where: {
      vendorId,
      status: { not: "CANCELLED" },
      OR: [
        { rentalStartDate: { lte: endDate }, scheduledReturnDate: { gte: startDate } },
        { createdAt: { gte: startDate, lte: endDate } },
      ],
    },
    include: {
      client: true,
      items: { include: { product: true } },
      workflows: true,
    },
  });

  // Construct dates range
  const daysResult = [];
  const curr = new Date(startDate);
  while (curr <= endDate) {
    const dayStr = curr.toISOString().split("T")[0];
    const dayStart = new Date(curr.setHours(0, 0, 0, 0));
    const dayEnd = new Date(curr.setHours(23, 59, 59, 999));

    const dayStatuses = new Set();
    const dayOrders = [];

    for (const order of orders) {
      const orderStart = new Date(order.rentalStartDate);
      const orderEnd = new Date(order.scheduledReturnDate);

      const hasPickupToday = order.workflows.some(
        w => w.workflowType === "PICKUP" &&
             new Date(w.scheduledDate) >= dayStart &&
             new Date(w.scheduledDate) <= dayEnd &&
             w.workflowStatus === "SCHEDULED"
      );
      if (hasPickupToday) {
        dayStatuses.add("PICKUP");
      }

      const isLatePickup = orderStart < dayStart && order.status === "PROCESSING";
      if (isLatePickup && dayStart <= new Date()) {
        dayStatuses.add("LATE_PICKUP");
      }

      const isBooked = order.status === "RENTED" && dayStart >= orderStart && dayEnd <= orderEnd;
      if (isBooked) {
        dayStatuses.add("BOOKED");
      }

      const isLateDelivery = order.status === "OVERDUE" && dayStart > orderEnd;
      if (isLateDelivery) {
        dayStatuses.add("LATE_DELIVERY");
      }

      const overlaps = (orderStart <= dayEnd && orderEnd >= dayStart);
      if (overlaps || hasPickupToday || isLatePickup) {
        const itemNames = order.items.map(item => item.product?.name).filter(Boolean).join(", ");
        dayOrders.push({
          orderId: order.id,
          orderNumber: order.orderNumber,
          productName: itemNames || "No products",
          clientName: `${order.client.firstName} ${order.client.lastName}`,
          qty: order.items.reduce((acc, curr) => acc + curr.quantity, 0),
          status: order.status,
        });
      }
    }

    daysResult.push({
      date: dayStr,
      statuses: Array.from(dayStatuses),
      orders: dayOrders,
    });

    curr.setDate(curr.getDate() + 1);
  }

  return daysResult;
};

module.exports = {
  getSchedulerData,
  getSchedulerDayDetails,
  getSchedulerRangeData,
};
