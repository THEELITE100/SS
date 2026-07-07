const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const ChatRoom = require('../models/ChatRoom');

let ioInstance = null;

const initSocket = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  ioInstance = io;

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      if (!token) return next(new Error('Authentication error: No token provided'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = await User.findById(decoded.id).select('-password');
      if (!socket.user) return next(new Error('Authentication error: User not found'));
      
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name} (${socket.user._id})`);

    const personalRoom = `user_${socket.user._id.toString()}`;
    socket.join(personalRoom);

    socket.on('join_room', async ({ roomId }) => {
      socket.join(roomId);
    });

    socket.on('send_message', async (data) => {
      const { roomId, text, attachment } = data;
      try {
        const newMessage = await Message.create({
          chatRoom: roomId,
          sender: socket.user._id,
          text: text || '',
          attachment: attachment || null,
          readBy: [socket.user._id],
        });
        await newMessage.populate('sender', 'name email');
        await ChatRoom.findByIdAndUpdate(roomId, { lastMessage: newMessage._id });
        io.to(roomId).emit('receive_message', newMessage);
      } catch (error) {
        socket.emit('socket_error', { message: 'Failed to send message' });
      }
    });

    socket.on('typing', ({ roomId }) => {
      socket.to(roomId).emit('user_typing', { userId: socket.user._id, name: socket.user.name });
    });

    socket.on('stop_typing', ({ roomId }) => {
      socket.to(roomId).emit('user_stopped_typing', { userId: socket.user._id });
    });

    socket.on('mark_as_read', async ({ roomId }) => {
      try {
        await Message.updateMany(
          { chatRoom: roomId, readBy: { $ne: socket.user._id } },
          { $addToSet: { readBy: socket.user._id } }
        );
        socket.to(roomId).emit('messages_read', { userId: socket.user._id, roomId });
      } catch (error) {}
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user._id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!ioInstance) {
    throw new Error('Socket.IO is not initialized!');
  }
  return ioInstance;
};

module.exports = { initSocket, getIO };