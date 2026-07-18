const dashboardService = require("../services/dashboard.service");

exports.getSummary = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const summary = await dashboardService.getSummary(req.user.id, from, to);
    res.status(200).json({ success: true, summary });
  } catch (error) {
    next(error);
  }
};

exports.getActiveRentals = async (req, res, next) => {
  try {
    const result = await dashboardService.getActiveRentals(req.user.id);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

exports.getOverdueRentals = async (req, res, next) => {
  try {
    const result = await dashboardService.getOverdueRentals(req.user.id);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

exports.getRevenueSeries = async (req, res, next) => {
  try {
    const { from, to, groupBy } = req.query;
    const series = await dashboardService.getRevenueSeries(req.user.id, from, to, groupBy);
    res.status(200).json({ success: true, series });
  } catch (error) {
    next(error);
  }
};
