export const API_BASE_URL = 'http://localhost:5001/api'; // Adjust port if backend runs elsewhere

export const ENDPOINTS = {
  AUTH: {
    CLIENT_LOGIN: '/auth/client/login',
    CLIENT_SIGNUP: '/auth/client/register',
    VENDOR_LOGIN: '/auth/vendor/login',
    VENDOR_SIGNUP: '/auth/vendor/register',
    PARTNER_LOGIN: '/auth/delivery/login',
    ME: '/auth/me',
  },
  PRODUCTS: {
    BASE: '/products',
    GET_ALL: '/products',
    GET_BY_ID: (id) => `/products/${id}`,
  },
  ORDERS: {
    BASE: '/orders',
    GET_BY_ID: (id) => `/orders/${id}`,
    UPDATE_STATUS: (id) => `/orders/${id}/status`,
  },
  QUOTATIONS: {
    BASE: '/quotations',
    GET_BY_ID: (id) => `/quotations/${id}`,
    UPDATE_STATUS: (id) => `/quotations/${id}/status`,
  },
  QUOTATION_TEMPLATES: {
    BASE: '/quotation-templates',
    GET_BY_ID: (id) => `/quotation-templates/${id}`,
  },
  SETTINGS: {
    BASE: '/settings',
  },
  VENDORS: {
    BASE: '/vendors',
    ME: '/vendors/me',
  },
  ATTRIBUTES: {
    BASE: '/attributes',
    VALUE: (id) => `/attributes/${id}/values`,
    VALUE_DELETE: (id, valueId) => `/attributes/${id}/values/${valueId}`,
  },
  CATEGORIES: {
    BASE: '/categories',
  },
  CART: {
    APPLY_COUPON: '/cart/apply-coupon',
  },
  PAYMENTS: {
    CREATE_RAZORPAY_ORDER: (id) => `/orders/${id}/payments/razorpay-order`,
    VERIFY_PAYMENT: '/payments/verify',
  }
};

