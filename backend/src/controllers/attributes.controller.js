const attributeService = require('../services/attributes.service');

exports.create = async (req, res, next) => {
  try {
    const attribute = await attributeService.createAttribute(req.user.id, req.body);
    res.status(201).json({ success: true, attribute });
  } catch (error) {
    next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const attributes = await attributeService.getAttributes(req.user.id);
    res.status(200).json({ success: true, attributes });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const attribute = await attributeService.updateAttribute(req.user.id, req.params.id, req.body);
    res.status(200).json({ success: true, attribute });
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await attributeService.deleteAttribute(req.user.id, req.params.id);
    res.status(200).json({ success: true, message: 'Attribute deleted' });
  } catch (error) {
    next(error);
  }
};

exports.addValue = async (req, res, next) => {
  try {
    const value = await attributeService.addAttributeValue(req.user.id, req.params.id, req.body);
    res.status(201).json({ success: true, value });
  } catch (error) {
    next(error);
  }
};

exports.removeValue = async (req, res, next) => {
  try {
    await attributeService.removeAttributeValue(req.user.id, req.params.id, req.params.valueId);
    res.status(200).json({ success: true, message: 'Attribute value deleted' });
  } catch (error) {
    next(error);
  }
};
