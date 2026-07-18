const workflowService = require("../services/workflow.service");

exports.create = async (req, res, next) => {
  try {
    const workflow = await workflowService.createWorkflow(req.body);
    res.status(201).json({ success: true, workflow });
  } catch (error) {
    next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const filters = {
      type: req.query.type,
      status: req.query.status,
      deliveryId: req.query.deliveryId,
      date: req.query.date,
      page: req.query.page,
      limit: req.query.limit,
    };
    const result = await workflowService.getWorkflows(req.user, filters);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const workflow = await workflowService.getWorkflowById(req.params.id, req.user);
    res.status(200).json({ success: true, workflow });
  } catch (error) {
    next(error);
  }
};

exports.updateRoute = async (req, res, next) => {
  try {
    const workflow = await workflowService.updateRouteSequence(req.params.id, req.body.routeSequence);
    res.status(200).json({ success: true, workflow });
  } catch (error) {
    next(error);
  }
};

exports.notify = async (req, res, next) => {
  try {
    const workflow = await workflowService.notifyCustomer(req.params.id);
    res.status(200).json({ success: true, workflow });
  } catch (error) {
    next(error);
  }
};

exports.scan = async (req, res, next) => {
  try {
    const workflow = await workflowService.scanQrCode(req.params.id, req.body.qrCode, req.user);
    res.status(200).json({ success: true, workflow });
  } catch (error) {
    next(error);
  }
};

exports.complete = async (req, res, next) => {
  try {
    const damageImages = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
    const updateData = {
      ...req.body,
      damageImages,
    };
    const result = await workflowService.completeWorkflow(req.params.id, updateData, req.user);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const workflow = await workflowService.updateWorkflow(req.params.id, req.body);
    res.status(200).json({ success: true, workflow });
  } catch (error) {
    next(error);
  }
};

