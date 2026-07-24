const { body } = require('express-validator');

const createReviewValidator = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 1000 }),
  body('criteria.communication').optional().isInt({ min: 1, max: 5 }),
  body('criteria.quality').optional().isInt({ min: 1, max: 5 }),
  body('criteria.timeliness').optional().isInt({ min: 1, max: 5 }),
  body('criteria.professionalism').optional().isInt({ min: 1, max: 5 }),
];

module.exports = { createReviewValidator };
