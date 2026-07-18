const service = require('../services/quotationTemplates.service');

exports.create = async (req, res, next) => {
  try {
    const template = await service.createTemplate(req.user.vendorId || req.user.id, req.body);
    res.status(201).json({ success: true, template });
  } catch (error) {
    next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const templates = await service.getTemplates(req.user.vendorId || req.user.id);
    res.status(200).json({ success: true, templates });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const template = await service.getTemplateById(req.user.vendorId || req.user.id, req.params.id);
    res.status(200).json({ success: true, template });
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    await service.deleteTemplate(req.user.vendorId || req.user.id, req.params.id);
    res.status(200).json({ success: true, message: 'Template deleted successfully' });
  } catch (error) {
    next(error);
  }
};
