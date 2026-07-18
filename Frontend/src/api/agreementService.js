import axiosInstance from './axiosInstance';

export const agreementService = {
  getAgreement: async (orderId) => {
    const response = await axiosInstance.get(`/orders/${orderId}/agreement`);
    return response.agreement;
  },

  signAgreement: async (orderId, signatureData) => {
    const response = await axiosInstance.post(`/orders/${orderId}/sign-agreement`, {
      signatureData,
    });
    return response.order;
  },
};
