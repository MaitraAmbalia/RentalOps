import axiosInstance from './axiosInstance';

export const workflowService = {
  getWorkflows: async () => {
    const response = await axiosInstance.get('/workflows');
    return response.workflows || response;
  },

  createWorkflow: async (workflowData) => {
    const response = await axiosInstance.post('/workflows', workflowData);
    return response.workflow || response;
  },

  getWorkflowById: async (id) => {
    const response = await axiosInstance.get(`/workflows/${id}`);
    return response.workflow || response;
  },

  updateWorkflowStatus: async (id, status, details = {}) => {
    const response = await axiosInstance.patch(`/workflows/${id}/status`, { status, ...details });
    return response.workflow || response;
  }
};
