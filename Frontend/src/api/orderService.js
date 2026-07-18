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

  getOrderById: async (id) => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.ORDERS.GET_BY_ID(id));
      return response.order || response;
    } catch (error) {
      console.error(`Failed to fetch order ${id}:`, error);
      throw error;
    }
  },

  createOrder: async (orderData) => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.ORDERS.BASE, orderData);
      return response.order || response;
    } catch (error) {
      console.error("Failed to create order:", error);
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

