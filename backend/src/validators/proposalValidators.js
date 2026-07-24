const { body } = require('express-validator');

const createProposalValidator = [
  body('coverLetter').trim().notEmpty().withMessage('A cover letter is required').isLength({ max: 3000 }),
  body('bidAmount').isFloat({ min: 0 }).withMessage('Bid amount must be a positive number'),
  body('estimatedDays').isInt({ min: 1 }).withMessage('Estimated days must be at least 1'),
];

const negotiateProposalValidator = [
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('message').optional().trim().isLength({ max: 500 }),
];

module.exports = { createProposalValidator, negotiateProposalValidator };
