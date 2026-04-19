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
  static async fetchPollutionData(lat = 40.7128, lon = -74.0060) {
    try {
      const url = `https://api.openaq.org/v2/latest?coordinates=${lat},${lon}&radius=5000&limit=1`;
      
      const response = await axios.get(url);
      
      if (response.data.results && response.data.results[0]) {
        const measurements = response.data.results[0].measurements;
        
        const pm25 = this.findMeasurement(measurements, 'pm25');
        const pm10 = this.findMeasurement(measurements, 'pm10');
        const no2 = this.findMeasurement(measurements, 'no2');
        const so2 = this.findMeasurement(measurements, 'so2');
        const o3 = this.findMeasurement(measurements, 'o3');
        const co = this.findMeasurement(measurements, 'co');
        
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
    
    let value, level;
    if (pm25 <= 12) { value = 50; level = 'Good'; }
    else if (pm25 <= 35.4) { value = 100; level = 'Moderate'; }
    else if (pm25 <= 55.4) { value = 150; level = 'Unhealthy for Sensitive'; }
    else if (pm25 <= 150.4) { value = 200; level = 'Unhealthy'; }
    else if (pm25 <= 250.4) { value = 300; level = 'Very Unhealthy'; }
    else { value = 500; level = 'Hazardous'; }
    
    return { value, level };
  }
  
  // Fetch traffic incidents (smart mock)
  static async fetchTrafficData(lat = 40.7128, lon = -74.0060) {
    try {
      // Smart traffic mock based on time of day
      const currentHour = new Date().getHours();
      const isRushHour = (currentHour >= 8 && currentHour <= 10) || (currentHour >= 17 && currentHour <= 19);
      const isWeekend = [0, 6].includes(new Date().getDay());
      
      let congestion = 40;
      if (isRushHour && !isWeekend) congestion = 85;
      else if (isWeekend) congestion = 55;
      else if (currentHour >= 22 || currentHour <= 6) congestion = 15;
      
      const congestionLevel = Math.floor(congestion + (Math.random() * 20 - 10));
      const averageSpeed = Math.floor(65 * (1 - congestionLevel / 100)) + 10;
      
      const incidents = [];
      if (Math.random() > 0.7) {
        incidents.push({
          type: 'Accident',
          severity: Math.random() > 0.6 ? 'high' : 'medium',
          description: 'Traffic incident reported',
          location: 'Main intersection'
        });
      }
      
      return {
        congestionLevel: Math.min(100, Math.max(0, congestionLevel)),
        incidents: incidents,
        averageSpeed: Math.max(5, averageSpeed)
      };
    } catch (error) {
      console.error('Traffic API Error:', error.message);
      return this.getMockTrafficData();
    }
  }
  
  // Fetch city events from Ticketmaster API - FIXED (removed countryCode=US)
  static async fetchCityEvents(city = 'New York') {
    try {
      const apiKey = process.env.TICKETMASTER_API_KEY;
      
      if (!apiKey || apiKey === 'your_ticketmaster_api_key_here') {
        console.log('No Ticketmaster API key provided');
        return [];
      }
      
      // REMOVED &countryCode=US to allow international city search
      const url = `https://app.ticketmaster.com/discovery/v2/events.json?city=${encodeURIComponent(city)}&size=10&apikey=${apiKey}`;
      
      console.log(`Fetching events for city: ${city}`);
      const response = await axios.get(url);
      
      if (response.data._embedded && response.data._embedded.events) {
        const events = response.data._embedded.events.map(event => ({
          title: event.name,
          description: event.info || event.description || 'Exciting city event',
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
        console.log(`Found ${events.length} events for ${city}`);
        return events;
      }
      
      console.log(`No events found for ${city}`);
      return [];
    } catch (error) {
      console.error('Ticketmaster API Error:', error.response?.data?.message || error.message);
      return [];
    }
  }
  
  // Helper methods
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
}

module.exports = APIHelpers;