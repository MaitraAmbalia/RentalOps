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
  },

  createProduct: async (productData) => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.PRODUCTS.BASE, productData);
      return response.product || response;
    } catch (error) {
      console.error("Failed to create product:", error);
      throw error;
    }
  },

  updateProduct: async (id, productData) => {
    try {
      const response = await axiosInstance.patch(ENDPOINTS.PRODUCTS.GET_BY_ID(id), productData);
      return response.product || response;
    } catch (error) {
      console.error(`Failed to update product ${id}:`, error);
      throw error;
    }
  },

  deleteProduct: async (id) => {
    try {
      const response = await axiosInstance.delete(ENDPOINTS.PRODUCTS.GET_BY_ID(id));
      return response;
    } catch (error) {
      console.error(`Failed to delete product ${id}:`, error);
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
  }
};
