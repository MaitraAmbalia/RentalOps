import axiosInstance from './axiosInstance';

export const notificationService = {
  getNotifications: async () => {
    try {
      const response = await axiosInstance.get('/notifications').catch(() => ({ notifications: [] }));
      return response.notifications || [];
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      return [];
    }
  },

  markAsRead: async (notificationId) => {
    try {
      const response = await axiosInstance.post(`/notifications/${notificationId}/read`).catch(() => ({ success: true }));
      return response;
    } catch (error) {
      console.error(`Failed to read notification ${notificationId}:`, error);
      throw error;
    }
  }
};
