// Event Routes: /api/events endpoints
// GET: List all events (public, supports search/filter/pagination)
// GET /:id: Get single event (public)
// POST: Create event (admin only)
// PUT /:id: Update event (admin only)
// DELETE /:id: Delete event (admin only)

const express = require('express');
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/authorization');

const router = express.Router();

// Public routes (no authentication required)
router.get('/', getEvents);
router.get('/:id', getEventById);

// Protected routes (authentication required)
router.post('/', authenticate, isAdmin, createEvent);
router.put('/:id', authenticate, isAdmin, updateEvent);
router.delete('/:id', authenticate, isAdmin, deleteEvent);

module.exports = router;
