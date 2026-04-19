import React, { useMemo } from 'react';
import { FaTint, FaWind, FaThermometerHalf } from 'react-icons/fa';
import { LineChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Bar } from 'recharts';
import { useCity } from '../context/CityContext';

const Dashboard = () => {
  const { 
    selectedCity, 
    searchInput, 
    setSearchInput, 
    weatherData, 
    trafficData, 
    pollutionData, 
    eventsData, 
    loading, 
    lastUpdate, 
    searchCity 
  } = useCity();

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchCity();
    }
  };

  // Generate dynamic chart data based on real data
  const chartData = useMemo(() => {
    const hours = ['6AM', '8AM', '10AM', '12PM', '2PM', '4PM', '6PM', '8PM', '10PM'];
    const baseTemp = weatherData?.temperature || 22;
    const baseTraffic = trafficData?.congestionLevel || 45;
    const baseAQI = pollutionData?.aqi || 50;
    
    return hours.map((hour, index) => {
      // Temperature varies throughout the day (peak at noon)
      let tempVariation = 0;
      if (index === 0) tempVariation = -4;      // 6AM - coolest
      else if (index === 1) tempVariation = -2; // 8AM
      else if (index === 2) tempVariation = 0;  // 10AM
      else if (index === 3) tempVariation = 2;  // 12PM - warmest
      else if (index === 4) tempVariation = 2;  // 2PM - warmest
      else if (index === 5) tempVariation = 1;  // 4PM
      else if (index === 6) tempVariation = -1; // 6PM
      else if (index === 7) tempVariation = -3; // 8PM
      else tempVariation = -5;                   // 10PM - coolest
      
      // Traffic varies by rush hours
      let trafficMultiplier = 1;
      if (index === 1 || index === 6) trafficMultiplier = 1.5;  // 8AM and 6PM rush hour
      else if (index === 0 || index === 7) trafficMultiplier = 0.7;  // 6AM and 8PM
      else if (index >= 2 && index <= 5) trafficMultiplier = 1.1;  // Midday
      else trafficMultiplier = 0.5;  // Late night
      
      // AQI follows traffic pattern (more pollution = more traffic)
      const aqiMultiplier = trafficMultiplier;
      
      return {
        hour,
        temp: Math.max(10, Math.min(40, Math.round(baseTemp + tempVariation))),
        traffic: Math.min(95, Math.max(10, Math.round(baseTraffic * trafficMultiplier))),
        aqi: Math.min(200, Math.max(20, Math.round(baseAQI * aqiMultiplier)))
      };
    });
  }, [weatherData, trafficData, pollutionData]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard for {selectedCity}...</p>
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
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button className="search-button" onClick={searchCity}>
            Search
          </button>
        </div>
      </div>

      {/* City Header */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '28px', marginBottom: '8px', color: 'white' }}>
          {selectedCity}
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
          <div className="stat-sub">in {selectedCity}</div>
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

      {/* Charts - Now using dynamic data */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '20px', color: 'white' }}>Today's Trends</h3>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={chartData} key={`chart-${selectedCity}-${weatherData?.temperature}-${trafficData?.congestionLevel}`}>
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
            <YAxis yAxisId="left" stroke="rgba(255,255,255,0.5)" label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.5)" label={{ value: 'Traffic (%)', angle: 90, position: 'insideRight', fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.9)', border: 'none', borderRadius: '8px' }} />
            <Area yAxisId="left" type="monotone" dataKey="temp" stroke="#f59e0b" fill="url(#colorTemp)" name="Temperature (°C)" />
            <Bar yAxisId="right" dataKey="traffic" fill="#ef4444" opacity={0.5} name="Traffic (%)" />
          </ComposedChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '3px', background: '#f59e0b' }} />
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Temperature</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '3px', background: '#ef4444' }} />
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Traffic Congestion</span>
          </div>
        </div>
      </div>

      {/* Events Preview */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '20px', color: 'white' }}>Upcoming Events in {selectedCity}</h3>
        <div className="events-preview">
          {eventsData && eventsData.length > 0 ? (
            eventsData.slice(0, 3).map((event, idx) => (
              <div key={idx} className="event-item">
                <div className="event-icon">🎪</div>
                <div className="event-info">
                  <div className="event-title">{event.title}</div>
                  <div className="event-location">{event.venue || event.location?.name}</div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', color: 'rgba(255,255,255,0.4)' }}>
              No upcoming events found for {selectedCity}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;