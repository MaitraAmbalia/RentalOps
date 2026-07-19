const repo = require('../repositories/query.repository');
const ApiError = require('../utils/apiError');

const mapQuery = (q) => {
  if (!q) return q;
  return {
    ...q,
    clientName: q.client ? `${q.client.firstName} ${q.client.lastName}`.trim() : 'Unknown Client',
    clientEmail: q.client ? q.client.email : '',
    orderNumber: q.order ? q.order.orderNumber : ''
  };
};

exports.openQuery = async (clientId, data) => {
  const query = await repo.create({
    ...data,
    clientId
  });
  return mapQuery(query);
};

exports.getQueries = async (filters = {}) => {
  const queries = await repo.findMany(filters);
  return queries.map(mapQuery);
};

exports.getQueryById = async (id, clientId = null) => {
  const query = await repo.findById(id);
  if (!query) throw new ApiError(404, 'Support Query not found');
  
  // If a client is requesting, ensure they own the query
  if (clientId && query.clientId !== clientId) {
    throw new ApiError(403, 'You do not have permission to view this query');
  }

  return mapQuery(query);
};

exports.resolveQuery = async (id, status) => {
  const query = await repo.findById(id);
  if (!query) throw new ApiError(404, 'Support Query not found');
  
  const updated = await repo.updateStatus(id, status);
  return mapQuery(updated);
};
