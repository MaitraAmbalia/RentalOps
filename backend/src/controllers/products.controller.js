const productService = require('../services/products.service');

exports.create = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.user.id, req.body);
    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const isVendor = req.user && req.user.type === 'VENDOR';
    const vendorId = isVendor ? req.user.id : null;
    const products = await productService.getProducts(vendorId, req.query);
    res.status(200).json({ success: true, products });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const isVendor = req.user && req.user.type === 'VENDOR';
    const vendorId = isVendor ? req.user.id : null;
    const product = await productService.getProductById(vendorId, req.params.id);
    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.user.id, req.params.id, req.body);
    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await productService.deleteProduct(req.user.id, req.params.id);
    res.status(200).json({ success: true, message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};
