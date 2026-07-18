const orderRepo = require('../repositories/order.repository');
const ApiError = require('../utils/apiError');
const { prisma } = require('../config/db');
const crypto = require('crypto');

// Utility to generate a pseudo-random unique order number
const generateOrderNumber = () => `SO-${Date.now()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

exports.createOrder = async (vendorId, data) => {
  const { items, ...orderData } = data;
  
  return await prisma.$transaction(async (tx) => {
    // 1. Create the Order along with its nested OrderItems
    const order = await tx.order.create({
      data: {
        ...orderData,
        orderNumber: generateOrderNumber(),
        vendorId,
        items: {
          create: items.map(item => ({
            productId: item.productId,
            productVariantId: item.productVariantId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.amount,
            rentalStart: item.rentalStart,
            rentalEnd: item.rentalEnd
          }))
        },
        // 2. Automatically generate the SecurityDepositInvoice record directly tied to the order
        depositInvoice: {
          create: {
            depositAmount: orderData.securityDepositAmount,
            depositStatus: 'HELD'
          }
        }
      },
      include: {
        items: true,
        depositInvoice: true
      }
    });

    return order;
  });
};

exports.getOrders = async (vendorId) => {
  return await orderRepo.findAllByVendor(vendorId);
};

exports.getClientOrders = async (clientId) => {
  return await orderRepo.findAllByClient(clientId);
};

exports.getOrderById = async (vendorId, orderId) => {
  const order = await orderRepo.findById(orderId, vendorId);
  if (!order) throw new ApiError(404, 'Order not found');
  return order;
};

exports.getClientOrderById = async (clientId, orderId) => {
  const order = await orderRepo.findByIdForClient(orderId, clientId);
  if (!order) throw new ApiError(404, 'Order not found');
  return order;
};

exports.updateOrderStatus = async (vendorId, orderId, status) => {
  const order = await orderRepo.findById(orderId, vendorId);
  if (!order) throw new ApiError(404, 'Order not found');
  
  return await orderRepo.updateStatus(orderId, status);
};
