const { body } = require('express-validator');

const updateFreelancerProfileValidator = [
  body('headline').optional().trim().isLength({ max: 150 }),
  body('bio').optional().trim().isLength({ max: 2000 }),
  body('skills').optional().isArray().withMessage('skills must be a list'),
  body('skills.*.name').if(body('skills').exists()).notEmpty().withMessage('Each skill needs a name'),
  body('portfolio').optional().isArray(),
  body('certifications').optional().isArray(),
  body('experience').optional().isArray(),
  body('availability.status').optional().isIn(['available', 'busy', 'unavailable']),
  body('pricing.hourlyRate').optional().isFloat({ min: 0 }),
];

const updateClientProfileValidator = [
  body('companyName').optional().trim().isLength({ max: 150 }),
  body('about').optional().trim().isLength({ max: 2000 }),
  body('industry').optional().trim().isLength({ max: 100 }),
];

module.exports = { updateFreelancerProfileValidator, updateClientProfileValidator };
