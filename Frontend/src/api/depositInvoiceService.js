import axiosInstance from './axiosInstance';

export const depositInvoiceService = {
  getDepositSummary: async (orderId) => {
    try {
      const response = await axiosInstance.get(`/orders/${orderId}/deposit-invoice`);
      return response.depositInvoice || response;
    } catch (error) {
      console.error(`Failed to fetch deposit invoice details for order ${orderId}:`, error);
      throw error;
    }
  },

  settleDeposit: async (orderId, settlementData) => {
    try {
      const response = await axiosInstance.patch(`/orders/${orderId}/deposit-invoice/settle`, settlementData);
      return response.depositInvoice || response;
    } catch (error) {
      console.error(`Failed to process deposit settlement for order ${orderId}:`, error);
      throw error;
    }
  }
};
