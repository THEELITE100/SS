const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');

const getOrCreateRoom = async (req, res) => {
  const { gigId, targetUserId } = req.body;

  try {
    let room = await ChatRoom.findOne({ gig: gigId });

    if (!room) {
      room = await ChatRoom.create({
        gig: gigId,
        participants: [req.user._id, targetUserId],
      });
    }

    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chatRoom: req.params.roomId })
      .populate('sender', 'name email')
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const uploadAttachment = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  res.status(200).json({
    fileName: req.file.originalname,
    fileUrl: req.file.path,
    fileType: req.file.mimetype,
  });
};

module.exports = { getOrCreateRoom, getMessages, uploadAttachment };