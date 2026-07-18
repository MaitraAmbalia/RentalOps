import axiosInstance from './axiosInstance';

export const dashboardService = {
  getStats: async () => {
    try {
      const response = await axiosInstance.get('/dashboard');
      return response.stats || response;
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      throw error;
    }
  }
};
