const cartService = require("../services/cart.service");

// Cart Handlers
exports.getCart = async (req, res, next) => {
  try {
    const cartData = await cartService.getCart(req.user.id);
    res.status(200).json({ success: true, ...cartData });
  } catch (error) {
    next(error);
  }
};

exports.addItem = async (req, res, next) => {
  try {
    const item = await cartService.addItemToCart(req.user.id, req.body);
    res.status(201).json({ success: true, item });
  } catch (error) {
    next(error);
  }
};

exports.updateItem = async (req, res, next) => {
  try {
    const item = await cartService.updateCartItem(req.params.id, req.user.id, req.body);
    res.status(200).json({ success: true, item });
  } catch (error) {
    next(error);
  }
};

exports.saveForLater = async (req, res, next) => {
  try {
    const item = await cartService.toggleSaveForLater(req.params.id, req.user.id, req.body.savedForLater);
    res.status(200).json({ success: true, item });
  } catch (error) {
    next(error);
  }
};

exports.removeItem = async (req, res, next) => {
  try {
    const result = await cartService.removeCartItem(req.params.id, req.user.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.applyCoupon = async (req, res, next) => {
  try {
    const result = await cartService.applyCouponToCart(req.user.id, req.body.code, req.body.cartItems);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// Wishlist Handlers
exports.getWishlist = async (req, res, next) => {
  try {
    const items = await cartService.getWishlist(req.user.id);
    res.status(200).json({ success: true, items });
  } catch (error) {
    next(error);
  }
};

exports.addToWishlist = async (req, res, next) => {
  try {
    const item = await cartService.addToWishlist(req.user.id, req.body.productId);
    res.status(201).json({ success: true, item });
  } catch (error) {
    next(error);
  }
};

exports.removeFromWishlist = async (req, res, next) => {
  try {
    const result = await cartService.removeFromWishlist(req.user.id, req.params.productId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
