const Availability = require('../models/Availability');
const Booking = require('../models/Booking');
const { sendNotification } = require('../services/notificationService');

const updateAvailability = async (req, res) => {
  const { weeklySchedule, blockedDates, slotDurationMinutes } = req.body;

  try {
    let availability = await Availability.findOne({ freelancer: req.user._id });

    if (availability) {
      availability.weeklySchedule = weeklySchedule || availability.weeklySchedule;
      availability.blockedDates = blockedDates || availability.blockedDates;
      availability.slotDurationMinutes = slotDurationMinutes || availability.slotDurationMinutes;
      await availability.save();
    } else {
      availability = await Availability.create({
        freelancer: req.user._id,
        weeklySchedule,
        blockedDates,
        slotDurationMinutes,
      });
    }

    res.status(200).json({ success: true, availability });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAvailableSlots = async (req, res) => {
  const { freelancerId } = req.params;
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ message: 'Target date query parameter is required (YYYY-MM-DD)' });
  }

  try {
    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getUTCDay(); // 0-6

    const availability = await Availability.findOne({ freelancer: freelancerId });
    if (!availability) {
      return res.status(404).json({ message: 'Freelancer has not configured booking availability yet.' });
    }

    const isBlocked = availability.blockedDates.some(
      (blocked) => blocked.toISOString().split('T')[0] === targetDate.toISOString().split('T')[0]
    );

    if (isBlocked) {
      return res.status(200).json({ slots: [], message: 'Freelancer is unavailable on this date.' });
    }

    const daySchedule = availability.weeklySchedule.find((day) => day.dayOfWeek === dayOfWeek);
    if (!daySchedule || !daySchedule.isAvailable) {
      return res.status(200).json({ slots: [], message: 'Freelancer does not take bookings on this day.' });
    }

    const [startHour, startMin] = daySchedule.startTime.split(':').map(Number);
    const [endHour, endMin] = daySchedule.endTime.split(':').map(Number);

    const startTimestamp = new Date(targetDate);
    startTimestamp.setUTCHours(startHour, startMin, 0, 0);

    const endTimestamp = new Date(targetDate);
    endTimestamp.setUTCHours(endHour, endMin, 0, 0);

    const rawSlots = [];
    let currentSlot = new Date(startTimestamp);

    while (currentSlot < endTimestamp) {
      const nextSlot = new Date(currentSlot.getTime() + availability.slotDurationMinutes * 60000);
      if (nextSlot <= endTimestamp) {
        rawSlots.push({
          startTime: new Date(currentSlot),
          endTime: new Date(nextSlot),
        });
      }
      currentSlot = nextSlot;
    }

    const startOfDay = new Date(targetDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const existingBookings = await Booking.find({
      freelancer: freelancerId,
      status: 'scheduled',
      startTime: { $gte: startOfDay, $lte: endOfDay },
    });

    const openSlots = rawSlots.filter((slot) => {
      return !existingBookings.some((booking) => {
        return (
          (slot.startTime >= booking.startTime && slot.startTime < booking.endTime) ||
          (slot.endTime > booking.startTime && slot.endTime <= booking.endTime)
        );
      });
    });

    res.status(200).json({ slots: openSlots });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createBooking = async (req, res) => {
  const { freelancerId, gigId, title, startTime, endTime } = req.body;

  try {
    const parsedStart = new Date(startTime);
    const parsedEnd = new Date(endTime);

    if (parsedStart <= new Date()) {
      return res.status(400).json({ message: 'Cannot book appointments in the past.' });
    }

    const collision = await Booking.findOne({
      freelancer: freelancerId,
      status: 'scheduled',
      $or: [
        { startTime: { $lt: parsedEnd, $gte: parsedStart } },
        { endTime: { $gt: parsedStart, $lte: parsedEnd } },
      ],
    });

    if (collision) {
      return res.status(409).json({ message: 'This time slot has already been booked by another client.' });
    }

    const booking = await Booking.create({
      client: req.user._id,
      freelancer: freelancerId,
      gig: gigId || null,
      title,
      startTime: parsedStart,
      endTime: parsedEnd,
      meetingUrl: `/collaboration/room/${Math.random().toString(36).substring(2, 10)}`,
    });

    await sendNotification({
      recipient: freelancerId,
      sender: req.user._id,
      type: 'SYSTEM_ALERT',
      title: '📅 New Appointment Booked!',
      message: `${req.user.name} scheduled a meeting: "${title}" for ${parsedStart.toLocaleDateString()}`,
      link: `/dashboard/calendar`,
    });

    res.status(201).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      $or: [{ client: req.user._id }, { freelancer: req.user._id }],
    })
      .populate('client', 'name email')
      .populate('freelancer', 'name email')
      .populate('gig', 'title')
      .sort({ startTime: 1 });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelBooking = async (req, res) => {
  const { reason } = req.body;

  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.client.toString() !== req.user._id.toString() && booking.freelancer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this booking' });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = reason || 'Cancelled by participant';
    await booking.save();

    res.status(200).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  updateAvailability,
  getAvailableSlots,
  createBooking,
  getMyBookings,
  cancelBooking,
};