const orderRepo = require('../repositories/order.repository');
const ApiError = require('../utils/apiError');
const { prisma } = require('../config/db');
const crypto = require('crypto');

// Utility to generate a pseudo-random unique order number
const generateOrderNumber = () => `SO-${Date.now()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

exports.createOrder = async (vendorId, data) => {
  const { items, couponCode, ...orderData } = data;
  
  return await prisma.$transaction(async (tx) => {
    // Determine the vendorId if not provided (e.g. order placed by a CLIENT)
    let actualVendorId = vendorId;
    if (!actualVendorId && items.length > 0) {
      const firstProduct = await tx.product.findUnique({
        where: { id: items[0].productId }
      });
      if (!firstProduct) throw new ApiError(404, 'Product not found');
      actualVendorId = firstProduct.vendorId;
    }

    // Process Coupon if provided
    let finalUntaxedAmount = orderData.untaxedAmount;
    let finalTotalAmount = orderData.totalAmount;
    let appliedCouponId = null;

    if (couponCode) {
      const coupon = await tx.coupon.findUnique({
        where: { vendorId_code: { vendorId: actualVendorId, code: couponCode } }
      });
      
      if (coupon) {
        // Calculate the discount
        let discount = 0;
        if (coupon.discountPercent !== null) {
          discount = orderData.untaxedAmount * (Number(coupon.discountPercent) / 100);
        } else if (coupon.fixedAmount !== null) {
          discount = Number(coupon.fixedAmount);
        }
        discount = Math.min(discount, orderData.untaxedAmount);
        
        finalUntaxedAmount = Math.max(0, orderData.untaxedAmount - discount);
        // Note: taxAmount should technically be recalculated if we were doing strict accounting, 
        // but since Odoo's frontend does total = subtotal - discount + security + delivery, 
        // we'll just subtract the discount from the totalAmount to match.
        finalTotalAmount = Math.max(0, orderData.totalAmount - discount);
        appliedCouponId = coupon.id;
      } else {
        throw new ApiError(400, 'Invalid coupon code for this vendor');
      }
    }

    // 1. Create the Order along with its nested OrderItems
    const order = await tx.order.create({
      data: {
        ...orderData,
        untaxedAmount: finalUntaxedAmount,
        totalAmount: finalTotalAmount,
        couponId: appliedCouponId,
        orderNumber: generateOrderNumber(),
        vendorId: actualVendorId,
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
        depositInvoice: true,
        coupon: true
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
