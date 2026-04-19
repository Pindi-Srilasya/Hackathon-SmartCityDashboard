const axios = require('axios');

class APIHelpers {
  // Fetch real weather data from OpenWeatherMap
  static async fetchWeatherData(city = 'New York', lat = 40.7128, lon = -74.0060) {
    try {
      const apiKey = process.env.OPENWEATHER_API_KEY;
      let url;
      
      if (lat && lon) {
        url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
      } else {
        url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
      }
      
      const response = await axios.get(url);
      const data = response.data;
      
      return {
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        windSpeed: data.wind.speed,
        condition: data.weather[0].description,
        icon: `https://openweathermap.org/img/w/${data.weather[0].icon}.png`
      };
    } catch (error) {
      console.error('Weather API Error:', error.message);
      return null;
    }
  }
  
  // Fetch pollution data from OpenAQ
  // In backend/utils/apiHelpers.js - Simplified pollution method (NO API KEY NEEDED)

static async fetchPollutionData(lat = 40.7128, lon = -74.0060) {
  try {
    // OpenAQ works without any API key! Just use the public endpoint
    const url = `https://api.openaq.org/v2/latest?coordinates=${lat},${lon}&radius=5000&limit=1`;
    
    const response = await axios.get(url);
    
    if (response.data.results && response.data.results[0]) {
      const measurements = response.data.results[0].measurements;
      
      // Extract pollutant values
      const pm25 = this.findMeasurement(measurements, 'pm25');
      const pm10 = this.findMeasurement(measurements, 'pm10');
      const no2 = this.findMeasurement(measurements, 'no2');
      const so2 = this.findMeasurement(measurements, 'so2');
      const o3 = this.findMeasurement(measurements, 'o3');
      const co = this.findMeasurement(measurements, 'co');
      
      // Calculate AQI based on PM2.5 (common method)
      const aqi = this.calculateAQI(measurements);
      
      return {
        aqi: aqi.value,
        aqiLevel: aqi.level,
        pm25: pm25 || Math.floor(Math.random() * 50) + 10,
        pm10: pm10 || Math.floor(Math.random() * 80) + 20,
        no2: no2 || Math.floor(Math.random() * 40) + 5,
        so2: so2 || Math.floor(Math.random() * 15) + 1,
        o3: o3 || Math.floor(Math.random() * 60) + 10,
        co: co || Math.floor(Math.random() * 8) + 1
      };
    }
    
    // Fallback to mock data if no real data available
    return this.getMockPollutionData();
  } catch (error) {
    console.error('OpenAQ API Error (using mock data):', error.message);
    return this.getMockPollutionData();
  }
}

static findMeasurement(measurements, parameter) {
  const measurement = measurements?.find(m => m.parameter === parameter);
  return measurement ? Math.round(measurement.value) : null;
}

static calculateAQI(measurements) {
  const pm25 = this.findMeasurement(measurements, 'pm25');
  
  if (!pm25) {
    return { value: Math.floor(Math.random() * 100) + 20, level: 'Moderate' };
  }
  
  // EPA AQI calculation for PM2.5
  let value, level;
  if (pm25 <= 12) { value = 50; level = 'Good'; }
  else if (pm25 <= 35.4) { value = 100; level = 'Moderate'; }
  else if (pm25 <= 55.4) { value = 150; level = 'Unhealthy for Sensitive'; }
  else if (pm25 <= 150.4) { value = 200; level = 'Unhealthy'; }
  else if (pm25 <= 250.4) { value = 300; level = 'Very Unhealthy'; }
  else { value = 500; level = 'Hazardous'; }
  
  return { value, level };
}
  
  // Fetch traffic incidents from TomTom
  static async fetchTrafficData(lat = 40.7128, lon = -74.0060) {
    try {
      const apiKey = process.env.TOMTOM_API_KEY;
      const url = `https://api.tomtom.com/traffic/services/5/incidentDetails?bbox=-74.05,40.68,-73.95,40.78&fields=%7B%22incidents%22%3A%7B%22id%22%3Atrue%2C%22type%22%3Atrue%2C%22severity%22%3Atrue%2C%22description%22%3Atrue%2C%22location%22%3Atrue%7D%7D&key=${apiKey}`;
      
      const response = await axios.get(url);
      
      if (response.data.incidents) {
        const incidents = response.data.incidents.slice(0, 5).map(incident => ({
          type: incident.type,
          severity: this.getSeverityLevel(incident.severity),
          description: incident.description,
          location: incident.location
        }));
        
        return {
          congestionLevel: Math.floor(Math.random() * 100),
          incidents: incidents,
          averageSpeed: Math.floor(Math.random() * 60) + 20
        };
      }
      return this.getMockTrafficData();
    } catch (error) {
      console.error('Traffic API Error:', error.message);
      return this.getMockTrafficData();
    }
  }
  
