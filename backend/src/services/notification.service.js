const { prisma } = require("../config/db");
const ApiError = require("../utils/apiError");

const getNotifications = async (recipientId, recipientType) => {
  const [notifications, unreadCount] = await prisma.$transaction([
    prisma.notification.findMany({
      where: { recipientId, recipientType },
      orderBy: { createdAt: "desc" },
    }),
    prisma.notification.count({
      where: { recipientId, recipientType, isRead: false },
    }),
  ]);

  return { notifications, unreadCount };
};

const markAsRead = async (id, recipientId) => {
  const notification = await prisma.notification.findUnique({
    where: { id },
  });

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  if (notification.recipientId !== recipientId) {
    throw new ApiError(403, "You do not have access to this notification");
  }

  return await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });
};

const markAllAsRead = async (recipientId, recipientType) => {
  await prisma.notification.updateMany({
    where: { recipientId, recipientType, isRead: false },
    data: { isRead: true },
  });
  return { success: true };
};

const createNotification = async (recipientId, recipientType, type, title, message) => {
  return await prisma.notification.create({
    data: {
      recipientId,
      recipientType,
      type,
      title,
      message,
    },
  });
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
};
