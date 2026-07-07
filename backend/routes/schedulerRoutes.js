const express = require('express');
const router = express.Router();
const {
  updateAvailability,
  getAvailableSlots,
  createBooking,
  getMyBookings,
  cancelBooking,
} = require('../controllers/schedulerController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/freelancer/:freelancerId/slots', getAvailableSlots);

router.use(protect);
router.put('/availability', authorize('freelancer'), updateAvailability);
router.post('/book', authorize('client'), createBooking);
router.get('/bookings', getMyBookings);
router.put('/bookings/:id/cancel', cancelBooking);

module.exports = router;