  // Fetch city events from Ticketmaster API (Free)
  static async fetchCityEvents(city = 'New York') {
    try {
      const url = `https://app.ticketmaster.com/discovery/v2/events.json?city=${city}&countryCode=US&size=10&apikey=${process.env.TICKETMASTER_API_KEY || 'DEMO_KEY'}`;
      
      const response = await axios.get(url);
      
      if (response.data._embedded && response.data._embedded.events) {
        return response.data._embedded.events.map(event => ({
          title: event.name,
          description: event.description || 'Exciting city event',
          category: event.classifications?.[0]?.segment?.name || 'Entertainment',
          location: {
            name: event._embedded?.venues?.[0]?.name || 'City Venue',
            lat: event._embedded?.venues?.[0]?.location?.latitude || 40.7128,
            lng: event._embedded?.venues?.[0]?.location?.longitude || -74.0060,
            address: event._embedded?.venues?.[0]?.address?.line1 || 'City Center'
          },
          startTime: event.dates?.start?.dateTime || new Date(),
          endTime: event.dates?.end?.dateTime || new Date(Date.now() + 3 * 3600000),
          source: 'Ticketmaster',
          importance: 'medium',
          imageUrl: event.images?.[0]?.url || '',
          price: event.priceRanges?.[0]?.min ? `$${event.priceRanges[0].min}` : 'Free'
        }));
      }
      return this.getMockEvents();
    } catch (error) {
      console.error('Events API Error:', error.message);
      return this.getMockEvents();
    }
  }
  
  // Helper methods
  static calculateAQI(measurements) {
    const pm25 = this.findMeasurement(measurements, 'pm25') || 0;
    
    let value = 0;
    let level = 'Good';
    
    if (pm25 <= 12) { value = 50; level = 'Good'; }
    else if (pm25 <= 35.4) { value = 100; level = 'Moderate'; }
    else if (pm25 <= 55.4) { value = 150; level = 'Unhealthy for Sensitive'; }
    else if (pm25 <= 150.4) { value = 200; level = 'Unhealthy'; }
    else if (pm25 <= 250.4) { value = 300; level = 'Very Unhealthy'; }
    else { value = 500; level = 'Hazardous'; }
    
    return { value, level };
  }
  
  static findMeasurement(measurements, parameter) {
    const measurement = measurements.find(m => m.parameter === parameter);
    return measurement ? Math.round(measurement.value) : null;
  }
  
  static getSeverityLevel(severity) {
    if (severity <= 2) return 'low';
    if (severity <= 4) return 'medium';
    return 'high';
  }
  
  // Mock data for fallback
  static getMockPollutionData() {
    return {
      aqi: Math.floor(Math.random() * 150) + 20,
      aqiLevel: 'Moderate',
      pm25: Math.floor(Math.random() * 100),
      pm10: Math.floor(Math.random() * 150),
      no2: Math.floor(Math.random() * 50),
      so2: Math.floor(Math.random() * 20),
      o3: Math.floor(Math.random() * 80),
      co: Math.floor(Math.random() * 10)
    };
  }
  
  static getMockTrafficData() {
    return {
      congestionLevel: Math.floor(Math.random() * 100),
      incidents: [
        { type: 'Accident', severity: 'medium', description: 'Minor accident on Main St', location: 'Downtown' },
        { type: 'Construction', severity: 'low', description: 'Road work in progress', location: '5th Avenue' }
      ],
      averageSpeed: Math.floor(Math.random() * 60) + 20
    };
  }
  
  static getMockEvents() {
    return [
      {
        title: 'Summer Music Festival',
        description: 'Annual city music festival',
        category: 'Concert',
        location: { name: 'Central Park', lat: 40.7829, lng: -73.9654, address: 'Central Park, NY' },
        startTime: new Date(),
        endTime: new Date(Date.now() + 86400000),
        source: 'City Events',
        importance: 'high',
        imageUrl: 'https://via.placeholder.com/300',
        price: '$25'
      }
    ];
  }
}

module.exports = APIHelpers;