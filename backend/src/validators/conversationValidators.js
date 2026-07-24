const { body } = require('express-validator');

const sendMessageValidator = [
  body('content').trim().notEmpty().withMessage('Message content is required').isLength({ max: 5000 }),
];

const getOrCreateConversationValidator = [body('participantId').notEmpty().withMessage('participantId is required')];

module.exports = { sendMessageValidator, getOrCreateConversationValidator };
