import React, { useState } from 'react';
import apiClient from '../../utils/apiClient';
import Input from '../common/Input';
import Button from '../common/Button';

const BookingModal = ({ isOpen, onClose, freelancer, onSuccess }) => {
  if (!isOpen || !freelancer) return null;

  const availableSlots = freelancer.profile?.availability || [
    { day: 'Monday - Friday', timeSlot: '09:00 AM - 11:30 AM IST' },
    { day: 'Monday - Friday', timeSlot: '02:00 PM - 05:00 PM IST' },
  ];

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState(defaultDateStr);
  const [selectedSlot, setSelectedSlot] = useState(availableSlots[0]?.timeSlot || '10:00 AM IST');
  const [meetingTopic, setMeetingTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsBooking(true);
    setError(null);

    try {
      const payload = {
        freelancerId: freelancer._id,
        date: selectedDate,
        timeSlot: selectedSlot,
        topic: meetingTopic || 'Initial Project Kickoff Consultation',
        notes,
      };

      await apiClient.post('/scheduler/book', payload);
      setIsBooking(false);
      onSuccess();
      onClose();
    } catch (err) {
      setIsBooking(false);
      onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg my-8 rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-gray-100">
        
        <div className="flex items-start justify-between border-b border-gray-100 pb-4 mb-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-premium-accent">
              Schedule Kickoff
            </span>
            <h2 className="text-xl font-extrabold text-premium-dark mt-0.5">
              Book {freelancer.name || 'Verified Specialist'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input
            id="meetingTopic"
            label="Consultation Topic"
            placeholder="e.g. Architecture Review & Escrow Milestone Setup"
            value={meetingTopic}
            onChange={(e) => setMeetingTopic(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="bookingDate" className="text-xs font-semibold uppercase tracking-wider text-premium-muted">
              Select Date <span className="text-red-500">*</span>
            </label>
            <input
              id="bookingDate"
              type="date"
              min={defaultDateStr}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-white text-premium-dark text-sm border border-gray-200 focus:border-black outline-none transition-all cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-premium-muted">
              Select Configured Time Window <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 gap-2.5">
              {availableSlots.map((slot, idx) => (
                <label
                  key={idx}
                  onClick={() => setSelectedSlot(slot.timeSlot)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                    selectedSlot === slot.timeSlot
                      ? 'bg-black text-white border-black shadow-sm'
                      : 'bg-gray-50/80 text-gray-700 border-gray-200/80 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedSlot === slot.timeSlot ? 'border-white bg-white' : 'border-gray-400'
                    }`}>
                      {selectedSlot === slot.timeSlot && <div className="w-2 h-2 rounded-full bg-black" />}
                    </div>
                    <span className="text-xs font-bold">{slot.day}</span>
                  </div>
                  <span className={`text-xs font-extrabold ${selectedSlot === slot.timeSlot ? 'text-blue-400' : 'text-premium-dark'}`}>
                    {slot.timeSlot}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-premium-muted">
              Preparation Notes
            </label>
            <textarea
              rows={3}
              placeholder="Share links to wireframes, API docs, or specific technical constraints..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-4 rounded-xl border border-gray-200 text-xs outline-none focus:border-black transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="outline" size="md" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={isBooking}>
              {isBooking ? 'Securing Slot...' : 'Confirm Appointment'}
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default BookingModal;