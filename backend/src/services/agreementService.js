const { prisma } = require("../config/db");
const ApiError = require("../utils/apiError");

/**
 * Generate dynamic Rental Agreement document for an order
 */
const generateOrderAgreement = async (orderId) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      client: true,
      vendor: true,
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  const clientName = `${order.client.firstName} ${order.client.lastName}`;
  const vendorName = order.vendor.companyName || "RentHub Operations";
  const rentalStart = new Date(order.rentalStartDate).toLocaleString();
  const rentalReturn = new Date(order.scheduledReturnDate).toLocaleString();

  const itemsList = order.items.map(item => ({
    productName: item.product?.name || "Rental Equipment",
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    totalPrice: item.amount,
  }));

  const termsClauses = [
    {
      title: "1. Equipment Custody & Responsible Use",
      text: "The Lessee agrees to maintain all rented equipment in proper operational condition. Any unauthorized modifications, subleasing, or intentional misuse is strictly prohibited.",
    },
    {
      title: "2. Security Deposit & Damage Deductions",
      text: `A refundable security deposit of ₹${Number(order.securityDepositAmount).toFixed(2)} is held at booking time. In the event of missing accessories, broken components, or unreturned items, repair/replacement fees will be deducted directly from this deposit.`,
    },
    {
      title: "3. Scheduled Return & Late Penalties",
      text: `Equipment must be surrendered on or before ${rentalReturn}. Late returns beyond the grace period will accrue recurring daily overdue charges based on the standard daily rental rate until returned.`,
    },
    {
      title: "4. Liability Waiver & Indemnity",
      text: "RentHub and its vendors assume no liability for personal injury, property damage, or operational delays caused during the use of rented equipment.",
    },
  ];

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    vendorName,
    clientName,
    clientEmail: order.client.email,
    clientPhone: order.client.phone,
    rentalStartDate: order.rentalStartDate,
    scheduledReturnDate: order.scheduledReturnDate,
    rentalPeriod: `${rentalStart} to ${rentalReturn}`,
    items: itemsList,
    financialSummary: {
      totalRentalAmount: order.totalAmount,
      securityDepositAmount: order.securityDepositAmount,
    },
    clauses: termsClauses,
    signatureDetails: {
      termsAccepted: order.termsAccepted,
      signatureData: order.signatureData,
      signedAt: order.signedAt,
      signedIp: order.signedIp,
    },
  };
};

/**
 * Record E-Signature & accept terms on an order
 */
const recordAgreementSignature = async (orderId, signatureData, clientIp) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      termsAccepted: true,
      signatureData: signatureData,
      signedAt: new Date(),
      signedIp: clientIp || "127.0.0.1",
    },
  });

  return updatedOrder;
};

module.exports = {
  generateOrderAgreement,
  recordAgreementSignature,
};
