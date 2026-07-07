const express = require('express');
const router = express.Router();
const { getOrCreateRoom, getMessages, uploadAttachment } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/room', protect, getOrCreateRoom);
router.get('/room/:roomId/messages', protect, getMessages);
router.post('/upload', protect, upload.single('file'), uploadAttachment);

module.exports = router;