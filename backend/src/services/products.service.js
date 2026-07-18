const productRepo = require('../repositories/product.repository');
const ApiError = require('../utils/apiError');
const { prisma } = require('../config/db');

exports.createProduct = async (vendorId, data) => {
  const { attributes, variants, ...productData } = data;
  
  // As requested, the frontend computes the variants, so we just save the nested structure directly
  // using Prisma's deeply nested create.
  
  return await prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        ...productData,
        vendorId,
        attributes: attributes && attributes.length > 0 ? {
          create: attributes.map(a => ({ attributeId: a.attributeId }))
        } : undefined,
        variants: variants && variants.length > 0 ? {
          create: variants.map(v => ({
            sku: v.sku,
            quantityOnHand: v.quantityOnHand,
            quantityAvailable: v.quantityAvailable,
            attributeValues: {
              create: v.attributeValues.map(av => ({ attributeValueId: av.attributeValueId }))
            }
          }))
        } : undefined
      },
      include: {
        attributes: true,
        variants: { include: { attributeValues: true } }
      }
    });
    return product;
  });
};

exports.getProducts = async (vendorId, filters = {}) => {
  if (vendorId) {
    return await productRepo.findAllByVendor(vendorId);
  }
  return await productRepo.findAllPublished(filters);
};

exports.getProductById = async (vendorId, productId) => {
  let product;
  if (vendorId) {
    product = await productRepo.findById(productId, vendorId);
  } else {
    product = await productRepo.findPublishedById(productId);
  }
  if (!product) throw new ApiError(404, 'Product not found');
  return product;
};

exports.updateProduct = async (vendorId, productId, data) => {
  const product = await productRepo.findById(productId, vendorId);
  if (!product) throw new ApiError(404, 'Product not found');
  
  const { attributes, variants, ...productData } = data;

  return await prisma.$transaction(async (tx) => {
    // 1. Update basic product fields
    const updated = await tx.product.update({
      where: { id: productId },
      data: productData
    });

    // 2. Sync attributes if provided
    if (attributes !== undefined) {
      await tx.productAttribute.deleteMany({ where: { productId } });
      if (Array.isArray(attributes) && attributes.length > 0) {
        await tx.productAttribute.createMany({
          data: attributes.map(a => ({ productId, attributeId: a.attributeId }))
        });
      }
    }

    return updated;
  });
};

exports.deleteProduct = async (vendorId, productId) => {
  const product = await productRepo.findById(productId, vendorId);
  if (!product) throw new ApiError(404, 'Product not found');
  
  await prisma.$transaction(async (tx) => {
    // 1. Delete CartItems referencing the product
    await tx.cartItem.deleteMany({ where: { productId } });
    
    // 2. Delete WishlistItems referencing the product
    await tx.wishlistItem.deleteMany({ where: { productId } });
    
    // 3. Delete PriceListRules referencing the product
    await tx.priceListRule.deleteMany({ where: { productId } });
    
    // 4. Delete QuotationItems referencing the product
    await tx.quotationItem.deleteMany({ where: { productId } });
    
    // 5. Update VendorSettings if it is the default late fee product
    await tx.vendorSettings.updateMany({
      where: { defaultLateFeeProductId: productId },
      data: { defaultLateFeeProductId: null }
    });
    
    // 6. Delete InvoiceLines referencing the product
    const invoiceLines = await tx.invoiceLine.findMany({ where: { productId } });
    const invoiceIds = invoiceLines.map(il => il.invoiceId);
    await tx.invoiceLine.deleteMany({ where: { productId } });
    if (invoiceIds.length > 0) {
      await tx.invoice.deleteMany({ where: { id: { in: invoiceIds } } });
    }

    // 7. Delete OrderItems and Orders referencing the product
    const orderItems = await tx.orderItem.findMany({ where: { productId } });
    const orderIds = orderItems.map(oi => oi.orderId);
    
    if (orderIds.length > 0) {
      // Delete SupportQuery referencing these orders
      await tx.supportQuery.deleteMany({ where: { orderId: { in: orderIds } } });
      
      // Delete PickupReturnWorkflow referencing these orders
      await tx.pickupReturnWorkflow.deleteMany({ where: { orderId: { in: orderIds } } });
      
      // Delete Payments referencing these orders
      await tx.payment.deleteMany({ where: { orderId: { in: orderIds } } });
      
      // Delete SecurityDepositInvoice referencing these orders
      await tx.securityDepositInvoice.deleteMany({ where: { orderId: { in: orderIds } } });
      
      // Update DeliveryPartner currentOrderId referencing these orders
      await tx.deliveryPartner.updateMany({
        where: { currentOrderId: { in: orderIds } },
        data: { currentOrderId: null }
      });
      
      // Delete Invoices referencing these orders
      await tx.invoice.deleteMany({ where: { orderId: { in: orderIds } } });
      
      // Delete CouponRedemption referencing these orders
      await tx.couponRedemption.deleteMany({ where: { orderId: { in: orderIds } } });
    }

    // Delete OrderItems referencing this product
    await tx.orderItem.deleteMany({ where: { productId } });

    // Now delete the Orders themselves
    if (orderIds.length > 0) {
      await tx.order.deleteMany({ where: { id: { in: orderIds } } });
    }

    // 8. Delete ProductAttribute mappings
    await tx.productAttribute.deleteMany({ where: { productId } });

    // 9. Delete ProductVariant mappings
    await tx.productVariant.deleteMany({ where: { productId } });
    
    // 10. Delete the Product
    await tx.product.delete({ where: { id: productId } });
  });

  return true;
};

