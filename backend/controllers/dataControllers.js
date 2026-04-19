const CityData = require('../models/CityData');
const APIHelpers = require('../utils/apiHelpers');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 }); // Cache for 5 minutes

// Get latest city data
const getLatestData = async (req, res) => {
  try {
    const cacheKey = 'latest_data';
    let data = cache.get(cacheKey);
    
    if (!data) {
      data = await CityData.find()
        .sort({ timestamp: -1 })
        .limit(20);
      cache.set(cacheKey, data);
    }
    
    res.json({
      success: true,
      data: data,
      count: data.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fetch and save real-time data from APIs
const fetchRealtimeData = async (city = 'New York', lat = 40.7128, lon = -74.0060) => {
  try {
    const [weather, pollution, traffic] = await Promise.all([
      APIHelpers.fetchWeatherData(city, lat, lon),
      APIHelpers.fetchPollutionData(lat, lon),
      APIHelpers.fetchTrafficData(lat, lon)
    ]);
    
    const cityData = new CityData({
      city: {
        name: city,
        country: 'USA',
        coordinates: { lat, lon }
      },
      weather: weather || {},
      pollution: pollution || {},
      traffic: traffic || {}
    });
    
    await cityData.save();
    return cityData;
  } catch (error) {
    console.error('Error fetching real-time data:', error);
    return null;
  }
};

// Get current statistics
const getStatistics = async (req, res) => {
  try {
    const stats = await CityData.aggregate([
      {
        $group: {
          _id: null,
          avgTemperature: { $avg: '$weather.temperature' },
          avgAQI: { $avg: '$pollution.aqi' },
          avgCongestion: { $avg: '$traffic.congestionLevel' },
          totalRecords: { $sum: 1 }
        }
      }
    ]);
    
    const latestData = await CityData.findOne().sort({ timestamp: -1 });
    
    res.json({
      success: true,
      statistics: stats[0] || {},
      currentData: latestData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get data by date range
const getDataByDateRange = async (req, res) => {
  try {
    const { start, end } = req.query;
    
    const data = await CityData.find({
      timestamp: {
        $gte: new Date(start),
        $lte: new Date(end)
      }
    }).sort({ timestamp: 1 });
    
    res.json({
      success: true,
      data: data,
      count: data.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getLatestData,
  fetchRealtimeData,
  getStatistics,
  getDataByDateRange
};