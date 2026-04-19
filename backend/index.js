const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Smart City Backend is Running!',
    timestamp: new Date()
  });
});

// Real-time weather data from OpenWeatherMap
app.get('/api/weather', async (req, res) => {
  try {
    const axios = require('axios');
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const city = req.query.city || 'New York';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    
    const response = await axios.get(url);
    res.json({
      success: true,
      data: {
        city: response.data.name,
        temperature: Math.round(response.data.main.temp),
        feelsLike: Math.round(response.data.main.feels_like),
        humidity: response.data.main.humidity,
        condition: response.data.weather[0].description,
        windSpeed: response.data.wind.speed
      }
    });
  } catch (error) {
    res.json({
      success: false,
      message: 'Weather API error, showing mock data',
      data: {
        city: 'New York',
        temperature: Math.floor(Math.random() * 25) + 10,
        feelsLike: Math.floor(Math.random() * 25) + 8,
        humidity: Math.floor(Math.random() * 60) + 30,
        condition: 'Clear sky',
        windSpeed: Math.floor(Math.random() * 20) + 1
      }
    });
  }
});

// Events from Ticketmaster
app.get('/api/events', async (req, res) => {
  try {
    const axios = require('axios');
    const apiKey = process.env.TICKETMASTER_API_KEY;
    const city = req.query.city || 'New York';
    const url = `https://app.ticketmaster.com/discovery/v2/events.json?city=${city}&countryCode=US&size=10&apikey=${apiKey}`;
    
    const response = await axios.get(url);
    
    if (response.data._embedded && response.data._embedded.events) {
      const events = response.data._embedded.events.map(event => ({
        title: event.name,
        description: event.info || 'Exciting city event',
        category: event.classifications?.[0]?.segment?.name || 'Entertainment',
        venue: event._embedded?.venues?.[0]?.name || 'City Venue',
        date: event.dates?.start?.localDate || new Date(),
        url: event.url,
        image: event.images?.[0]?.url || ''
      }));
      res.json({ success: true, data: events });
    } else {
      res.json({ success: true, data: getMockEvents() });
    }
  } catch (error) {
    res.json({ success: true, data: getMockEvents() });
  }
});

// Pollution data (OpenAQ - no key needed)
app.get('/api/pollution', async (req, res) => {
  try {
    const axios = require('axios');
    const lat = req.query.lat || 40.7128;
    const lon = req.query.lon || -74.0060;
    const url = `https://api.openaq.org/v2/latest?coordinates=${lat},${lon}&radius=5000&limit=1`;
    
    const response = await axios.get(url);
    
    if (response.data.results && response.data.results[0]) {
      const measurements = response.data.results[0].measurements;
      const pm25 = measurements.find(m => m.parameter === 'pm25');
      
      res.json({
        success: true,
        data: {
          aqi: pm25 ? calculateAQI(pm25.value) : Math.floor(Math.random() * 100) + 20,
          pm25: pm25?.value || Math.floor(Math.random() * 100),
          pm10: measurements.find(m => m.parameter === 'pm10')?.value || Math.floor(Math.random() * 150),
          no2: measurements.find(m => m.parameter === 'no2')?.value || Math.floor(Math.random() * 50)
        }
      });
    } else {
      res.json({ success: true, data: getMockPollution() });
    }
  } catch (error) {
    res.json({ success: true, data: getMockPollution() });
  }
});

// Traffic data (smart mock)
app.get('/api/traffic', (req, res) => {
  const currentHour = new Date().getHours();
  const isRushHour = (currentHour >= 8 && currentHour <= 10) || (currentHour >= 17 && currentHour <= 19);
  const isWeekend = [0, 6].includes(new Date().getDay());
  
  let congestion = 40;
  if (isRushHour && !isWeekend) congestion = 85;
  else if (isWeekend) congestion = 55;
  else if (currentHour >= 22 || currentHour <= 6) congestion = 15;
  
  res.json({
    success: true,
    data: {
      congestionLevel: Math.floor(congestion + (Math.random() * 20 - 10)),
      averageSpeed: Math.floor(65 * (1 - congestion / 100)) + 10,
      incidents: Math.random() > 0.7 ? [
        { type: 'Accident', severity: 'medium', location: 'Downtown' }
      ] : []
    }
  });
});

// Dashboard summary (combines all data)
app.get('/api/dashboard', async (req, res) => {
  const [weather, events, pollution, traffic] = await Promise.all([
    fetch(`${req.protocol}://${req.get('host')}/api/weather`).then(r => r.json()),
    fetch(`${req.protocol}://${req.get('host')}/api/events`).then(r => r.json()),
    fetch(`${req.protocol}://${req.get('host')}/api/pollution`).then(r => r.json()),
    fetch(`${req.protocol}://${req.get('host')}/api/traffic`).then(r => r.json())
  ]);
  
  res.json({
    success: true,
    data: {
      weather: weather.data,
      events: events.data,
      pollution: pollution.data,
      traffic: traffic.data,
      timestamp: new Date()
    }
  });
});

// Socket.io for real-time updates
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  const interval = setInterval(async () => {
    try {
      const axios = require('axios');
      const apiKey = process.env.OPENWEATHER_API_KEY;
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=New York&appid=${apiKey}&units=metric`;
      const weatherResponse = await axios.get(weatherUrl);
      
      socket.emit('realtime-update', {
        weather: {
          temperature: Math.round(weatherResponse.data.main.temp),
          condition: weatherResponse.data.weather[0].description
        },
        timestamp: new Date()
      });
    } catch (error) {
      socket.emit('realtime-update', {
        weather: {
          temperature: Math.floor(Math.random() * 25) + 10,
          condition: 'Clear'
        },
        timestamp: new Date()
      });
    }
  }, 10000);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    clearInterval(interval);
  });
});

// Helper functions
function getMockEvents() {
  return [
    { title: 'Summer Music Festival', description: 'Annual music festival', category: 'Concert', venue: 'Central Park' },
    { title: 'Food Truck Rally', description: 'Food festival downtown', category: 'Festival', venue: 'Downtown' },
    { title: 'Art Exhibition', description: 'Local artists showcase', category: 'Exhibition', venue: 'Art Gallery' }
  ];
}

function getMockPollution() {
  return {
    aqi: Math.floor(Math.random() * 100) + 20,
    pm25: Math.floor(Math.random() * 80) + 10,
    pm10: Math.floor(Math.random() * 120) + 20,
    no2: Math.floor(Math.random() * 40) + 5
  };
}

function calculateAQI(pm25) {
  if (pm25 <= 12) return 50;
  if (pm25 <= 35.4) return 100;
  if (pm25 <= 55.4) return 150;
  if (pm25 <= 150.4) return 200;
  return 300;
}

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 Smart City Backend Running!`);
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`\n📊 Test these endpoints:`);
  console.log(`   - Health: http://localhost:${PORT}/api/health`);
  console.log(`   - Weather: http://localhost:${PORT}/api/weather`);
  console.log(`   - Events: http://localhost:${PORT}/api/events`);
  console.log(`   - Pollution: http://localhost:${PORT}/api/pollution`);
  console.log(`   - Traffic: http://localhost:${PORT}/api/traffic`);
  console.log(`   - Dashboard: http://localhost:${PORT}/api/dashboard`);
  console.log(`\n🔌 WebSocket: ws://localhost:${PORT}\n`);
});