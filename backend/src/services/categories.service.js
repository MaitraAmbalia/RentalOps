const categoryRepo = require('../repositories/productCategory.repository');
const ApiError = require('../utils/apiError');

exports.createCategory = async (vendorId, data) => {
  // Check if category with same name exists for vendor
  const existing = await categoryRepo.findAllByVendor(vendorId);
  if (existing.some(c => c.name.toLowerCase() === data.name.toLowerCase())) {
    throw new ApiError(400, 'Category with this name already exists');
  }
  return await categoryRepo.create({ ...data, vendorId });
};

exports.getCategories = async (vendorId) => {
  return await categoryRepo.findAllByVendor(vendorId);
};

exports.updateCategory = async (vendorId, categoryId, data) => {
  const category = await categoryRepo.findById(categoryId, vendorId);
  if (!category) throw new ApiError(404, 'Category not found');
  
  return await categoryRepo.update(categoryId, data);
};

exports.deleteCategory = async (vendorId, categoryId) => {
  const category = await categoryRepo.findById(categoryId, vendorId);
  if (!category) throw new ApiError(404, 'Category not found');
  
  await categoryRepo.remove(categoryId);
  return true;
};
