const asyncHandler = require('../middleware/asyncHandler');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const notify = require('../utils/notify');
const sendResponse = require('../utils/apiResponse');

// @desc    List the logged-in user's conversations, newest activity first
// @route   GET /api/conversations
// @access  Private
const getMyConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({ participants: req.user._id })
    .populate('participants', 'name avatar')
    .populate('lastMessage')
    .populate('gig', 'title')
    .sort({ lastMessageAt: -1 });

  const shaped = conversations.map((conv) => {
    const myRead = conv.lastReadBy.find((r) => String(r.user) === String(req.user._id));
    const isUnread =
      conv.lastMessage &&
      String(conv.lastMessage.sender) !== String(req.user._id) &&
      (!myRead || new Date(conv.lastMessageAt) > new Date(myRead.at));

    return {
      _id: conv._id,
      gig: conv.gig,
      lastMessage: conv.lastMessage,
      lastMessageAt: conv.lastMessageAt,
      otherParticipants: conv.participants.filter((p) => String(p._id) !== String(req.user._id)),
      isUnread: Boolean(isUnread),
    };
  });

  sendResponse(res, 200, true, 'Conversations fetched', { conversations: shaped });
});

// @desc    Get (or create) a direct conversation with another user
// @route   POST /api/conversations
// @access  Private
const getOrCreateConversation = asyncHandler(async (req, res) => {
  const { participantId, gigId } = req.body;

  if (!participantId) {
    res.status(400);
    throw new Error('participantId is required');
  }
  if (String(participantId) === String(req.user._id)) {
    res.status(400);
    throw new Error("You can't start a conversation with yourself");
  }

  const otherUser = await User.findById(participantId);
  if (!otherUser) {
    res.status(404);
    throw new Error('User not found');
  }

  let conversation = await Conversation.findOne({
    participants: { $all: [req.user._id, participantId], $size: 2 },
    gig: gigId || null,
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [req.user._id, participantId],
      gig: gigId || null,
    });
  }

  await conversation.populate('participants', 'name avatar');

  sendResponse(res, 200, true, 'Conversation ready', { conversation });
});

// @desc    Get message history for a conversation (marks it read as a side effect)
// @route   GET /api/conversations/:id/messages
// @access  Private (participant only)
const getMessages = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.id);
  if (!conversation) {
    res.status(404);
    throw new Error('Conversation not found');
  }
  if (!conversation.participants.some((p) => String(p) === String(req.user._id))) {
    res.status(403);
    throw new Error('You are not part of this conversation');
  }

  const { page = 1, limit = 30 } = req.query;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 30));

  const messages = await Message.find({ conversation: conversation._id })
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)
    .populate('sender', 'name avatar');

  const myRead = conversation.lastReadBy.find((r) => String(r.user) === String(req.user._id));
  if (myRead) {
    myRead.at = new Date();
  } else {
    conversation.lastReadBy.push({ user: req.user._id, at: new Date() });
  }
  await conversation.save();

  // Fetched newest-first for pagination; reversed so the UI can render top-to-bottom.
  sendResponse(res, 200, true, 'Messages fetched', { messages: messages.reverse() });
});

// @desc    Send a message in a conversation
// @route   POST /api/conversations/:id/messages
// @access  Private (participant only)
const sendMessage = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const conversation = await Conversation.findById(req.params.id);

  if (!conversation) {
    res.status(404);
    throw new Error('Conversation not found');
  }
  if (!conversation.participants.some((p) => String(p) === String(req.user._id))) {
    res.status(403);
    throw new Error('You are not part of this conversation');
  }

  let message = await Message.create({
    conversation: conversation._id,
    sender: req.user._id,
    content,
    readBy: [{ user: req.user._id }],
  });

  conversation.lastMessage = message._id;
  conversation.lastMessageAt = message.createdAt;
  const myRead = conversation.lastReadBy.find((r) => String(r.user) === String(req.user._id));
  if (myRead) {
    myRead.at = message.createdAt;
  } else {
    conversation.lastReadBy.push({ user: req.user._id, at: message.createdAt });
  }
  await conversation.save();

  message = await message.populate('sender', 'name avatar');

  const io = req.app.get('io');
  io?.to(`conversation:${conversation._id}`).emit('message:new', message);

  const otherParticipants = conversation.participants.filter((p) => String(p) !== String(req.user._id));
  await Promise.all(
    otherParticipants.map((participantId) =>
      notify(io, {
        user: participantId,
        type: 'message_received',
        title: `New message from ${req.user.name}`,
        message: content.length > 100 ? `${content.slice(0, 100)}...` : content,
        link: `/dashboard/messages?conversation=${conversation._id}`,
      })
    )
  );

  sendResponse(res, 201, true, 'Message sent', { message });
});

module.exports = { getMyConversations, getOrCreateConversation, getMessages, sendMessage };
