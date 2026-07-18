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

const applyCouponToCart = async (clientId, code, frontendCartItems = []) => {
  let activeItems = [];
  let subTotal = 0;
  
  console.log("applyCouponToCart called with:", { clientId, code, frontendCartItemsLength: frontendCartItems.length });
  try {
    const cartData = await getCart(clientId);
    if (cartData.activeItems && cartData.activeItems.length > 0) {
      activeItems = cartData.activeItems;
      subTotal = cartData.subTotal;
      console.log("Using backend cart items:", activeItems.length);
    }
  } catch (error) {
    console.log("Error getting backend cart:", error);
  }

  if (activeItems.length === 0 && frontendCartItems.length > 0) {
    console.log("Mapping frontend cart items...");
    activeItems = frontendCartItems.map(item => {
      const days = Math.ceil(Math.abs(new Date(item.scheduledReturnDate) - new Date(item.rentalStartDate)) / (1000 * 60 * 60 * 24)) || 1;
      const price = item.product.rentalPrice || item.product.dailyCharge || 0;
      return {
        product: item.product,
        qty: item.qty,
        lineAmount: price * item.qty * days
      };
    });
    subTotal = activeItems.reduce((sum, item) => sum + item.lineAmount, 0);
  }

  console.log("Active items after fallback:", activeItems.length);

  if (activeItems.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }

  const uniqueVendorIds = [...new Set(activeItems.map(item => item.product.vendorId))];
  console.log("Unique vendor IDs in cart:", uniqueVendorIds);
  
  let appliedCoupon = null;
  let targetVendorId = null;

  for (const vId of uniqueVendorIds) {
    console.log(`Validating coupon ${code} for vendor ${vId}`);
    const coupon = await couponService.validateCoupon(code, vId).catch(e => {
      console.log(`Validation failed for ${vId}:`, e.message);
      return null;
    });
    if (coupon) {
      appliedCoupon = coupon;
      targetVendorId = vId;
      console.log("Coupon applied for vendor:", vId);
      break;
    }
  }

  if (!appliedCoupon) {
    throw new ApiError(400, "Invalid coupon code or not applicable to items in your cart");
  }

  // Calculate the subtotal only for the items that belong to the target vendor
  const vendorSubTotal = activeItems
    .filter(item => item.product.vendorId === targetVendorId)
    .reduce((sum, item) => sum + item.lineAmount, 0);

  let discount = 0;
  if (appliedCoupon.discountPercent !== null) {
    discount = vendorSubTotal * (Number(appliedCoupon.discountPercent) / 100);
  } else if (appliedCoupon.fixedAmount !== null) {
    discount = Number(appliedCoupon.fixedAmount);
  }

  // Cap discount to the vendor's subtotal
  discount = Math.min(discount, vendorSubTotal);
  const total = Math.max(0, subTotal - discount);

  return {
    success: true,
    discount,
    total,
    couponCode: appliedCoupon.code,
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
