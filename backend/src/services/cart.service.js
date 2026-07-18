const cartRepository = require("../repositories/cart.repository");
const wishlistRepository = require("../repositories/wishlist.repository");
const couponService = require("./coupon.service");
const { resolveLinePrice } = require("../utils/priceResolver");
const ApiError = require("../utils/apiError");

const getCart = async (clientId) => {
  const cart = await cartRepository.findOrCreateByClientId(clientId);
  
  const activeItems = [];
  const savedItems = [];
  let subTotal = 0;
  const deliveryCharges = 0; // standard zero charge or configurable later

  for (const item of cart.items) {
    const pricing = await resolveLinePrice({
      productId: item.productId,
      productVariantId: item.productVariantId,
      quantity: item.quantity,
      rentalStart: item.rentalStart,
      rentalEnd: item.rentalEnd,
    });

    const itemWithPrice = {
      ...item,
      basePrice: pricing.basePrice,
      resolvedPrice: pricing.resolvedPrice,
      durationUnits: pricing.durationUnits,
      lineAmount: pricing.lineAmount,
    };

    if (item.savedForLater) {
      savedItems.push(itemWithPrice);
    } else {
      activeItems.push(itemWithPrice);
      subTotal += pricing.lineAmount;
    }
  }

  const total = subTotal + deliveryCharges;

  return {
    activeItems,
    savedItems,
    subTotal,
    deliveryCharges,
    total,
  };
};

const addItemToCart = async (clientId, data) => {
  const cart = await cartRepository.findOrCreateByClientId(clientId);
  
  // Check if item already exists in cart with same product and variant
  let existingItem = await cartRepository.findItemInCart(cart.id, data.productId, data.productVariantId);
  
  if (existingItem) {
    // Update quantity
    const newQty = existingItem.quantity + (data.quantity || 1);
    const updated = await cartRepository.updateItem(existingItem.id, { quantity: newQty });
    return updated;
  }

  return cartRepository.addItem(cart.id, data);
};

const updateCartItem = async (itemId, clientId, data) => {
  const item = await cartRepository.findItemById(itemId);
  if (!item) {
    throw new ApiError(404, "Cart item not found");
  }
  if (item.cart.clientId !== clientId) {
    throw new ApiError(403, "Forbidden");
  }
  return cartRepository.updateItem(itemId, data);
};

const toggleSaveForLater = async (itemId, clientId, savedForLater) => {
  const item = await cartRepository.findItemById(itemId);
  if (!item) {
    throw new ApiError(404, "Cart item not found");
  }
  if (item.cart.clientId !== clientId) {
    throw new ApiError(403, "Forbidden");
  }
  return cartRepository.updateItem(itemId, { savedForLater });
};

const removeCartItem = async (itemId, clientId) => {
  const item = await cartRepository.findItemById(itemId);
  if (!item) {
    throw new ApiError(404, "Cart item not found");
  }
  if (item.cart.clientId !== clientId) {
    throw new ApiError(403, "Forbidden");
  }
  await cartRepository.deleteItem(itemId);
  return { success: true };
};

const applyCouponToCart = async (clientId, code) => {
  const cartData = await getCart(clientId);
  if (cartData.activeItems.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }

  // Use the vendor ID from the first active product in the cart
  const firstItem = cartData.activeItems[0];
  const vendorId = firstItem.product.vendorId;

  // Validate the coupon
  const coupon = await couponService.validateCoupon(code, vendorId);

  let discount = 0;
  if (coupon.discountPercent !== null) {
    discount = cartData.subTotal * (Number(coupon.discountPercent) / 100);
  } else if (coupon.fixedAmount !== null) {
    discount = Number(coupon.fixedAmount);
  }

  // Cap discount to subTotal
  discount = Math.min(discount, cartData.subTotal);
  const total = Math.max(0, cartData.subTotal - discount + cartData.deliveryCharges);

  return {
    success: true,
    discount,
    total,
    couponCode: coupon.code,
  };
};

// Wishlist methods
const getWishlist = async (clientId) => {
  return wishlistRepository.findByClientId(clientId);
};

const addToWishlist = async (clientId, productId) => {
  const existing = await wishlistRepository.findItem(clientId, productId);
  if (existing) {
    return existing;
  }
  return wishlistRepository.addItem(clientId, productId);
};

const removeFromWishlist = async (clientId, productId) => {
  await wishlistRepository.deleteItem(clientId, productId);
  return { success: true };
};

module.exports = {
  getCart,
  addItemToCart,
  updateCartItem,
  toggleSaveForLater,
  removeCartItem,
  applyCouponToCart,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
