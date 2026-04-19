const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000", "https://*.vercel.app", "https://*.onrender.com"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000", "https://*.vercel.app", "https://*.onrender.com"],
  credentials: true
}));
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
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
    
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
    console.error('Weather API Error:', error.message);
    res.json({
      success: false,
      message: 'Weather API error, showing mock data',
      data: {
        city: req.query.city || 'New York',
        temperature: Math.floor(Math.random() * 25) + 10,
        feelsLike: Math.floor(Math.random() * 25) + 8,
        humidity: Math.floor(Math.random() * 60) + 30,
        condition: 'Clear sky',
        windSpeed: Math.floor(Math.random() * 20) + 1
      }
    });
  }
});

// Events from Ticketmaster - FIXED (removed countryCode=US)
app.get('/api/events', async (req, res) => {
  try {
    const axios = require('axios');
    const apiKey = process.env.TICKETMASTER_API_KEY;
    const city = req.query.city || 'New York';
    
    // REMOVED &countryCode=US to allow international city search
    const url = `https://app.ticketmaster.com/discovery/v2/events.json?city=${encodeURIComponent(city)}&size=10&apikey=${apiKey}`;
    
    console.log(`Fetching events for city: ${city}`);
    const response = await axios.get(url);
    
    if (response.data._embedded && response.data._embedded.events && response.data._embedded.events.length > 0) {
      const events = response.data._embedded.events.map(event => ({
        title: event.name,
        description: event.info || event.description || 'Exciting city event',
        category: event.classifications?.[0]?.segment?.name || 'Entertainment',
        venue: event._embedded?.venues?.[0]?.name || 'City Venue',
        date: event.dates?.start?.localDate || new Date(),
        url: event.url,
        image: event.images?.[0]?.url || ''
      }));
      console.log(`Found ${events.length} events for ${city}`);
      res.json({ success: true, data: events });
    } else {
      console.log(`No events found for ${city}`);
      res.json({ success: true, data: [] });
    }
  } catch (error) {
    console.error('Events API Error:', error.message);
    res.json({ success: true, data: [] });
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
          aqiLevel: pm25 ? getAQILevel(pm25.value) : 'Moderate',
          pm25: pm25?.value || Math.floor(Math.random() * 100),
          pm10: measurements.find(m => m.parameter === 'pm10')?.value || Math.floor(Math.random() * 150),
          no2: measurements.find(m => m.parameter === 'no2')?.value || Math.floor(Math.random() * 50)
        }
      });
    } else {
      res.json({ success: true, data: getMockPollution() });
    }
  } catch (error) {
    console.error('Pollution API Error:', error.message);
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
  const city = req.query.city || 'New York';
  
  const [weather, events, pollution, traffic] = await Promise.all([
    fetch(`${req.protocol}://${req.get('host')}/api/weather?city=${city}`).then(r => r.json()),
    fetch(`${req.protocol}://${req.get('host')}/api/events?city=${city}`).then(r => r.json()),
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
function getMockPollution() {
  return {
    aqi: Math.floor(Math.random() * 100) + 20,
    aqiLevel: 'Moderate',
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

function getAQILevel(pm25) {
  if (pm25 <= 12) return 'Good';
  if (pm25 <= 35.4) return 'Moderate';
  if (pm25 <= 55.4) return 'Unhealthy for Sensitive';
  if (pm25 <= 150.4) return 'Unhealthy';
  return 'Very Unhealthy';
}

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 Smart City Backend Running!`);
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`\n📊 Test these endpoints:`);
  console.log(`   - Health: http://localhost:${PORT}/api/health`);
  console.log(`   - Weather: http://localhost:${PORT}/api/weather?city=London`);
  console.log(`   - Events: http://localhost:${PORT}/api/events?city=London`);
  console.log(`   - Pollution: http://localhost:${PORT}/api/pollution`);
  console.log(`   - Traffic: http://localhost:${PORT}/api/traffic`);
  console.log(`   - Dashboard: http://localhost:${PORT}/api/dashboard?city=London`);
  console.log(`\n🔌 WebSocket: ws://localhost:${PORT}\n`);
});