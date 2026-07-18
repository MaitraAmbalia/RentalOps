import axiosInstance from './axiosInstance';
import { ENDPOINTS } from './endpoints';

export const settingsService = {
  getSettings: async () => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.SETTINGS.BASE);
      return response.settings || response;
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      throw error;
    }
  },

  updateSettings: async (settingsData) => {
    try {
      const response = await axiosInstance.patch(ENDPOINTS.SETTINGS.BASE, settingsData);
      return response.settings || response;
    } catch (error) {
      console.error("Failed to update settings:", error);
      throw error;
    }
  },

  getAttributes: async () => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.ATTRIBUTES.BASE);
      return response.attributes || response;
    } catch (error) {
      console.error("Failed to fetch attributes:", error);
      throw error;
    }
  },

  createAttribute: async (attrData) => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.ATTRIBUTES.BASE, attrData);
      return response.attribute || response;
    } catch (error) {
      console.error("Failed to create attribute:", error);
      throw error;
    }
  },

  updateAttribute: async (id, attrData) => {
    try {
      const response = await axiosInstance.patch(`${ENDPOINTS.ATTRIBUTES.BASE}/${id}`, attrData);
      return response.attribute || response;
    } catch (error) {
      console.error(`Failed to update attribute ${id}:`, error);
      throw error;
    }
  },

  deleteAttribute: async (id) => {
    try {
      const response = await axiosInstance.delete(`${ENDPOINTS.ATTRIBUTES.BASE}/${id}`);
      return response;
    } catch (error) {
      console.error(`Failed to delete attribute ${id}:`, error);
      throw error;
    }
  },

  addAttributeValue: async (id, valueData) => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.ATTRIBUTES.VALUE(id), valueData);
      return response.value || response;
    } catch (error) {
      console.error(`Failed to add attribute value for ${id}:`, error);
      throw error;
    }
  },

  deleteAttributeValue: async (id, valueId) => {
    try {
      const response = await axiosInstance.delete(ENDPOINTS.ATTRIBUTES.VALUE_DELETE(id, valueId));
      return response;
    } catch (error) {
      console.error(`Failed to delete attribute value ${valueId} for ${id}:`, error);
      throw error;
    }
  },

  getCategories: async () => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.CATEGORIES.BASE);
      return response.categories || response;
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      throw error;
    }
  },

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
  }
};
