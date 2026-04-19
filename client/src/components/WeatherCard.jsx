import React from 'react';
import { FaTemperatureHigh, FaTint, FaWind, FaSun, FaCloudSun, FaCloudRain, FaSnowflake } from 'react-icons/fa';

const WeatherCard = ({ weather, realtime }) => {
  const currentWeather = realtime?.weather || weather;
  
  const getWeatherIcon = (condition) => {
    const conditionLower = condition?.toLowerCase() || '';
    if (conditionLower.includes('clear') || conditionLower.includes('sun')) 
      return { icon: FaSun, color: '#f59e0b', name: 'Sunny' };
    if (conditionLower.includes('cloud')) 
      return { icon: FaCloudSun, color: '#94a3b8', name: 'Cloudy' };
    if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) 
      return { icon: FaCloudRain, color: '#3b82f6', name: 'Rainy' };
    if (conditionLower.includes('snow')) 
      return { icon: FaSnowflake, color: '#06b6d4', name: 'Snowy' };
    return { icon: FaSun, color: '#f59e0b', name: 'Clear' };
  };

  const weatherIcon = getWeatherIcon(currentWeather?.condition);
  const IconComponent = weatherIcon.icon;

  return (
    <div className="glass-card" style={{ padding: '24px', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'rgba(255, 255, 255, 0.9)' }}>
          Current Weather
        </h3>
        {realtime && (
          <span style={{
            background: 'rgba(16, 185, 129, 0.2)',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              background: '#10b981',
              borderRadius: '50%',
              animation: 'pulse 2s ease-in-out infinite'
            }} />
            LIVE
          </span>
        )}
      </div>

      {/* Main Weather Display */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          width: '100px',
          height: '100px',
          margin: '0 auto 20px',
          background: `radial-gradient(circle, ${weatherIcon.color}20 0%, transparent 70%)`,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <IconComponent style={{ fontSize: '60px', color: weatherIcon.color }} />
        </div>
        <div style={{ fontSize: '56px', fontWeight: '700', marginBottom: '8px' }}>
          {currentWeather?.temperature || '--'}°C
        </div>
        <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '16px', textTransform: 'capitalize' }}>
          {currentWeather?.condition || weatherIcon.name}
        </div>
      </div>

      {/* Weather Details Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        paddingTop: '24px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <FaTemperatureHigh style={{ fontSize: '20px', color: '#ef4444', marginBottom: '8px' }} />
          <div style={{ fontSize: '20px', fontWeight: '600' }}>
            {currentWeather?.feelsLike || '--'}°
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>Feels Like</div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <FaTint style={{ fontSize: '20px', color: '#3b82f6', marginBottom: '8px' }} />
          <div style={{ fontSize: '20px', fontWeight: '600' }}>
            {currentWeather?.humidity || '--'}%
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>Humidity</div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <FaWind style={{ fontSize: '20px', color: '#06b6d4', marginBottom: '8px' }} />
          <div style={{ fontSize: '20px', fontWeight: '600' }}>
            {currentWeather?.windSpeed || '--'} <span style={{ fontSize: '12px' }}>km/h</span>
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>Wind Speed</div>
        </div>
      </div>

      {/* Real-time indicator animation */}
      {realtime && (
        <div style={{
          marginTop: '20px',
          padding: '12px',
          background: 'rgba(99, 102, 241, 0.1)',
          borderRadius: '12px',
          textAlign: 'center',
          fontSize: '12px',
          color: '#818cf8'
        }}>
          🔄 Updating in real-time every 10 seconds
        </div>
      )}
    </div>
  );
};

export default WeatherCard;