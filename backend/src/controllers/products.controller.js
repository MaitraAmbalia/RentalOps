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
    // Only fetching current vendor's products in this scope
    const products = await productService.getProducts(req.user.id);
    res.status(200).json({ success: true, products });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.user.id, req.params.id);
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
