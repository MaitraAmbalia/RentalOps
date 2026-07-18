const lateFeeService = require("../services/lateFee.service");

exports.calculate = async (req, res, next) => {
  try {
    const { actualReturnDate } = req.body;
    const result = await lateFeeService.calculateLateFee(req.params.id, actualReturnDate);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};
