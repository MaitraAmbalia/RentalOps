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
