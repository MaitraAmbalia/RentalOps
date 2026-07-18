const categoryService = require('../services/categories.service');

exports.create = async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(req.user.id, req.body);
    res.status(201).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const categories = await categoryService.getCategories(req.user.id);
    res.status(200).json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const category = await categoryService.updateCategory(req.user.id, req.params.id, req.body);
    res.status(200).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await categoryService.deleteCategory(req.user.id, req.params.id);
    res.status(200).json({ success: true, message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
};
