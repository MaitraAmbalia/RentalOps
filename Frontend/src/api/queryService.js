import axiosInstance from './axiosInstance';

export const queryService = {
  getQueries: async () => {
    const response = await axiosInstance.get('/queries');
    return response.queries || response;
  },

  createQuery: async (queryData) => {
    const response = await axiosInstance.post('/queries', queryData);
    return response.query || response;
  },

  resolveQuery: async (id, status = 'RESOLVED') => {
    const response = await axiosInstance.patch(`/queries/${id}/resolve`, { status });
    return response.query || response;
  }
};
