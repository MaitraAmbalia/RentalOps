const service = require("../services/notification.service");

exports.getNotifications = async (req, res, next) => {
  try {
    const result = await service.getNotifications(req.user.id, req.user.type);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await service.markAsRead(req.params.id, req.user.id);
    res.status(200).json({ success: true, notification });
  } catch (error) {
    next(error);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    await service.markAllAsRead(req.user.id, req.user.type);
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};
