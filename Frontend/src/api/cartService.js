import axiosInstance from './axiosInstance';
import { ENDPOINTS } from './endpoints';

export const cartService = {
  applyCoupon: async (code, cartItems) => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.CART.APPLY_COUPON, { code, cartItems });
      return response;
    } catch (error) {
      console.error('Failed to apply coupon:', error);
      throw error;
    }
  }
};
