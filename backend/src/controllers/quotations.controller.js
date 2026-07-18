const service = require('../services/quotations.service');

exports.create = async (req, res, next) => {
  try {
    const quotation = await service.createQuotation(req.user.vendorId || req.user.id, req.body);
    res.status(201).json({ success: true, quotation });
  } catch (error) {
    next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const quotations = await service.getQuotations(req.user.vendorId || req.user.id);
    res.status(200).json({ success: true, quotations });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const quotation = await service.getQuotationById(req.user.vendorId || req.user.id, req.params.id);
    res.status(200).json({ success: true, quotation });
  } catch (error) {
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const quotation = await service.updateStatus(req.user.vendorId || req.user.id, req.params.id, req.body.status);
    res.status(200).json({ success: true, quotation });
  } catch (error) {
    next(error);
  }
};

const pdfGenerator = require('../utils/pdfGenerator');

exports.downloadPDF = async (req, res, next) => {
  try {
    const quotation = await service.getQuotationById(req.user.vendorId || req.user.id, req.params.id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=quotation-${req.params.id}.pdf`);
    pdfGenerator.generateQuotationPDF(quotation, res);
  } catch (error) {
    next(error);
  }
};
