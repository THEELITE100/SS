const Notification = require('../models/Notification');
const { getIO } = require('../config/socket');

const sendNotification = async ({ recipient, sender = null, type, title, message, link = null, metadata = {} }) => {
  try {
    const notification = await Notification.create({
      recipient,
      sender,
      type,
      title,
      message,
      link,
      metadata,
    });

    if (sender) {
      await notification.populate('sender', 'name email');
    }

    try {
      const io = getIO();
      io.to(`user_${recipient.toString()}`).emit('new_notification', notification);
    } catch (socketErr) {
      console.warn('Socket broadcast failed (Server initializing or offline):', socketErr.message);
    }

    return notification;
  } catch (error) {
    console.error('Notification Service Error:', error.message);
  }
};

module.exports = { sendNotification };