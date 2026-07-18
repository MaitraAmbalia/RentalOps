import axiosInstance from './axiosInstance';

export const clientService = {
  getProfile: async () => {
    try {
      const response = await axiosInstance.get('/clients/me');
      return response.client || response;
    } catch (error) {
      console.error("Failed to fetch client profile:", error);
      throw error;
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await axiosInstance.patch('/clients/me', profileData);
      return response.client || response;
    } catch (error) {
      console.error("Failed to update client profile:", error);
      throw error;
    }
  },

  changePassword: async (passwordPayload) => {
    try {
      const response = await axiosInstance.patch('/clients/me/change-password', passwordPayload);
      return response;
    } catch (error) {
      console.error("Failed to update client password:", error);
      throw error;
    }
  }
};
