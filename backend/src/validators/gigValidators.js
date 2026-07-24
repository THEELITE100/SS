const { body } = require('express-validator');

const createGigValidator = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 150 }),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 5000 }),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('skillsRequired').optional().isArray().withMessage('skillsRequired must be a list'),
  body('budgetType').optional().isIn(['fixed', 'hourly']),
  body('budgetMin').isFloat({ min: 0 }).withMessage('Budget minimum must be a positive number'),
  body('budgetMax')
    .isFloat({ min: 0 })
    .withMessage('Budget maximum must be a positive number')
    .custom((value, { req }) => {
      if (Number(value) < Number(req.body.budgetMin)) {
        throw new Error('Budget maximum must be greater than or equal to budget minimum');
      }
      return true;
    }),
  body('milestones').optional().isArray(),
  body('milestones.*.title').if(body('milestones').exists()).notEmpty().withMessage('Each milestone needs a title'),
  body('milestones.*.amount')
    .if(body('milestones').exists())
    .isFloat({ min: 0 })
    .withMessage('Each milestone needs a valid amount'),
];

const updateGigValidator = [
  body('title').optional().trim().isLength({ max: 150 }),
  body('description').optional().trim().isLength({ max: 5000 }),
  body('budgetMin').optional().isFloat({ min: 0 }),
  body('budgetMax').optional().isFloat({ min: 0 }),
];

module.exports = { createGigValidator, updateGigValidator };
