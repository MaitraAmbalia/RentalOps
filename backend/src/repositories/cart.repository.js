const { prisma } = require("../config/db");

const findOrCreateByClientId = async (clientId) => {
  let cart = await prisma.cart.findUnique({
    where: { clientId },
    include: {
      items: {
        include: {
          product: true,
          productVariant: {
            include: {
              attributeValues: {
                include: { attributeValue: true },
              },
            },
          },
        },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { clientId },
      include: {
        items: {
          include: {
            product: true,
            productVariant: {
              include: {
                attributeValues: {
                  include: { attributeValue: true },
                },
              },
            },
          },
        },
      },
    });
  }

  return cart;
};

const findItemById = async (itemId) => {
  return prisma.cartItem.findUnique({
    where: { id: itemId },
    include: {
      cart: true,
      product: true,
    },
  });
};

const findItemInCart = async (cartId, productId, productVariantId = null) => {
  return prisma.cartItem.findFirst({
    where: {
      cartId,
      productId,
      productVariantId,
    },
  });
};

const addItem = async (cartId, data) => {
  return prisma.cartItem.create({
    data: {
      cartId,
      productId: data.productId,
      productVariantId: data.productVariantId || null,
      quantity: data.quantity || 1,
      rentalStart: new Date(data.rentalStart),
      rentalEnd: new Date(data.rentalEnd),
    },
    include: {
      product: true,
    },
  });
};

const updateItem = async (itemId, data) => {
  return prisma.cartItem.update({
    where: { id: itemId },
    data: {
      quantity: data.quantity !== undefined ? data.quantity : undefined,
      savedForLater: data.savedForLater !== undefined ? data.savedForLater : undefined,
      rentalStart: data.rentalStart ? new Date(data.rentalStart) : undefined,
      rentalEnd: data.rentalEnd ? new Date(data.rentalEnd) : undefined,
    },
    include: {
      product: true,
    },
  });
};

const deleteItem = async (itemId) => {
  return prisma.cartItem.delete({
    where: { id: itemId },
  });
};

const clearCartItems = async (cartId) => {
  return prisma.cartItem.deleteMany({
    where: { cartId },
  });
};

module.exports = {
  findOrCreateByClientId,
  findItemById,
  findItemInCart,
  addItem,
  updateItem,
  deleteItem,
  clearCartItems,
};
