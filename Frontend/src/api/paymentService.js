import axiosInstance from './axiosInstance';
import { ENDPOINTS } from './endpoints';

export const paymentService = {
  createRazorpayOrder: async (orderId) => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.PAYMENTS.CREATE_RAZORPAY_ORDER(orderId));
      return response;
    } catch (error) {
      console.error(`Failed to create Razorpay order for order ${orderId}:`, error);
      throw error;
    }
  },

  verifyPayment: async (paymentData) => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.PAYMENTS.VERIFY_PAYMENT, paymentData);
      return response;
    } catch (error) {
      console.error("Failed to verify Razorpay signature:", error);
      throw error;
    }
  }
};
