const { body } = require('express-validator');

const createDisputeValidator = [
  body('reason').trim().notEmpty().withMessage('A reason is required').isLength({ max: 200 }),
  body('description').trim().notEmpty().withMessage('A description is required').isLength({ max: 3000 }),
  body('milestoneId').optional({ values: 'falsy' }).isMongoId().withMessage('Invalid milestone id'),
];

const addDisputeMessageValidator = [
  body('message').trim().notEmpty().withMessage('Message cannot be empty').isLength({ max: 2000 }),
];

const resolveDisputeValidator = [
  body('resolution').trim().notEmpty().withMessage('A resolution note is required').isLength({ max: 2000 }),
  body('outcome').isIn(['pay_freelancer', 'refund_client', 'no_action']).withMessage('Invalid outcome'),
];

module.exports = { createDisputeValidator, addDisputeMessageValidator, resolveDisputeValidator };
