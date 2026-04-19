import React, { useMemo } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaChartLine, FaChartBar, FaChartPie } from 'react-icons/fa';
import { useCity } from '../context/CityContext';

const Analytics = () => {
  const { selectedCity, weatherData, trafficData, pollutionData, loading } = useCity();

  // Generate weekly trends based on real current data (with realistic variations)
  const weeklyData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const baseTemp = weatherData?.temperature || 22;
    const basePollution = pollutionData?.aqi || 45;
    const baseTraffic = trafficData?.congestionLevel || 55;
    
    return days.map((day, index) => {
      const dayOffset = index === 5 || index === 6 ? -2 : 0;
      const tempVariation = Math.sin(index * Math.PI / 3) * 3;
      const pollutionVariation = index === 5 || index === 6 ? -10 : (index === 1 || index === 4 ? 5 : 0);
      const trafficVariation = index === 5 || index === 6 ? -20 : (index === 1 || index === 4 ? 10 : 0);
      
      return {
        day,
        temperature: Math.round(baseTemp + tempVariation + dayOffset),
        pollution: Math.max(20, Math.min(200, basePollution + pollutionVariation)),
        traffic: Math.max(15, Math.min(95, baseTraffic + trafficVariation))
      };
    });
  }, [weatherData, pollutionData, trafficData]);

  // Generate hourly traffic data based on real congestion
  const hourlyTraffic = useMemo(() => {
    const hours = ['6AM', '8AM', '10AM', '12PM', '2PM', '4PM', '6PM', '8PM', '10PM'];
    const baseCongestion = trafficData?.congestionLevel || 45;
    
    return hours.map((hour, index) => {
      let multiplier = 1;
      if (index === 1 || index === 6) multiplier = 1.5;
      else if (index === 0 || index === 7) multiplier = 0.8;
      else if (index >= 2 && index <= 5) multiplier = 1.1;
      else multiplier = 0.5;
      
      const volume = Math.floor(baseCongestion * multiplier * 8);
      const speed = Math.floor(65 * (1 - (baseCongestion * multiplier / 100))) + 10;
      
      return {
        hour,
        volume: Math.min(600, Math.max(50, volume)),
        speed: Math.min(65, Math.max(15, speed))
      };
    });
  }, [trafficData]);

  // Pollution sources based on real AQI
  const pollutionSources = useMemo(() => {
    const aqi = pollutionData?.aqi || 45;
    const vehicleFactor = Math.min(70, 30 + Math.floor(aqi / 5));
    
    return [
      { name: 'Vehicle Emissions', value: vehicleFactor, color: '#ef4444' },
      { name: 'Industrial', value: Math.max(10, Math.min(35, 25 - (vehicleFactor - 30) / 2)), color: '#f59e0b' },
      { name: 'Construction', value: 15, color: '#10b981' },
      { name: 'Residential', value: 10, color: '#3b82f6' },
      { name: 'Other', value: Math.max(5, 100 - vehicleFactor - 25 - 15 - 10), color: '#8b5cf6' },
    ];
  }, [pollutionData]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading analytics for {selectedCity}...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '28px', marginBottom: '8px', color: 'white' }}>Analytics Dashboard</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)' }}>
          Comprehensive urban data analysis and trends for {selectedCity}
        </p>
        <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
          <span>🌡️ Current Temp: {weatherData?.temperature || '--'}°C</span>
          <span>💨 Current AQI: {pollutionData?.aqi || '--'}</span>
          <span>🚗 Current Traffic: {trafficData?.congestionLevel || '--'}%</span>
        </div>
      </div>

      {/* Weekly Trends */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <FaChartLine style={{ color: '#6366f1', fontSize: '24px' }} />
          <h3 style={{ color: 'white' }}>Weekly Environmental Trends</h3>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={weeklyData} key={selectedCity}>
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
            <BarChart data={hourlyTraffic} key={`traffic-${selectedCity}-${trafficData?.congestionLevel}`}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="hour" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.9)', border: 'none', borderRadius: '8px' }} />
              <Bar dataKey="volume" fill="#3b82f6" name="Vehicle Count" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
            Peak congestion: {trafficData?.congestionLevel || '--'}% at rush hour
          </p>
        </div>

        {/* Pollution Sources */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <FaChartPie style={{ color: '#10b981', fontSize: '24px' }} />
            <h3 style={{ color: 'white' }}>Pollution Sources</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart key={`pollution-${selectedCity}-${pollutionData?.aqi}`}>
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
          <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
            Based on current AQI: {pollutionData?.aqi || '--'} - {pollutionData?.aqiLevel || 'Moderate'}
          </p>
        </div>
      </div>

      {/* Speed vs Traffic Correlation */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '20px', color: 'white' }}>Speed vs Traffic Correlation</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={hourlyTraffic} key={`speed-${selectedCity}-${trafficData?.congestionLevel}`}>
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