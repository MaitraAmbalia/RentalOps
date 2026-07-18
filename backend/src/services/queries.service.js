const repo = require('../repositories/query.repository');
const ApiError = require('../utils/apiError');

exports.openQuery = async (clientId, data) => {
  return await repo.create({
    ...data,
    clientId
  });
};

exports.getQueries = async (filters = {}) => {
  return await repo.findMany(filters);
};

exports.getQueryById = async (id, clientId = null) => {
  const query = await repo.findById(id);
  if (!query) throw new ApiError(404, 'Support Query not found');
  
  // If a client is requesting, ensure they own the query
  if (clientId && query.clientId !== clientId) {
    throw new ApiError(403, 'You do not have permission to view this query');
  }

  return query;
};

exports.resolveQuery = async (id, status) => {
  const query = await repo.findById(id);
  if (!query) throw new ApiError(404, 'Support Query not found');
  
  return await repo.updateStatus(id, status);
};
