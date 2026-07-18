import axiosInstance from './axiosInstance';
import { ENDPOINTS } from './endpoints';

export const orderService = {
  getOrders: async (filters = {}) => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.ORDERS.BASE, { params: filters });
      return response.orders || response;
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      throw error;
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await axiosInstance.patch(ENDPOINTS.ORDERS.UPDATE_STATUS(orderId), { status });
      return response.order || response;
    } catch (error) {
      console.error(`Failed to update status for order ${orderId}:`, error);
      throw error;
    }
  }
};
