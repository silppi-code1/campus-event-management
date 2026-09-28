// EventRegistration Model: Tracks which students are registered for which events
// Prevents duplicate registrations and allows students to cancel registration

const mongoose = require('mongoose');

const eventRegistrationSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
  },
  { timestamps: true }
);

// Create a compound index to prevent duplicate registrations
// Same student cannot register for same event twice
eventRegistrationSchema.index({ studentId: 1, eventId: 1 }, { unique: true });

module.exports = mongoose.model('EventRegistration', eventRegistrationSchema);
