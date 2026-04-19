const express = require('express');
const router = express.Router();
const {
  getEvents,
  getUpcomingEvents,
  getImportantEvents,
  createEvent
} = require('../controllers/eventController');

router.get('/', getEvents);
router.get('/upcoming', getUpcomingEvents);
router.get('/important', getImportantEvents);
router.post('/', createEvent);

module.exports = router;