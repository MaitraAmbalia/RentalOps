import axiosInstance from './axiosInstance';
import { ENDPOINTS } from './endpoints';

export const quotationService = {
  getQuotations: async (filters = {}) => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.QUOTATIONS.BASE, { params: filters });
      return response.quotations || response;
    } catch (error) {
      console.error("Failed to fetch quotations:", error);
      throw error;
    }
  },

  getQuotationById: async (id) => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.QUOTATIONS.GET_BY_ID(id));
      return response.quotation || response;
    } catch (error) {
      console.error(`Failed to fetch quotation ${id}:`, error);
      throw error;
    }
  },

  createQuotation: async (quotationData) => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.QUOTATIONS.BASE, quotationData);
      return response.quotation || response;
    } catch (error) {
      console.error("Failed to create quotation:", error);
      throw error;
    }
  },

  updateQuotation: async (id, quotationData) => {
    try {
      const response = await axiosInstance.put(`${ENDPOINTS.QUOTATIONS.BASE}/${id}`, quotationData);
      return response.quotation || response;
    } catch (error) {
      console.error(`Failed to update quotation ${id}:`, error);
      throw error;
    }
  },

  updateQuotationStatus: async (id, status) => {
    try {
      const response = await axiosInstance.patch(ENDPOINTS.QUOTATIONS.UPDATE_STATUS(id), { status });
      return response.quotation || response;
    } catch (error) {
      console.error(`Failed to update quotation status for ${id}:`, error);
      throw error;
    }
  },

  sendQuotationEmail: async (id) => {
    try {
      const response = await axiosInstance.post(`${ENDPOINTS.QUOTATIONS.BASE}/${id}/send-email`);
      return response;
    } catch (error) {
      console.error(`Failed to send quotation email for ${id}:`, error);
      throw error;
    }
  },

  acceptQuotation: async (id, signatureData) => {
    try {
      const response = await axiosInstance.post(`${ENDPOINTS.QUOTATIONS.BASE}/${id}/accept`, { signatureData });
      return response;
    } catch (error) {
      console.error(`Failed to accept quotation ${id}:`, error);
      throw error;
    }
  },

  downloadQuotationPDF: async (id) => {
    try {
      const response = await axiosInstance.get(`${ENDPOINTS.QUOTATIONS.BASE}/${id}/pdf`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `quotation-${id.slice(0, 8)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(`Failed to download quotation PDF for ${id}:`, error);
      throw error;
    }
  },

  // Templates
  getQuotationTemplates: async () => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.QUOTATION_TEMPLATES.BASE);
      return response.templates || response;
    } catch (error) {
      console.error("Failed to fetch quotation templates:", error);
      throw error;
    }
  },

  createQuotationTemplate: async (templateData) => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.QUOTATION_TEMPLATES.BASE, templateData);
      return response.template || response;
    } catch (error) {
      console.error("Failed to create quotation template:", error);
      throw error;
    }
  },

  deleteQuotationTemplate: async (id) => {
    try {
      const response = await axiosInstance.delete(`${ENDPOINTS.QUOTATION_TEMPLATES.BASE}/${id}`);
      return response;
    } catch (error) {
      console.error(`Failed to delete quotation template ${id}:`, error);
      throw error;
    }
  }
};
