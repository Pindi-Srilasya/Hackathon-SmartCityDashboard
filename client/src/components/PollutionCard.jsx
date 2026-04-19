import React from 'react';
import { FaLeaf, FaIndustry, FaCar, FaFire, FaWind, FaInfoCircle } from 'react-icons/fa';

const PollutionCard = ({ pollution }) => {
  const getAQIInfo = (aqi) => {
    if (!aqi) return { level: 'Unknown', color: '#6b7280', bg: 'rgba(107, 114, 128, 0.15)', message: 'Data unavailable', status: 'unknown' };
    if (aqi <= 50) return { level: 'Good', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', message: 'Air quality is satisfactory', status: 'good' };
    if (aqi <= 100) return { level: 'Moderate', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', message: 'Acceptable air quality', status: 'moderate' };
    if (aqi <= 150) return { level: 'Unhealthy for Sensitive', color: '#f97316', bg: 'rgba(249, 115, 22, 0.15)', message: 'Sensitive groups should reduce outdoor activity', status: 'unhealthy-sensitive' };
    if (aqi <= 200) return { level: 'Unhealthy', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', message: 'Everyone may experience health effects', status: 'unhealthy' };
    if (aqi <= 300) return { level: 'Very Unhealthy', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)', message: 'Health alert: everyone should avoid outdoor activity', status: 'very-unhealthy' };
    return { level: 'Hazardous', color: '#dc2626', bg: 'rgba(220, 38, 38, 0.15)', message: 'Emergency conditions: avoid all outdoor exposure', status: 'hazardous' };
  };

  const aqiInfo = getAQIInfo(pollution?.aqi);
  
  const pollutants = [
    { name: 'PM2.5', value: pollution?.pm25 || 0, unit: 'μg/m³', safe: 12, icon: FaIndustry, description: 'Fine particulate matter' },
    { name: 'PM10', value: pollution?.pm10 || 0, unit: 'μg/m³', safe: 50, icon: FaCar, description: 'Inhalable particles' },
    { name: 'NO₂', value: pollution?.no2 || 0, unit: 'ppb', safe: 53, icon: FaFire, description: 'Nitrogen dioxide' },
    { name: 'CO', value: pollution?.co || 0, unit: 'ppm', safe: 9, icon: FaWind, description: 'Carbon monoxide' },
  ];

  const getPollutantStatus = (value, safe) => {
    if (value <= safe) return { status: 'good', percent: (value / safe) * 100 };
    if (value <= safe * 2) return { status: 'moderate', percent: 100 };
    return { status: 'bad', percent: 100 };
  };

  return (
    <div className="glass-card" style={{ padding: '24px', height: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaLeaf style={{ color: '#10b981' }} />
          Air Quality Monitor
        </h3>
        <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px' }}>
          Real-time air pollution levels
        </p>
      </div>

      {/* Main AQI Display */}
      <div style={{
        ...aqiInfo.bg,
        padding: '20px',
        borderRadius: '20px',
        textAlign: 'center',
        marginBottom: '24px',
        border: `1px solid ${aqiInfo.color}30`
      }}>
        <div style={{ fontSize: '56px', fontWeight: '700', color: aqiInfo.color, marginBottom: '8px' }}>
          {pollution?.aqi || '--'}
        </div>
        <div style={{ fontSize: '18px', fontWeight: '600', color: aqiInfo.color, marginBottom: '8px' }}>
          {aqiInfo.level}
        </div>
        <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
          {aqiInfo.message}
        </div>
      </div>

      {/* Pollutants List */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '16px', color: 'rgba(255, 255, 255, 0.7)' }}>
          Key Pollutants
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {pollutants.map((pollutant, idx) => {
            const status = getPollutantStatus(pollutant.value, pollutant.safe);
            const Icon = pollutant.icon;
            return (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Icon style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }} />
                    <span style={{ fontSize: '13px', fontWeight: '500' }}>{pollutant.name}</span>
                    <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)' }}>{pollutant.description}</span>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>
                    {pollutant.value} <span style={{ fontSize: '10px', fontWeight: '400' }}>{pollutant.unit}</span>
                  </span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${status.percent}%`,
                    height: '100%',
                    background: status.status === 'good' ? '#10b981' : status.status === 'moderate' ? '#f59e0b' : '#ef4444',
                    borderRadius: '3px',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)' }}>Safe: {pollutant.safe} {pollutant.unit}</span>
                  {pollutant.value > pollutant.safe && (
                    <span style={{ fontSize: '10px', color: '#ef4444' }}>⚠️ Exceeds safe level</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Health Recommendation */}
      <div style={{
        padding: '16px',
        background: 'rgba(99, 102, 241, 0.1)',
        borderRadius: '12px',
        border: '1px solid rgba(99, 102, 241, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <FaInfoCircle style={{ color: '#818cf8', fontSize: '14px' }} />
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#818cf8' }}>Health Advisory</span>
        </div>
        <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', lineHeight: '1.5' }}>
          {aqiInfo.status === 'good' && 'Great day to be outside! Air quality is excellent for outdoor activities.'}
          {aqiInfo.status === 'moderate' && 'Sensitive individuals should consider limiting prolonged outdoor exertion.'}
          {aqiInfo.status === 'unhealthy-sensitive' && 'Children, elderly, and those with respiratory conditions should reduce outdoor activity.'}
          {aqiInfo.status === 'unhealthy' && 'Everyone should limit outdoor activities. Wear masks if going outside.'}
          {aqiInfo.status === 'very-unhealthy' && 'Avoid outdoor activities. Keep windows closed and use air purifiers.'}
          {aqiInfo.status === 'hazardous' && 'EMERGENCY: Stay indoors, wear N95 masks if you must go out.'}
          {aqiInfo.status === 'unknown' && 'Check back later for air quality data.'}
        </p>
      </div>
    </div>
  );
};

export default PollutionCard;