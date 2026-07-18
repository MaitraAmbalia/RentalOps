const priceListService = require("../services/priceList.service");

exports.getAll = async (req, res, next) => {
  try {
    const priceLists = await priceListService.getPriceLists();
    res.status(200).json({ success: true, priceLists });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const priceList = await priceListService.createPriceList(req.user.id, req.body);
    res.status(201).json({ success: true, priceList });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const priceList = await priceListService.updatePriceList(req.params.id, req.user.id, req.body);
    res.status(200).json({ success: true, priceList });
  } catch (error) {
    next(error);
  }
};

exports.addRule = async (req, res, next) => {
  try {
    const rule = await priceListService.addRule(req.params.priceListId, req.user.id, req.body);
    res.status(201).json({ success: true, rule });
  } catch (error) {
    next(error);
  }
};

exports.deleteRule = async (req, res, next) => {
  try {
    await priceListService.removeRule(req.params.priceListId, req.params.ruleId, req.user.id);
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};
