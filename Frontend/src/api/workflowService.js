import axiosInstance from './axiosInstance';

const STORAGE_KEY = 'vendor_pickup_return_workflows';

const getLocalWorkflows = () => {
  const local = localStorage.getItem(STORAGE_KEY);
  if (!local) {
    // Seed some initial workflows
    const seed = [
      {
        id: 'wf_1',
        orderId: 'so_1',
        orderNumber: 'SO0001',
        deliveryId: 'dp_1',
        deliveryPartnerName: 'Jack Ryan',
        workflowType: 'PICKUP',
        scheduledDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        workflowStatus: 'SCHEDULED',
        conditionInspectionNotes: 'None',
        missingAccessories: [],
        damageReported: false
      },
      {
        id: 'wf_2',
        orderId: 'so_2',
        orderNumber: 'SO0002',
        deliveryId: 'dp_2',
        deliveryPartnerName: 'Sarah Connor',
        workflowType: 'RETURN',
        scheduledDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        workflowStatus: 'LATE',
        conditionInspectionNotes: 'Scratches on side panel',
        missingAccessories: ['Power Cable'],
        damageReported: true,
        damageDescription: 'Dents on outer metallic frame',
        damageImages: []
      }
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
  return JSON.parse(local);
};

export const workflowService = {
  getWorkflows: async () => {
    try {
      const response = await axiosInstance.get('/workflows');
      return response.workflows || response;
    } catch (error) {
      console.warn("Workflows endpoint not active on backend. Falling back to localStorage mock.");
      return getLocalWorkflows();
    }
  },

  createWorkflow: async (workflowData) => {
    try {
      const response = await axiosInstance.post('/workflows', workflowData);
      return response.workflow || response;
    } catch (error) {
      console.warn("Workflows endpoint not active on backend. Saving to localStorage mock.");
      const workflows = getLocalWorkflows();
      const newWorkflow = {
        id: `wf_${Math.random().toString(36).substr(2, 9)}`,
        workflowStatus: 'SCHEDULED',
        createdAt: new Date().toISOString(),
        ...workflowData
      };
      workflows.push(newWorkflow);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(workflows));
      return newWorkflow;
    }
  },

  updateWorkflowStatus: async (id, status, details = {}) => {
    try {
      const response = await axiosInstance.patch(`/workflows/${id}/status`, { status, ...details });
      return response.workflow || response;
    } catch (error) {
      console.warn("Workflows status endpoint not active on backend. Updating localStorage mock.");
      const workflows = getLocalWorkflows();
      const updated = workflows.map(w => w.id === id ? { ...w, workflowStatus: status, ...details } : w);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated.find(w => w.id === id);
    }
  }
};
