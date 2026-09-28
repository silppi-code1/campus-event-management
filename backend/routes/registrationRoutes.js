// Registration Routes: /api/registrations endpoints
// POST: Register for event (student only, requires auth)
// DELETE /:eventId: Cancel registration (student only)
// GET/my-events: Get all events student is registered for
// GET/check/:eventId: Check if student is registered for event

const express = require('express');
const {
  registerEvent,
  cancelRegistration,
  getMyEvents,
  isRegistered,
} = require('../controllers/registrationController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All registration routes require authentication
router.use(authenticate);

// POST /api/registrations - Register student for event
router.post('/', registerEvent);

// DELETE /api/registrations/:eventId - Cancel registration
router.delete('/:eventId', cancelRegistration);

// GET /api/registrations/my-events - Get student's registered events
router.get('/my-events', getMyEvents);

// GET /api/registrations/check/:eventId - Check if registered
router.get('/check/:eventId', isRegistered);

module.exports = router;
