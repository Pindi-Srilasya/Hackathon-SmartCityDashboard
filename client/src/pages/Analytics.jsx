import React from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaChartLine, FaChartBar, FaChartPie } from 'react-icons/fa';

const Analytics = () => {
  // Sample data for charts
  const weeklyData = [
    { day: 'Mon', temperature: 22, pollution: 45, traffic: 55 },
    { day: 'Tue', temperature: 23, pollution: 52, traffic: 62 },
    { day: 'Wed', temperature: 24, pollution: 48, traffic: 58 },
    { day: 'Thu', temperature: 23, pollution: 55, traffic: 65 },
    { day: 'Fri', temperature: 22, pollution: 58, traffic: 72 },
    { day: 'Sat', temperature: 21, pollution: 42, traffic: 48 },
    { day: 'Sun', temperature: 20, pollution: 38, traffic: 35 },
  ];

  const pollutionSources = [
    { name: 'Vehicle Emissions', value: 45, color: '#ef4444' },
    { name: 'Industrial', value: 25, color: '#f59e0b' },
    { name: 'Construction', value: 15, color: '#10b981' },
    { name: 'Residential', value: 10, color: '#3b82f6' },
    { name: 'Other', value: 5, color: '#8b5cf6' },
  ];

  const hourlyTraffic = [
    { hour: '6AM', volume: 120, speed: 55 },
    { hour: '8AM', volume: 450, speed: 25 },
    { hour: '10AM', volume: 320, speed: 40 },
    { hour: '12PM', volume: 380, speed: 35 },
    { hour: '2PM', volume: 350, speed: 38 },
    { hour: '4PM', volume: 420, speed: 30 },
    { hour: '6PM', volume: 480, speed: 22 },
    { hour: '8PM', volume: 280, speed: 45 },
    { hour: '10PM', volume: 150, speed: 55 },
  ];

  return (
    <div>
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '28px', marginBottom: '8px', color: 'white' }}>Analytics Dashboard</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)' }}>Comprehensive urban data analysis and trends</p>
      </div>

      {/* Weekly Trends */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <FaChartLine style={{ color: '#6366f1', fontSize: '24px' }} />
          <h3 style={{ color: 'white' }}>Weekly Environmental Trends</h3>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" />
            <YAxis stroke="rgba(255,255,255,0.5)" />
            <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.9)', border: 'none', borderRadius: '8px' }} />
            <Legend />
            <Line type="monotone" dataKey="temperature" stroke="#f59e0b" strokeWidth={3} name="Temperature (°C)" dot={{ fill: '#f59e0b' }} />
            <Line type="monotone" dataKey="pollution" stroke="#ef4444" strokeWidth={3} name="Pollution (AQI)" dot={{ fill: '#ef4444' }} />
            <Line type="monotone" dataKey="traffic" stroke="#3b82f6" strokeWidth={3} name="Traffic (%)" dot={{ fill: '#3b82f6' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        {/* Traffic Analysis */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <FaChartBar style={{ color: '#3b82f6', fontSize: '24px' }} />
            <h3 style={{ color: 'white' }}>Hourly Traffic Volume</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hourlyTraffic}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="hour" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.9)', border: 'none', borderRadius: '8px' }} />
              <Bar dataKey="volume" fill="#3b82f6" name="Vehicle Count" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pollution Sources */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <FaChartPie style={{ color: '#10b981', fontSize: '24px' }} />
            <h3 style={{ color: 'white' }}>Pollution Sources</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pollutionSources}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pollutionSources.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.9)', border: 'none', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Speed vs Traffic Correlation */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '20px', color: 'white' }}>Speed vs Traffic Correlation</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={hourlyTraffic}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="hour" stroke="rgba(255,255,255,0.5)" />
            <YAxis stroke="rgba(255,255,255,0.5)" />
            <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.9)', border: 'none', borderRadius: '8px' }} />
            <Legend />
            <Area type="monotone" dataKey="volume" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Traffic Volume" />
            <Area type="monotone" dataKey="speed" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Avg Speed (km/h)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Analytics;