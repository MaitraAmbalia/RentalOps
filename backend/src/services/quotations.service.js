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

exports.getQuotations = async (vendorId) => {
  return await repo.findAllByVendor(vendorId);
};

exports.getQuotationById = async (vendorId, id) => {
  const quotation = await repo.findById(id, vendorId);
  if (!quotation) throw new ApiError(404, 'Quotation not found');
  return quotation;
};

exports.updateStatus = async (vendorId, id, status) => {
  const quotation = await repo.findById(id, vendorId);
  if (!quotation) throw new ApiError(404, 'Quotation not found');
  
  // In a full implementation, if status === 'CONFIRMED', we could auto-create the Order here.
  // For now, we update the status, and the frontend will hit the /api/orders endpoint 
  // with the finalized pricing to create the actual Order.
  return await repo.updateStatus(id, status);
};
