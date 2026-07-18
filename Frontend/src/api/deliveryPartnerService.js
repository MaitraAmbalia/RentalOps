import axiosInstance from './axiosInstance';

export const deliveryPartnerService = {
  getDeliveryPartners: async () => {
    const response = await axiosInstance.get('/delivery-partners');
    return response.deliveryPartners || response;
  },

  createDeliveryPartner: async (partnerData) => {
    const response = await axiosInstance.post('/delivery-partners', partnerData);
    return response.deliveryPartner || response;
  },

  updateDeliveryPartnerStatus: async (id, status) => {
    const response = await axiosInstance.patch(`/delivery-partners/${id}/status`, { status });
    return response.deliveryPartner || response;
  }
};
