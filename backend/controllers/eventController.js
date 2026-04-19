const Event = require('../models/Event');
const APIHelpers = require('../utils/apiHelpers');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 }); // Cache for 10 minutes

// Get all events
const getEvents = async (req, res) => {
  try {
    const { category, upcoming } = req.query;
    let query = {};
    
    if (category) query.category = category;
    if (upcoming === 'true') {
      query.startTime = { $gte: new Date() };
    }
    
    const events = await Event.find(query)
      .sort({ startTime: 1 })
      .limit(50);
    
    res.json({
      success: true,
      data: events,
      count: events.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fetch and sync events from API
const syncEventsFromAPI = async (city = 'New York') => {
  try {
    const apiEvents = await APIHelpers.fetchCityEvents(city);
    
    for (const event of apiEvents) {
      await Event.findOneAndUpdate(
        { title: event.title, startTime: event.startTime },
        event,
        { upsert: true, new: true }
      );
    }
    
    return apiEvents;
  } catch (error) {
    console.error('Error syncing events:', error);
    return [];
  }
};

// Get upcoming events
const getUpcomingEvents = async (req, res) => {
  try {
    const events = await Event.find({
      startTime: { $gte: new Date() }
    })
      .sort({ startTime: 1 })
      .limit(10);
    
    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get events by importance
const getImportantEvents = async (req, res) => {
  try {
    const events = await Event.find({
      importance: { $in: ['high', 'critical'] },
      startTime: { $gte: new Date() }
    }).sort({ importance: -1, startTime: 1 });
    
    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create custom event
const createEvent = async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getEvents,
  syncEventsFromAPI,
  getUpcomingEvents,
  getImportantEvents,
  createEvent
};