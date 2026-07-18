const attributeRepo = require('../repositories/attribute.repository');
const attributeValueRepo = require('../repositories/attributeValue.repository');
const ApiError = require('../utils/apiError');
const { prisma } = require('../config/db');

exports.createAttribute = async (vendorId, data) => {
  const { values, ...attrData } = data;
  
  return await prisma.$transaction(async (tx) => {
    const attribute = await tx.attribute.create({
      data: {
        ...attrData,
        vendorId,
        values: values && values.length > 0 ? {
          create: values
        } : undefined
      },
      include: { values: true }
    });
    return attribute;
  });
};

exports.getAttributes = async (vendorId) => {
  return await attributeRepo.findAllByVendor(vendorId);
};

exports.updateAttribute = async (vendorId, attributeId, data) => {
  const attribute = await attributeRepo.findById(attributeId, vendorId);
  if (!attribute) throw new ApiError(404, 'Attribute not found');
  
  // For simplicity, we only update the top level attribute data in this route. 
  // Values are managed via dedicated add/remove routes or a full sync.
  const { values, ...attrData } = data;
  return await attributeRepo.update(attributeId, attrData);
};

exports.deleteAttribute = async (vendorId, attributeId) => {
  const attribute = await attributeRepo.findById(attributeId, vendorId);
  if (!attribute) throw new ApiError(404, 'Attribute not found');
  
  await attributeRepo.remove(attributeId);
  return true;
};

exports.addAttributeValue = async (vendorId, attributeId, valueData) => {
  const attribute = await attributeRepo.findById(attributeId, vendorId);
  if (!attribute) throw new ApiError(404, 'Attribute not found');
  
  return await attributeValueRepo.create({ ...valueData, attributeId });
};

exports.removeAttributeValue = async (vendorId, attributeId, valueId) => {
  const attribute = await attributeRepo.findById(attributeId, vendorId);
  if (!attribute) throw new ApiError(404, 'Attribute not found');
  
  await attributeValueRepo.remove(valueId);
  return true;
};
