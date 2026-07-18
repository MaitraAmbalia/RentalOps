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
    const quotations = await service.getQuotationsForUser(req.user.vendorId || req.user.id, req.user.role);
    res.status(200).json({ success: true, quotations });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const quotation = await service.getQuotationById(req.user.vendorId || req.user.id, req.params.id, req.user.role);
    res.status(200).json({ success: true, quotation });
  } catch (error) {
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const quotation = await service.updateStatus(
      req.user.vendorId || req.user.id,
      req.params.id,
      req.body.status,
      req.user.role
    );
    res.status(200).json({ success: true, quotation });
  } catch (error) {
    next(error);
  }
};

const pdfGenerator = require('../utils/pdfGenerator');

exports.downloadPDF = async (req, res, next) => {
  try {
    const quotation = await service.getQuotationById(req.user.vendorId || req.user.id, req.params.id, req.user.role);
    const pdfBuffer = await pdfGenerator.generateQuotationPDFBuffer(quotation);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=quotation-${req.params.id.slice(0,8)}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

exports.sendEmail = async (req, res, next) => {
  try {
    const result = await service.sendQuotationEmail(req.user.vendorId || req.user.id, req.params.id);
    res.status(200).json({ success: true, message: 'Quotation email sent successfully', result });
  } catch (error) {
    next(error);
  }
};

exports.acceptByClient = async (req, res, next) => {
  try {
    const result = await service.acceptQuotationByClient(req.user.id, req.params.id, req.body.signatureData);
    res.status(200).json({ success: true, message: 'Quotation accepted and order created successfully', ...result });
  } catch (error) {
    next(error);
  }
};
