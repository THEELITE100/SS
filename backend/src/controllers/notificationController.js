const asyncHandler = require('../middleware/asyncHandler');
const Notification = require('../models/Notification');
const sendResponse = require('../utils/apiResponse');

// @desc    List the logged-in user's notifications
// @route   GET /api/notifications
// @access  Private
const getMyNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));

  const [notifications, unreadCount, total] = await Promise.all([
    Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Notification.countDocuments({ user: req.user._id, isRead: false }),
    Notification.countDocuments({ user: req.user._id }),
  ]);

  sendResponse(res, 200, true, 'Notifications fetched', {
    notifications,
    unreadCount,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
});

// @desc    Mark one notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({ _id: req.params.id, user: req.user._id });
  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  notification.isRead = true;
  await notification.save();

  sendResponse(res, 200, true, 'Notification marked as read', { notification });
});

// @desc    Mark every notification as read
// @route   PATCH /api/notifications/read-all
// @access  Private
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { $set: { isRead: true } });
  sendResponse(res, 200, true, 'All notifications marked as read');
});

module.exports = { getMyNotifications, markAsRead, markAllAsRead };
