import axiosInstance from './axiosInstance';
import { ENDPOINTS } from './endpoints';

export const productService = {
  getProducts: async (filters = {}) => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.PRODUCTS.GET_ALL, { params: filters });
      return response.products || response; // Adapt based on backend response shape ({success: true, products: []})
    } catch (error) {
      console.error("Failed to fetch products:", error);
      throw error;
    }
  },

  getProductById: async (id) => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.PRODUCTS.GET_BY_ID(id));
      return response.product || response;
    } catch (error) {
      console.error(`Failed to fetch product ${id}:`, error);
      throw error;
    }
  }
};
