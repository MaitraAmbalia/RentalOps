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

  vendorSignup: async (vendorData) => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.AUTH.VENDOR_SIGNUP, vendorData);
      return response;
    } catch (error) {
      console.error("Vendor signup failed:", error);
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
  },

  getCurrentUser: async () => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.AUTH.ME);
      return response;
    } catch (error) {
      console.error("Failed to get current user:", error);
      throw error;
    }
  }
};
