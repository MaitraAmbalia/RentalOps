const service = require('../services/queries.service');

exports.create = async (req, res, next) => {
  try {
    const query = await service.openQuery(req.user.clientId || req.user.id, req.body);
    res.status(201).json({ success: true, query });
  } catch (error) {
    next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    // If user is a VENDOR, they see all. If CLIENT, they see their own.
    const filters = req.user.role === 'VENDOR' ? {} : { clientId: req.user.clientId || req.user.id };
    const queries = await service.getQueries(filters);
    res.status(200).json({ success: true, queries });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    // Pass clientId if the user is a client, so the service enforces ownership
    const clientId = req.user.role === 'CLIENT' ? (req.user.clientId || req.user.id) : null;
    const query = await service.getQueryById(req.params.id, clientId);
    res.status(200).json({ success: true, query });
  } catch (error) {
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const query = await service.resolveQuery(req.params.id, req.body.status);
    res.status(200).json({ success: true, query });
  } catch (error) {
    next(error);
  }
};
