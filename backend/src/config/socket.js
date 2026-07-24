const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Conversation = require('../models/Conversation');

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error('Not authorized, no token provided'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) return next(new Error('User no longer exists'));
      if (user.isSuspended) return next(new Error('Account suspended'));

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Not authorized, token invalid or expired'));
    }
  });

  io.on('connection', (socket) => {
    const userId = String(socket.user._id);

    // Personal room: how we push notifications and "new message" pings to
    // this specific user regardless of which page they're on.
    socket.join(`user:${userId}`);

    socket.on('conversation:join', async (conversationId) => {
      try {
        const conversation = await Conversation.findById(conversationId);
        const isParticipant = conversation?.participants.some((p) => String(p) === userId);
        if (isParticipant) {
          socket.join(`conversation:${conversationId}`);
        }
      } catch (error) {
        // Invalid id or lookup failure — just don't join the room
      }
    });

    socket.on('conversation:leave', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on('typing:start', ({ conversationId }) => {
      if (!conversationId) return;
      socket.to(`conversation:${conversationId}`).emit('typing:update', {
        conversationId,
        userId,
        isTyping: true,
      });
    });

    socket.on('typing:stop', ({ conversationId }) => {
      if (!conversationId) return;
      socket.to(`conversation:${conversationId}`).emit('typing:update', {
        conversationId,
        userId,
        isTyping: false,
      });
    });
  });

  return io;
};

module.exports = initSocket;
