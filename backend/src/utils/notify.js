const Notification = require('../models/Notification');

/**
 * Creates a Notification and, if a Socket.IO server is attached to the app,
 * pushes it to the recipient in real time. `io` is looked up via
 * req.app.get('io') by callers so this file has no direct dependency on
 * server.js — that keeps app.js requireable and testable on its own.
 */
const notify = async (io, { user, type, title, message, link, meta }) => {
  const notification = await Notification.create({ user, type, title, message, link, meta });

  io?.to(`user:${user}`).emit('notification:new', notification);

  return notification;
};

module.exports = notify;
