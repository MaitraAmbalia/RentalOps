import axiosInstance from './axiosInstance';
import { ENDPOINTS } from './endpoints';

export const vendorService = {
  getProfile: async () => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.VENDORS.ME);
      return response.vendor || response;
    } catch (error) {
      console.error("Failed to fetch vendor profile:", error);
      throw error;
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await axiosInstance.patch(ENDPOINTS.VENDORS.ME, profileData);
      return response.vendor || response;
    } catch (error) {
      console.error("Failed to update vendor profile:", error);
      throw error;
    }
  },

  changePassword: async (passwordPayload) => {
    try {
      const response = await axiosInstance.patch(`${ENDPOINTS.VENDORS.ME}/change-password`, passwordPayload);
      return response;
    } catch (error) {
      console.error("Failed to change vendor password:", error);
      throw error;
    }
  }
};
