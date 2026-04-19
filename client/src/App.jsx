import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import MapView from './pages/MapView';
import EventsPage from './pages/EventsPage';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', name: '📊 Dashboard', icon: '📊' },
    { id: 'analytics', name: '📈 Analytics', icon: '📈' },
    { id: 'map', name: '🗺️ Map View', icon: '🗺️' },
    { id: 'events', name: '🎉 Events', icon: '🎉' },
  ];

  return (
    <div className="app-container">
      {/* Navigation Bar */}
      <nav className="glass-nav">
        <div className="nav-brand">
          <span className="brand-icon">🌆</span>
          <span className="brand-text">Smart City Dashboard</span>
        </div>
        <div className="nav-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-text">{tab.name}</span>
            </button>
          ))}
        </div>
        <div className="nav-right">
          <div className="live-badge">
            <span className="live-dot"></span>
            LIVE
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'analytics' && <Analytics />}
        {activeTab === 'map' && <MapView />}
        {activeTab === 'events' && <EventsPage />}
      </main>
    </div>
  );
}

export default App;