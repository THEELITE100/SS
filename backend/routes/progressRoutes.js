const express = require('express');
const router = express.Router();
const { getOrInitProgress, updateProgressLog } = require('../controllers/progressController');
const { sweepApproachingDeadlines } = require('../utils/deadlineChecker');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/gig/:gigId', getOrInitProgress);
router.put('/:id/log', updateProgressLog);

router.post('/cron/check-deadlines', authorize('admin'), async (req, res) => {
  await sweepApproachingDeadlines();
  res.status(200).json({ success: true, message: 'Deadline check sweep executed successfully.' });
});

module.exports = router;