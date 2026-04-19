const mongoose = require('mongoose');

const cityDataSchema = new mongoose.Schema({
  city: {
    name: String,
    country: String,
    coordinates: {
      lat: Number,
      lon: Number
    }
  },
  weather: {
    temperature: Number,
    feelsLike: Number,
    humidity: Number,
    pressure: Number,
    windSpeed: Number,
    condition: String,
    icon: String
  },
  pollution: {
    aqi: Number,
    aqiLevel: String,
    pm25: Number,
    pm10: Number,
    no2: Number,
    so2: Number,
    o3: Number,
    co: Number
  },
  traffic: {
    congestionLevel: Number,
    incidents: [{
      type: String,
      severity: String,
      description: String,
      location: String
    }],
    averageSpeed: Number
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Index for faster queries
cityDataSchema.index({ timestamp: -1 });
cityDataSchema.index({ 'city.name': 1 });

module.exports = mongoose.model('CityData', cityDataSchema);