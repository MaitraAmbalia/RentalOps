import axiosInstance from './axiosInstance';

const STORAGE_KEY = 'vendor_delivery_partners';

const getLocalPartners = () => {
  const local = localStorage.getItem(STORAGE_KEY);
  if (!local) {
    // Seed some initial partners
    const seed = [
      { id: 'dp_1', firstName: 'Jack', lastName: 'Ryan', phone: '9876543210', currentStatus: 'AVAILABLE', companyName: 'FedEx Express' },
      { id: 'dp_2', firstName: 'Sarah', lastName: 'Connor', phone: '9876543211', currentStatus: 'OUT_ON_DELIVERY', companyName: 'DHL Hub' },
      { id: 'dp_3', firstName: 'Bruce', lastName: 'Wayne', phone: '9876543212', currentStatus: 'ABSENT', companyName: 'Wayne Logistics' }
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
  return JSON.parse(local);
};

export const deliveryPartnerService = {
  getDeliveryPartners: async () => {
    try {
      const response = await axiosInstance.get('/delivery-partners');
      return response.deliveryPartners || response;
    } catch (error) {
      console.warn("Delivery partner endpoint not active on backend. Falling back to localStorage mock.");
      return getLocalPartners();
    }
  },

  createDeliveryPartner: async (partnerData) => {
    try {
      const response = await axiosInstance.post('/delivery-partners', partnerData);
      return response.deliveryPartner || response;
    } catch (error) {
      console.warn("Delivery partner endpoint not active on backend. Saving to localStorage mock.");
      const partners = getLocalPartners();
      const newPartner = {
        id: `dp_${Math.random().toString(36).substr(2, 9)}`,
        currentStatus: 'AVAILABLE',
        ...partnerData
      };
      partners.push(newPartner);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(partners));
      return newPartner;
    }
  },

  updateDeliveryPartnerStatus: async (id, status) => {
    try {
      const response = await axiosInstance.patch(`/delivery-partners/${id}/status`, { status });
      return response.deliveryPartner || response;
    } catch (error) {
      console.warn("Delivery partner status endpoint not active on backend. Updating localStorage mock.");
      const partners = getLocalPartners();
      const updated = partners.map(p => p.id === id ? { ...p, currentStatus: status } : p);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated.find(p => p.id === id);
    }
  }
};
