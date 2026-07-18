const { prisma } = require("../config/db");

const findByClientId = async (clientId) => {
  return prisma.wishlistItem.findMany({
    where: { clientId },
    include: {
      product: {
        include: {
          category: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

const findItem = async (clientId, productId) => {
  return prisma.wishlistItem.findUnique({
    where: {
      clientId_productId: {
        clientId,
        productId,
      },
    },
  });
};

const addItem = async (clientId, productId) => {
  return prisma.wishlistItem.create({
    data: {
      clientId,
      productId,
    },
    include: {
      product: true,
    },
  });
};

const deleteItem = async (clientId, productId) => {
  return prisma.wishlistItem.delete({
    where: {
      clientId_productId: {
        clientId,
        productId,
      },
    },
  });
};

module.exports = {
  findByClientId,
  findItem,
  addItem,
  deleteItem,
};
