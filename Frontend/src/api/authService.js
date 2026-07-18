import axiosInstance from './axiosInstance';
import { ENDPOINTS } from './endpoints';

export const authService = {
  clientLogin: async (email, password) => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.AUTH.CLIENT_LOGIN, { email, password });
      return response;
    } catch (error) {
      console.error("Client login failed:", error);
      throw error;
    }
  },

  clientSignup: async (userData) => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.AUTH.CLIENT_SIGNUP, userData);
      return response;
    } catch (error) {
      console.error("Client signup failed:", error);
      throw error;
    }
  },

  vendorLogin: async (email, password) => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.AUTH.VENDOR_LOGIN, { email, password });
      return response;
    } catch (error) {
      console.error("Vendor login failed:", error);
      throw error;
    }
  },

  partnerLogin: async (phone, password) => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.AUTH.PARTNER_LOGIN, { phone, password });
      return response;
    } catch (error) {
      console.error("Delivery partner login failed:", error);
      throw error;
    }
  }
};
