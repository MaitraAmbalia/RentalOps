import axiosInstance from './axiosInstance';

const STORAGE_KEY = 'vendor_support_queries';

const getLocalQueries = () => {
  const local = localStorage.getItem(STORAGE_KEY);
  if (!local) {
    // Seed some initial support queries
    const seed = [
      {
        id: 'q_1',
        orderId: 'so_1',
        orderNumber: 'SO0001',
        clientId: 'cl_1',
        clientName: 'John Doe',
        clientEmail: 'john@example.com',
        queryType: 'PRODUCT_MISSING',
        description: 'The package was delivered but the charging block and extension chord were missing.',
        status: 'OPEN',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        id: 'q_2',
        orderId: 'so_2',
        orderNumber: 'SO0002',
        clientId: 'cl_2',
        clientName: 'Jane Smith',
        clientEmail: 'jane@example.com',
        queryType: 'DAMAGED_GOOD',
        description: 'Received a camera kit with a large scratch on the rear viewport and lens connector cap missing.',
        status: 'IN_PROGRESS',
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
  return JSON.parse(local);
};

export const queryService = {
  getQueries: async () => {
    try {
      const response = await axiosInstance.get('/queries');
      return response.queries || response;
    } catch (error) {
      console.warn("Queries endpoint not active on backend. Falling back to localStorage mock.");
      return getLocalQueries();
    }
  },

  resolveQuery: async (id, status = 'RESOLVED') => {
    try {
      const response = await axiosInstance.patch(`/queries/${id}/resolve`, { status });
      return response.query || response;
    } catch (error) {
      console.warn("Queries resolution endpoint not active on backend. Updating localStorage mock.");
      const queries = getLocalQueries();
      const updated = queries.map(q => q.id === id ? { ...q, status } : q);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated.find(q => q.id === id);
    }
  }
};
