const service = require('../services/invoices.service');

exports.create = async (req, res, next) => {
  try {
    const invoice = await service.createInvoice(req.body);
    res.status(201).json({ success: true, invoice });
  } catch (error) {
    next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const invoices = await service.getInvoices();
    res.status(200).json({ success: true, invoices });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const invoice = await service.getInvoiceById(req.params.id);
    res.status(200).json({ success: true, invoice });
  } catch (error) {
    next(error);
  }
};

exports.postInvoice = async (req, res, next) => {
  try {
    const invoice = await service.postInvoice(req.params.id);
    res.status(200).json({ success: true, invoice });
  } catch (error) {
    next(error);
  }
};
