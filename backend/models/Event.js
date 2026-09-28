// Event Model: Stores event information created by admins
// Fields: title, description, date, time, location, category, capacity, createdBy (admin)

const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide event title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide event description'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    date: {
      type: Date,
      required: [true, 'Please provide event date'],
    },
    time: {
      type: String, // Format: "HH:MM" (e.g., "14:30")
      required: [true, 'Please provide event time'],
    },
    location: {
      type: String,
      required: [true, 'Please provide event location'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Technology', 'Workshop', 'Sports', 'Cultural'],
      required: [true, 'Please provide event category'],
    },
    capacity: {
      type: Number,
      required: [true, 'Please provide event capacity'],
      min: [1, 'Capacity must be at least 1'],
    },
    registrationCount: {
      type: Number,
      default: 0, // Tracks how many students have registered
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true, // Only admins can create events
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
