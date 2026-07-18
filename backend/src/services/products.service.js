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

exports.getProducts = async (vendorId) => {
  return await productRepo.findAllByVendor(vendorId);
};

exports.getProductById = async (vendorId, productId) => {
  const product = await productRepo.findById(productId, vendorId);
  if (!product) throw new ApiError(404, 'Product not found');
  return product;
};

exports.updateProduct = async (vendorId, productId, data) => {
  const product = await productRepo.findById(productId, vendorId);
  if (!product) throw new ApiError(404, 'Product not found');
  
  // For safety, simple updates are applied to top-level fields here.
  // Managing nested variants/attributes after creation requires complex diffing or explicit endpoints.
  const { attributes, variants, ...productData } = data;
  return await productRepo.update(productId, productData);
};

exports.deleteProduct = async (vendorId, productId) => {
  const product = await productRepo.findById(productId, vendorId);
  if (!product) throw new ApiError(404, 'Product not found');
  
  await productRepo.remove(productId);
  return true;
};
