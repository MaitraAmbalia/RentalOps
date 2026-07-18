export const API_BASE_URL = 'http://localhost:3000/api'; // Adjust port if backend runs elsewhere

export const ENDPOINTS = {
  AUTH: {
    CLIENT_LOGIN: '/auth/client/login',
    CLIENT_SIGNUP: '/auth/client/register',
    VENDOR_LOGIN: '/auth/vendor/login',
    PARTNER_LOGIN: '/auth/delivery/login',
  },
  PRODUCTS: {
    BASE: '/products',
    GET_ALL: '/products', // Depending on backend setup, this might be a generic public endpoint or vendor-scoped
    GET_BY_ID: (id) => `/products/${id}`,
  },
  ORDERS: {
    BASE: '/orders',
  }
};
