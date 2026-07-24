const express = require('express');
const { getMyConversations, getOrCreateConversation, getMessages, sendMessage } = require('../controllers/conversationController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validate');
const { sendMessageValidator, getOrCreateConversationValidator } = require('../validators/conversationValidators');

const router = express.Router();

router.get('/', protect, getMyConversations);
router.post('/', protect, getOrCreateConversationValidator, validateRequest, getOrCreateConversation);
router.get('/:id/messages', protect, getMessages);
router.post('/:id/messages', protect, sendMessageValidator, validateRequest, sendMessage);

module.exports = router;
