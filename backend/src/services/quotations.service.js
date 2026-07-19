const repo = require('../repositories/quotation.repository');
const ApiError = require('../utils/apiError');

exports.createQuotation = async (vendorId, data) => {
  const { items, ...quotationData } = data;
  
  return await repo.create({
    ...quotationData,
    vendorId,
    items: {
      create: items.map(item => ({
        productId: item.productId,
        productVariantId: item.productVariantId,
        quantity: item.quantity,
        unit: item.unit,
        rentalStart: item.rentalStart,
        rentalEnd: item.rentalEnd
      }))
    }
  });
};

exports.createClientRFQ = async (data) => {
  const { categoryId, vendorId, clientId, rfqDescription, rfqQuantity, rfqRentalStart, rfqRentalEnd } = data;
  
  if (!vendorId) {
    throw new ApiError(400, 'Vendor ID is required for RFQ');
  }

  const rfq = await repo.create({
    clientId,
    vendorId,
    categoryId,
    rfqDescription,
    rfqQuantity: rfqQuantity ? Number(rfqQuantity) : 1,
    rfqRentalStart: rfqRentalStart ? new Date(rfqRentalStart) : null,
    rfqRentalEnd: rfqRentalEnd ? new Date(rfqRentalEnd) : null,
    status: 'RFQ',
    paymentTermsPercent: 100,
    quotationValidityDays: 7
  });

  try {
    await notificationService.createNotification(
      vendorId,
      'VENDOR',
      'GENERAL',
      'New RFQ Received',
      `You have received a new Request for Quotation #${rfq.id.slice(0, 8).toUpperCase()} from client.`
    );
  } catch (err) {
    console.error('Failed to notify vendor about RFQ:', err);
  }

  return rfq;
};

exports.updateQuotation = async (vendorId, id, data) => {
  const quotation = await repo.findById(id, vendorId);
  if (!quotation) {
    throw new ApiError(404, 'Quotation not found');
  }

  const { items, ...quotationData } = data;

  await prisma.quotationItem.deleteMany({
    where: { quotationId: id }
  });

  const updateData = {
    ...quotationData,
    status: data.status || quotation.status,
  };

  if (items && items.length > 0) {
    updateData.items = {
      create: items.map(item => ({
        productId: item.productId,
        productVariantId: item.productVariantId || null,
        quantity: Number(item.quantity || 1),
        unit: item.unit || 'Unit',
        rentalStart: new Date(item.rentalStart),
        rentalEnd: new Date(item.rentalEnd),
      }))
    };
  }

  const updated = await repo.update(id, updateData);

  if (data.status === 'SENT' && quotation.status !== 'SENT') {
    try {
      await notificationService.createNotification(
        updated.clientId,
        'CLIENT',
        'QUOTATION_SENT',
        'New Quotation Received',
        `You have received a new quotation proposal #${updated.id.slice(0, 8).toUpperCase()} from ${updated.vendor?.companyName || 'Vendor'}.`
      );
    } catch (notifErr) {
      console.error('Failed to create notification on quote send:', notifErr);
    }
  }

  return updated;
};

const pdfGenerator = require('../utils/pdfGenerator');
const emailService = require('./emailService');
const notificationService = require('./notification.service');
const { prisma } = require('../config/db');

exports.getQuotationsForUser = async (userId, role) => {
  if (role === 'CLIENT') {
    return await repo.findAllByClient(userId);
  }
  return await repo.findAllByVendor(userId);
};

exports.getQuotationById = async (userId, id, role) => {
  const quotation = await repo.findById(id, role === 'VENDOR' ? userId : null);
  if (!quotation) throw new ApiError(404, 'Quotation not found');
  if (role === 'CLIENT' && quotation.clientId !== userId) {
    throw new ApiError(403, 'Forbidden: This quotation belongs to another client');
  }
  return quotation;
};

exports.updateStatus = async (userId, id, status, role) => {
  const quotation = await repo.findById(id, role === 'VENDOR' ? userId : null);
  if (!quotation) throw new ApiError(404, 'Quotation not found');
  if (role === 'CLIENT' && quotation.clientId !== userId) {
    throw new ApiError(403, 'Forbidden: This quotation belongs to another client');
  }
  return await repo.updateStatus(id, status);
};

