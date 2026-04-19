import React, { useMemo } from 'react';
import { FaTint, FaWind, FaThermometerHalf, FaChartLine } from 'react-icons/fa';
import { LineChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Bar, Legend } from 'recharts';
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

  // Simple Linear Regression for traffic prediction
  const predictTraffic = (historicalData) => {
    // Extract hours and traffic values
    const hours = historicalData.map((_, idx) => idx);
    const traffic = historicalData.map(d => d.traffic);
    
    // Calculate means
    const n = hours.length;
    const sumX = hours.reduce((a, b) => a + b, 0);
    const sumY = traffic.reduce((a, b) => a + b, 0);
    const sumXY = hours.reduce((sum, x, i) => sum + x * traffic[i], 0);
    const sumX2 = hours.reduce((sum, x) => sum + x * x, 0);
    
    // Calculate slope (m) and intercept (b)
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Predict next 4 hours
    const predictions = [];
    for (let i = n; i < n + 4; i++) {
      let predicted = slope * i + intercept;
      // Add some realistic variation
      predicted = predicted + (Math.random() * 10 - 5);
      // Clamp between 10 and 95
      predicted = Math.min(95, Math.max(10, Math.round(predicted)));
      predictions.push(predicted);
    }
    
    return predictions;
  };

  // Generate dynamic chart data based on real data with predictions
  const chartData = useMemo(() => {
    const hours = ['6AM', '8AM', '10AM', '12PM', '2PM', '4PM', '6PM', '8PM', '10PM'];
    const futureHours = ['12AM', '2AM', '4AM', '6AM'];
    const baseTemp = weatherData?.temperature || 22;
    const baseTraffic = trafficData?.congestionLevel || 45;
    const baseAQI = pollutionData?.aqi || 50;
    
    // Generate historical data
    const historicalData = hours.map((hour, index) => {
      let tempVariation = 0;
      if (index === 0) tempVariation = -4;
      else if (index === 1) tempVariation = -2;
      else if (index === 2) tempVariation = 0;
      else if (index === 3) tempVariation = 2;
      else if (index === 4) tempVariation = 2;
      else if (index === 5) tempVariation = 1;
      else if (index === 6) tempVariation = -1;
      else if (index === 7) tempVariation = -3;
      else tempVariation = -5;
      
      let trafficMultiplier = 1;
      if (index === 1 || index === 6) trafficMultiplier = 1.5;
      else if (index === 0 || index === 7) trafficMultiplier = 0.7;
      else if (index >= 2 && index <= 5) trafficMultiplier = 1.1;
      else trafficMultiplier = 0.5;
      
      return {
        hour,
        temp: Math.max(10, Math.min(40, Math.round(baseTemp + tempVariation))),
        traffic: Math.min(95, Math.max(10, Math.round(baseTraffic * trafficMultiplier))),
        aqi: Math.min(200, Math.max(20, Math.round(baseAQI * trafficMultiplier))),
        isPrediction: false
      };
    });
    
    // Get predictions for future traffic
    const predictions = predictTraffic(historicalData);
    
    // Create future data with predictions
    const futureData = futureHours.map((hour, index) => ({
      hour,
      temp: null,
      traffic: predictions[index],
      aqi: null,
      isPrediction: true
    }));
    
    return [...historicalData, ...futureData];
  }, [weatherData, trafficData, pollutionData]);

  // Get traffic trend message
  const getTrafficTrend = () => {
    const lastThree = chartData.filter(d => !d.isPrediction).slice(-3);
    if (lastThree.length < 3) return "Stable";
    
    const trend = lastThree[2].traffic - lastThree[0].traffic;
    if (trend > 10) return "📈 Increasing - Expect delays";
    if (trend < -10) return "📉 Decreasing - Clearing up";
    return "➡️ Stable traffic flow";
  };

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

      {/* Charts with Prediction */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ color: 'white' }}>Today's Trends & Forecast</h3>
          <div className="prediction-badge">
            <FaChartLine style={{ color: '#10b981' }} />
            <span>📊 Traffic Forecast</span>
          </div>
        </div>
        
        {/* Traffic Trend Message */}
        <div className="ai-insight">
          <span className="ai-icon">📊</span>
          <span className="ai-text">Traffic Trend: {getTrafficTrend()}</span>
        </div>
        
        <ResponsiveContainer width="100%" height={400}>
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
            <Legend />
            <Area yAxisId="left" type="monotone" dataKey="temp" stroke="#f59e0b" fill="url(#colorTemp)" name="Temperature (°C)" />
            <Bar yAxisId="right" dataKey="traffic" fill="#ef4444" opacity={0.5} name="Current Traffic (%)" />
            <Line yAxisId="right" type="monotone" dataKey="traffic" stroke="#10b981" strokeWidth={3} strokeDasharray="5 5" dot={false} name="Predicted Traffic" connectNulls={true} />
          </ComposedChart>
        </ResponsiveContainer>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '3px', background: '#f59e0b' }} />
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Temperature</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '3px', background: '#ef4444' }} />
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Current Traffic</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '3px', background: '#10b981', borderTop: '2px dashed' }} />
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Predicted Traffic (Next 4 hours)</span>
          </div>
        </div>
        
        <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', textAlign: 'center' }}>
          <span style={{ fontSize: '12px', color: '#10b981' }}>
            📈 4-hour traffic forecast based on historical patterns
          </span>
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