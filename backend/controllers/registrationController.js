// Registration Controller: Handles student event registrations
// Students can register for events, cancel registrations, and view their registered events

const EventRegistration = require('../models/EventRegistration');
const Event = require('../models/Event');
const mongoose = require('mongoose');

// Register student for an event
exports.registerEvent = async (req, res) => {
  try {
    const { eventId } = req.body;
    const studentId = req.user.id;

    // Input validation
    if (!eventId) {
      return res.status(400).json({ message: 'Event ID is required' });
    }

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: 'Invalid event ID format' });
    }

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event has capacity
    if (event.registrationCount >= event.capacity) {
      return res.status(400).json({ message: 'Event is at full capacity' });
    }

    // Check if student already registered for this event
    const existingRegistration = await EventRegistration.findOne({
      studentId,
      eventId,
    });

    if (existingRegistration) {
      return res.status(400).json({ message: 'You are already registered for this event' });
    }

    // Create registration
    const registration = new EventRegistration({
      studentId,
      eventId,
    });

    await registration.save();

    // Increment event registration count
    event.registrationCount += 1;
    await event.save();

    res.status(201).json({
      message: 'Registered for event successfully',
      data: registration,
    });
  } catch (error) {
    // Handle duplicate registration error from unique index
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You are already registered for this event' });
    }
    res.status(500).json({ message: 'Registration failed' });
  }
};

// Cancel event registration
exports.cancelRegistration = async (req, res) => {
  try {
    const { eventId } = req.params;
    const studentId = req.user.id;

    // Input validation
    if (!eventId) {
      return res.status(400).json({ message: 'Event ID is required' });
    }

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: 'Invalid event ID format' });
    }

    // Find registration
    const registration = await EventRegistration.findOne({
      studentId,
      eventId,
    });

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // Delete registration
    await EventRegistration.deleteOne({ _id: registration._id });

    // Decrement event registration count
    const event = await Event.findById(eventId);
    if (event && event.registrationCount > 0) {
      event.registrationCount -= 1;
      await event.save();
    }

    res.status(200).json({
      message: 'Cancelled registration successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to cancel registration' });
  }
};

// Get all events registered by current student
exports.getMyEvents = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { page = 1, limit = 6 } = req.query;

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Find all registrations for this student and populate event details
    const registrations = await EventRegistration.find({ studentId })
      .populate({
        path: 'eventId',
        select: 'title description date time location category capacity registrationCount createdBy',
        populate: {
          path: 'createdBy',
          select: 'name email',
        },
      })
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    // Count total registrations
    const total = await EventRegistration.countDocuments({ studentId });
    const totalPages = Math.ceil(total / parseInt(limit));

    res.status(200).json({
      message: 'My events fetched successfully',
      data: registrations.map((reg) => reg.eventId),
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalEvents: total,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch my events' });
  }
};

// Check if student is registered for an event
exports.isRegistered = async (req, res) => {
  try {
    const { eventId } = req.params;
    const studentId = req.user.id;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: 'Invalid event ID format' });
    }

    const registration = await EventRegistration.findOne({
      studentId,
      eventId,
    });

    res.status(200).json({
      data: {
        isRegistered: !!registration,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to check registration status' });
  }
};
