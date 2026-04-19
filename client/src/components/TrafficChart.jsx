import React from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Bar } from 'recharts';
import { FaCar, FaChartLine, FaExclamationTriangle } from 'react-icons/fa';

const TrafficChart = ({ traffic }) => {
  // Generate realistic traffic data for the day
  const generateTrafficData = () => {
    const hours = ['6 AM', '8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM', '10 PM'];
    return hours.map((hour, index) => {
      let congestion = 30;
      if (index === 1 || index === 6) congestion = 85; // Rush hours
      else if (index === 0 || index === 7) congestion = 60;
      else if (index > 1 && index < 6) congestion = 45;
      else congestion = 25;
      
      // Add randomness
      congestion += Math.random() * 15 - 7;
      
      return {
        hour,
        congestion: Math.min(100, Math.max(0, Math.floor(congestion))),
        speed: Math.floor(65 * (1 - congestion / 100)) + 15,
        volume: Math.floor(congestion * 12)
      };
    });
  };

  const data = generateTrafficData();
  const currentCongestion = traffic?.congestionLevel || 45;
  
  const getCongestionInfo = (level) => {
    if (level < 30) return { text: 'Light Traffic', color: '#10b981', icon: '🟢', message: 'Roads are clear' };
    if (level < 60) return { text: 'Moderate Traffic', color: '#f59e0b', icon: '🟡', message: 'Expect some delays' };
    if (level < 80) return { text: 'Heavy Traffic', color: '#ef4444', icon: '🔴', message: 'Significant delays expected' };
    return { text: 'Severe Congestion', color: '#dc2626', icon: '⚠️', message: 'Avoid unnecessary travel' };
  };

  const congestionInfo = getCongestionInfo(currentCongestion);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'rgba(0, 0, 0, 0.9)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <p style={{ color: 'white', marginBottom: '8px', fontWeight: 'bold' }}>{label}</p>
          <p style={{ color: '#f59e0b', fontSize: '12px' }}>
            Congestion: {payload[0].value}%
          </p>
          <p style={{ color: '#10b981', fontSize: '12px' }}>
            Speed: {payload[1]?.value || '--'} km/h
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaCar style={{ color: '#3b82f6' }} />
            Traffic Congestion Analysis
          </h3>
          <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px' }}>
            Real-time traffic flow and congestion patterns
          </p>
        </div>
        <div style={{
          background: `rgba(${congestionInfo.color === '#10b981' ? '16,185,129' : congestionInfo.color === '#f59e0b' ? '245,158,11' : '239,68,68'}, 0.15)`,
          padding: '8px 16px',
          borderRadius: '12px',
          borderLeft: `3px solid ${congestionInfo.color}`
        }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: congestionInfo.color }}>
            {currentCongestion}%
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
            {congestionInfo.text}
          </div>
        </div>
      </div>

      {/* Current Status Message */}
      <div style={{
        background: `rgba(${congestionInfo.color === '#10b981' ? '16,185,129' : congestionInfo.color === '#f59e0b' ? '245,158,11' : '239,68,68'}, 0.1)`,
        padding: '12px',
        borderRadius: '12px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <span style={{ fontSize: '20px' }}>{congestionInfo.icon}</span>
        <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
          {congestionInfo.message}
        </span>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={data}>
          <defs>
            <linearGradient id="colorCongestion" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorSpeed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis dataKey="hour" stroke="rgba(255, 255, 255, 0.5)" />
          <YAxis yAxisId="left" stroke="rgba(255, 255, 255, 0.5)" label={{ value: 'Congestion (%)', angle: -90, position: 'insideLeft', fill: 'rgba(255, 255, 255, 0.5)' }} />
          <YAxis yAxisId="right" orientation="right" stroke="rgba(255, 255, 255, 0.5)" label={{ value: 'Speed (km/h)', angle: 90, position: 'insideRight', fill: 'rgba(255, 255, 255, 0.5)' }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar yAxisId="left" dataKey="congestion" fill="#f59e0b" opacity={0.3} radius={[4, 4, 0, 0]} />
          <Area yAxisId="left" type="monotone" dataKey="congestion" stroke="#f59e0b" strokeWidth={2} fill="url(#colorCongestion)" />
          <Line yAxisId="right" type="monotone" dataKey="speed" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} activeDot={{ r: 6 }} />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', background: '#f59e0b', borderRadius: '2px' }} />
          <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>Congestion Level</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', background: '#10b981', borderRadius: '50%' }} />
          <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>Average Speed</span>
        </div>
      </div>

      {/* Incidents */}
      {traffic?.incidents && traffic.incidents.length > 0 && (
        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: 'rgba(239, 68, 68, 0.1)',
          borderRadius: '12px',
          border: '1px solid rgba(239, 68, 68, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <FaExclamationTriangle style={{ color: '#ef4444' }} />
            <span style={{ fontWeight: '600', fontSize: '14px' }}>Active Incidents</span>
          </div>
          {traffic.incidents.map((incident, idx) => (
            <div key={idx} style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '8px', paddingLeft: '20px' }}>
              • {incident.type} - {incident.location} ({incident.severity} severity)
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrafficChart;