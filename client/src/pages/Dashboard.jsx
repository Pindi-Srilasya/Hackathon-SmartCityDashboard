import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch, FaTint, FaWind, FaThermometerHalf, FaCar, FaLeaf, FaCalendarAlt } from 'react-icons/fa';
import { LineChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Bar } from 'recharts';

const Dashboard = () => {
  const [city, setCity] = useState('New York');
  const [searchCity, setSearchCity] = useState('New York');
  const [weatherData, setWeatherData] = useState(null);
  const [trafficData, setTrafficData] = useState(null);
  const [pollutionData, setPollutionData] = useState(null);
  const [eventsData, setEventsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    fetchAllData();
  }, [city]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [weather, traffic, pollution, events] = await Promise.all([
        axios.get(`http://localhost:5000/api/weather?city=${city}`),
        axios.get(`http://localhost:5000/api/traffic`),
        axios.get(`http://localhost:5000/api/pollution`),
        axios.get(`http://localhost:5000/api/events?city=${city}`)
      ]);
      
      setWeatherData(weather.data.data);
      setTrafficData(traffic.data.data);
      setPollutionData(pollution.data.data);
      setEventsData(events.data.data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCity(searchCity);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Generate chart data
  const chartData = [
    { hour: '6AM', temp: 18, traffic: 25, aqi: 42 },
    { hour: '8AM', temp: 20, traffic: 75, aqi: 58 },
    { hour: '10AM', temp: 22, traffic: 55, aqi: 52 },
    { hour: '12PM', temp: 24, traffic: 65, aqi: 48 },
    { hour: '2PM', temp: 25, traffic: 60, aqi: 45 },
    { hour: '4PM', temp: 24, traffic: 70, aqi: 50 },
    { hour: '6PM', temp: 22, traffic: 80, aqi: 55 },
    { hour: '8PM', temp: 20, traffic: 45, aqi: 48 },
    { hour: '10PM', temp: 18, traffic: 30, aqi: 42 },
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard for {city}...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Search Bar */}
      <div className="search-container">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search for a city... (New York, London, Tokyo, etc.)"
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button className="search-button" onClick={handleSearch}>
            Search
          </button>
        </div>
      </div>

      {/* City Header */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '28px', marginBottom: '8px', color: 'white' }}>
          {city}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.6)' }}>
          Real-time urban data • Updated: {lastUpdate.toLocaleTimeString()}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="glass-card stat-card">
          <div className="stat-icon">🌡️</div>
          <div className="stat-value">{weatherData?.temperature || '--'}°C</div>
          <div className="stat-label">Temperature</div>
          <div className="stat-sub">{weatherData?.condition || 'Clear'}</div>
        </div>
        
        <div className="glass-card stat-card">
          <div className="stat-icon">💨</div>
          <div className="stat-value">{pollutionData?.aqi || '--'}</div>
          <div className="stat-label">Air Quality Index</div>
          <div className="stat-sub">{pollutionData?.aqiLevel || 'Moderate'}</div>
        </div>
        
        <div className="glass-card stat-card">
          <div className="stat-icon">🚗</div>
          <div className="stat-value">{trafficData?.congestionLevel || '--'}%</div>
          <div className="stat-label">Traffic Congestion</div>
          <div className="stat-sub">{trafficData?.averageSpeed || '--'} km/h avg</div>
        </div>
        
        <div className="glass-card stat-card">
          <div className="stat-icon">🎉</div>
          <div className="stat-value">{eventsData?.length || 0}</div>
          <div className="stat-label">Upcoming Events</div>
          <div className="stat-sub">in {city}</div>
        </div>
      </div>

      {/* Weather Details */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '20px', color: 'white' }}>Weather Details</h3>
        <div className="weather-details">
          <div className="weather-item">
            <FaThermometerHalf style={{ color: '#f59e0b' }} />
            <span>Feels Like: {weatherData?.feelsLike || '--'}°C</span>
          </div>
          <div className="weather-item">
            <FaTint style={{ color: '#3b82f6' }} />
            <span>Humidity: {weatherData?.humidity || '--'}%</span>
          </div>
          <div className="weather-item">
            <FaWind style={{ color: '#06b6d4' }} />
            <span>Wind Speed: {weatherData?.windSpeed || '--'} km/h</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '20px', color: 'white' }}>Today's Trends</h3>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={chartData}>
            <defs>
              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="hour" stroke="rgba(255,255,255,0.5)" />
            <YAxis yAxisId="left" stroke="rgba(255,255,255,0.5)" />
            <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.5)" />
            <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.9)', border: 'none', borderRadius: '8px' }} />
            <Area yAxisId="left" type="monotone" dataKey="temp" stroke="#f59e0b" fill="url(#colorTemp)" name="Temperature (°C)" />
            <Bar yAxisId="right" dataKey="traffic" fill="#ef4444" opacity={0.5} name="Traffic (%)" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Events Preview */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '20px', color: 'white' }}>Upcoming Events in {city}</h3>
        <div className="events-preview">
          {eventsData && eventsData.slice(0, 3).map((event, idx) => (
            <div key={idx} className="event-item">
              <div className="event-icon">🎪</div>
              <div className="event-info">
                <div className="event-title">{event.title}</div>
                <div className="event-location">{event.venue || event.location?.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;