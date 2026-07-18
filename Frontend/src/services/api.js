const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const mockProducts = [
  {
    id: "prod_1",
    name: "Heavy Duty Excavator",
    productDefinition: "Industrial digging equipment with high capacity bucket.",
    currentStatus: "AVAILABLE",
    basePrice: 500,
    dailyCharge: 150,
    overdueCharge: 300,
    category: "Heavy Machinery",
    images: ["https://images.unsplash.com/photo-1579549927702-861f2f8ebf90?w=500&q=80"]
  },
  {
    id: "prod_2",
    name: "Professional DSLR Camera Kit",
    productDefinition: "4K video capable DSLR with 24-70mm f/2.8 lens.",
    currentStatus: "AVAILABLE",
    basePrice: 100,
    dailyCharge: 45,
    overdueCharge: 90,
    category: "Electronics",
    images: ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&q=80"]
  },
  {
    id: "prod_3",
    name: "Electric Mountain Bike",
    productDefinition: "High-performance e-bike for off-road trails.",
    currentStatus: "AVAILABLE",
    basePrice: 50,
    dailyCharge: 25,
    overdueCharge: 50,
    category: "Vehicles",
    images: ["https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=500&q=80"]
  },
  {
    id: "prod_4",
    name: "Portable Generator 5000W",
    productDefinition: "Gas-powered portable generator for remote work sites.",
    currentStatus: "AVAILABLE",
    basePrice: 80,
    dailyCharge: 35,
    overdueCharge: 70,
    category: "Tools",
    images: ["https://images.unsplash.com/photo-1590847721838-89c565d75cb9?w=500&q=80"]
  }
];

let mockOrders = [];

export const api = {
  // Auth
  loginClient: async (email, password) => {
    await delay(500);
    if(email === 'test@example.com' && password === 'password') {
      return { token: 'mock_jwt_token', user: { id: 1, name: 'John Doe', email } };
    }
    throw new Error('Invalid credentials');
  },
  
  signupClient: async (userData) => {
    await delay(500);
    return { token: 'mock_jwt_token', user: { id: 2, ...userData } };
  },

  loginVendor: async (email, password) => {
    await delay(500);
    return { token: 'mock_vendor_token', user: { id: 3, role: 'VENDOR' } };
  },

  loginDeliveryPartner: async (phone, password) => {
    await delay(500);
    return { token: 'mock_delivery_token', user: { id: 4, role: 'DELIVERY' } };
  },

  // Products
  getProducts: async (filters = {}) => {
    await delay(500);
    let result = [...mockProducts];
    
    if (filters.category && filters.category !== 'All') {
      result = result.filter(p => p.category === filters.category);
    }
    
    if (filters.maxPrice) {
      result = result.filter(p => p.dailyCharge <= filters.maxPrice);
    }
    
    return result;
  },

  getProductById: async (id) => {
    await delay(500);
    const product = mockProducts.find(p => p.id === id);
    if (!product) throw new Error('Product not found');
    return product;
  },

  // Orders
  placeOrder: async (orderData) => {
    await delay(500);
    const newOrder = {
      id: `ord_${Math.random().toString(36).substr(2, 9)}`,
      status: 'Processing',
      deliveryStatus: 'Pending',
      createdAt: new Date().toISOString(),
      ...orderData
    };
    mockOrders.push(newOrder);
    return newOrder;
  },

  getUserOrders: async (userId) => {
    await delay(500);
    // Returning all mock orders for demo purposes, split dynamically in UI
    // I'll add a few dummy past/active orders if array is empty
    if(mockOrders.length === 0) {
      return [
        {
          id: 'ord_123',
          product: mockProducts[0],
          startDate: new Date(Date.now() - 86400000 * 5).toISOString(),
          endDate: new Date(Date.now() + 86400000 * 2).toISOString(),
          totalPrice: 1550,
          status: 'Active',
          deliveryStatus: 'Out on Delivery'
        },
        {
          id: 'ord_456',
          product: mockProducts[1],
          startDate: new Date(Date.now() - 86400000 * 15).toISOString(),
          endDate: new Date(Date.now() - 86400000 * 10).toISOString(),
          totalPrice: 325,
          status: 'Completed',
          deliveryStatus: 'Delivered'
        }
      ]
    }
    return mockOrders;
  }
};
