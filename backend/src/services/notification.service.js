const { prisma } = require("../config/db");
const ApiError = require("../utils/apiError");
const { emitToUser } = require("../config/socket");

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
  const notification = await prisma.notification.create({
    data: {
      recipientId,
      recipientType,
      type,
      title,
      message,
    },
  });

  try {
    emitToUser(recipientId, "notification", notification);
  } catch (err) {
    // Fail silently without interrupting database operation
  }

  return notification;
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
};
