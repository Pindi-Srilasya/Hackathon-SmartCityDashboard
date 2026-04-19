const { fetchRealtimeData } = require('../controllers/dataController');
const { syncEventsFromAPI } = require('../controllers/eventController');

const setupSocket = (io) => {
  // Store active intervals
  const intervals = new Map();
  
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);
    
    // Send initial data
    socket.on('request-initial-data', async () => {
      const CityData = require('../models/CityData');
      const Event = require('../models/Event');
      
      try {
        const [latestData, events, stats] = await Promise.all([
          CityData.find().sort({ timestamp: -1 }).limit(50),
          Event.find().sort({ startTime: 1 }).limit(20),
          CityData.aggregate([
            {
              $group: {
                _id: null,
                avgAQI: { $avg: '$pollution.aqi' },
                avgTemp: { $avg: '$weather.temperature' },
                avgCongestion: { $avg: '$traffic.congestionLevel' }
              }
            }
          ])
        ]);
        
        socket.emit('initial-data', {
          cityData: latestData,
          events: events,
          statistics: stats[0] || {}
        });
      } catch (error) {
        console.error('Error sending initial data:', error);
      }
    });
    
    // Start real-time updates
    socket.on('start-realtime', () => {
      console.log(`Starting real-time updates for ${socket.id}`);
      
      // Send new data every 10 seconds
      const dataInterval = setInterval(async () => {
        const newData = await fetchRealtimeData();
        if (newData) {
          io.emit('new-city-data', newData);
        }
      }, 10000);
      
      // Sync events every 60 seconds
      const eventInterval = setInterval(async () => {
        const newEvents = await syncEventsFromAPI();
        if (newEvents && newEvents.length > 0) {
          io.emit('events-updated', newEvents);
        }
      }, 60000);
      
      // Store intervals
      intervals.set(`${socket.id}_data`, dataInterval);
      intervals.set(`${socket.id}_events`, eventInterval);
    });
    
    // Stop real-time updates
    socket.on('stop-realtime', () => {
      console.log(`Stopping real-time updates for ${socket.id}`);
      
      // Clear all intervals for this socket
      for (const [key, interval] of intervals) {
        if (key.startsWith(socket.id)) {
          clearInterval(interval);
          intervals.delete(key);
        }
      }
    });
    
    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
      
      // Clean up intervals on disconnect
      for (const [key, interval] of intervals) {
        if (key.startsWith(socket.id)) {
          clearInterval(interval);
          intervals.delete(key);
        }
      }
    });
  });
};

module.exports = setupSocket;