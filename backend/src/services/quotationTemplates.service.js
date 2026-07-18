const repo = require('../repositories/quotationTemplate.repository');
const ApiError = require('../utils/apiError');

exports.createTemplate = async (vendorId, data) => {
  const { lines, ...templateData } = data;
  
  const payload = {
    ...templateData,
    vendorId,
  };

  if (lines && lines.length > 0) {
    payload.lines = {
      create: lines.map(line => ({
        productId: line.productId,
        quantity: line.quantity,
        unit: line.unit
      }))
    };
  }

  return await repo.create(payload);
};

exports.getTemplates = async (vendorId) => {
  return await repo.findAllByVendor(vendorId);
};

exports.getTemplateById = async (vendorId, id) => {
  const template = await repo.findById(id, vendorId);
  if (!template) throw new ApiError(404, 'Quotation Template not found');
  return template;
};

exports.deleteTemplate = async (vendorId, id) => {
  const template = await repo.findById(id, vendorId);
  if (!template) throw new ApiError(404, 'Quotation Template not found');
  return await repo.delete(id, vendorId);
};
