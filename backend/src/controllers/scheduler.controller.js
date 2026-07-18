const service = require("../services/scheduler.service");

exports.getMonthly = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const days = await service.getSchedulerData(req.user.id, month, year);
    res.status(200).json({ success: true, days });
  } catch (error) {
    next(error);
  }
};

exports.getDay = async (req, res, next) => {
  try {
    const { date } = req.query;
    const orders = await service.getSchedulerDayDetails(req.user.id, date);
    res.status(200).json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

exports.getRange = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const days = await service.getSchedulerRangeData(req.user.id, from, to);
    res.status(200).json({ success: true, days });
  } catch (error) {
    next(error);
  }
};