exports.sendQuotationEmail = async (vendorId, id) => {
  const quotation = await repo.findById(id, vendorId);
  if (!quotation) throw new ApiError(404, 'Quotation not found');

  const pdfBuffer = await pdfGenerator.generateQuotationPDFBuffer(quotation);
  const clientName = quotation.client ? `${quotation.client.firstName} ${quotation.client.lastName}` : 'Valued Customer';
  const clientEmail = quotation.client?.email;

  if (!clientEmail) {
    throw new ApiError(400, 'Client email is missing on this quotation');
  }

  const result = await emailService.sendQuotationEmail({
    clientEmail,
    clientName,
    quotationId: quotation.id,
    pdfBuffer,
  });

  await repo.updateStatus(id, 'SENT');

  try {
    await notificationService.createNotification(
      quotation.clientId,
      'CLIENT',
      'QUOTATION_SENT',
      'New Quotation Received',
      `You have received a new quotation proposal #${quotation.id.slice(0, 8).toUpperCase()} from ${quotation.vendor?.companyName || 'Vendor'}.`
    );
  } catch (notifErr) {
    console.error('Failed to create quotation sent notification:', notifErr);
  }

  return result;
};

exports.acceptQuotationByClient = async (clientId, id, signatureData) => {
  const quotation = await repo.findById(id, null);
  if (!quotation) throw new ApiError(404, 'Quotation not found');
  if (quotation.clientId !== clientId) {
    throw new ApiError(403, 'Forbidden: Quotation access denied');
  }

  if (quotation.status === 'CONFIRMED') {
    throw new ApiError(400, 'Quotation has already been accepted and confirmed into an order');
  }

  // Update quotation status to CONFIRMED
  const updatedQuotation = await repo.updateStatus(id, 'CONFIRMED');

  // Transactionally generate an active Order
  const count = await prisma.order.count();
  const orderNumber = `SO${(count + 1).toString().padStart(4, '0')}`;

  const firstItem = quotation.items[0] || {};
  const rentalStartDate = firstItem.rentalStart ? new Date(firstItem.rentalStart) : new Date();
  const rentalEndDate = firstItem.rentalEnd ? new Date(firstItem.rentalEnd) : new Date(Date.now() + 7 * 86400000);

  const settings = await prisma.vendorSettings.findUnique({
    where: { vendorId: quotation.vendorId }
  });

  let untaxedAmount = 0;
  const lines = quotation.items.map(item => {
    const price = Number(item.product?.price || 0);
    const qty = Number(item.quantity || 1);
    const lineAmount = price * qty;
    untaxedAmount += lineAmount;

    return {
      productId: item.productId,
      productVariantId: item.productVariantId || null,
      quantity: qty,
      unit: item.unit || 'Unit',
      unitPrice: price,
      amount: lineAmount,
      rentalStart: item.rentalStart,
      rentalEnd: item.rentalEnd,
    };
  });

  const taxPercent = Number(settings?.defaultTaxPercent || 0);
  const taxAmount = (untaxedAmount * taxPercent) / 100;
  const totalAmount = untaxedAmount + taxAmount;

  let securityDepositAmount = 0;
  const depositValue = Number(settings?.defaultDepositValue || 100);
  if (settings?.defaultDepositCalcType === 'PERCENT_OF_RENTAL') {
    securityDepositAmount = (untaxedAmount * depositValue) / 100;
  } else {
    securityDepositAmount = depositValue;
  }

  const order = await prisma.order.create({
    data: {
      orderNumber,
      clientId: quotation.clientId,
      vendorId: quotation.vendorId,
      quotationId: quotation.id,
      fulfillmentType: 'HOME_DELIVERY',
      orderSource: 'ONLINE',
      priceListId: quotation.priceListId,
      rentalStartDate,
      scheduledReturnDate: rentalEndDate,
      status: 'PROCESSING',
      termsAccepted: true,
      signatureData: signatureData || null,
      signedAt: new Date(),
      untaxedAmount,
      taxPercent,
      taxAmount,
      totalAmount,
      securityDepositAmount,
      items: {
        create: lines
      }
    },
    include: { items: { include: { product: true } }, client: true }
  });

  try {
    // Notify Vendor
    await notificationService.createNotification(
      quotation.vendorId,
      'VENDOR',
      'GENERAL',
      'Quotation Signed & Confirmed',
      `Quotation #${quotation.id.slice(0, 8).toUpperCase()} has been signed by client ${quotation.client?.firstName || 'Client'} ${quotation.client?.lastName || ''} and converted to Order ${orderNumber}.`
    );

    // Notify Client
    await notificationService.createNotification(
      quotation.clientId,
      'CLIENT',
      'PAYMENT_CONFIRMATION',
      'Order Confirmed',
      `Your quotation proposal has been signed successfully! Order ${orderNumber} is now processing.`
    );
  } catch (notifErr) {
    console.error('Failed to create quotation accept notifications:', notifErr);
  }

  return { quotation: updatedQuotation, order };
};
