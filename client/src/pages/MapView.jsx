import React, { useEffect, useRef, useState } from 'react';
import { FaMapMarkerAlt, FaExpand, FaCompress, FaSearch } from 'react-icons/fa';

const MapView = () => {
  const mapContainerRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchLocation, setSearchLocation] = useState('');

  const locations = [
    { id: 1, name: 'Downtown', lat: 40.7128, lng: -74.0060, traffic: 85, aqi: 68, type: 'business' },
    { id: 2, name: 'Central Park', lat: 40.7829, lng: -73.9654, traffic: 25, aqi: 38, type: 'park' },
    { id: 3, name: 'Times Square', lat: 40.7580, lng: -73.9855, traffic: 92, aqi: 72, type: 'tourist' },
    { id: 4, name: 'Brooklyn Bridge', lat: 40.7061, lng: -73.9969, traffic: 78, aqi: 58, type: 'landmark' },
    { id: 5, name: 'Financial District', lat: 40.7075, lng: -74.0113, traffic: 82, aqi: 65, type: 'business' },
    { id: 6, name: 'Williamsburg', lat: 40.7081, lng: -73.9570, traffic: 55, aqi: 48, type: 'arts' },
  ];

  useEffect(() => {
    const loadLeaflet = async () => {
      const L = await import('leaflet');
      
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      if (!mapContainerRef.current || mapLoaded) return;

      const map = L.map(mapContainerRef.current).setView([40.7128, -74.0060], 12);
      
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      window.cityMap = map;

      locations.forEach(location => {
        const color = location.traffic > 70 ? '#ef4444' : location.traffic > 40 ? '#f59e0b' : '#10b981';
        
        const customIcon = L.divIcon({
          html: `<div style="
            width: 12px;
            height: 12px;
            background: ${color};
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          "></div>`,
          iconSize: [12, 12],
          className: 'custom-marker'
        });

        const marker = L.marker([location.lat, location.lng], { icon: customIcon })
          .addTo(map)
          .bindPopup(`
            <div style="padding: 12px;">
              <h4 style="margin: 0 0 8px 0;">${location.name}</h4>
              <div>🚗 Traffic: ${location.traffic}%</div>
              <div>💨 AQI: ${location.aqi}</div>
            </div>
          `);

        marker.on('click', () => setSelectedLocation(location));
      });

      setMapLoaded(true);
    };

    loadLeaflet();

    return () => {
      if (window.cityMap) {
        window.cityMap.remove();
        window.cityMap = null;
      }
    };
  }, []);

  const handleSearch = () => {
    if (window.cityMap && searchLocation) {
      // Simple geocoding simulation
      const found = locations.find(l => l.name.toLowerCase().includes(searchLocation.toLowerCase()));
      if (found) {
        window.cityMap.setView([found.lat, found.lng], 14);
        setSelectedLocation(found);
      }
    }
  };

  return (
    <div>
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '28px', marginBottom: '8px', color: 'white' }}>Interactive City Map</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)' }}>Real-time traffic and air quality data by location</p>
          </div>
          <div className="search-box" style={{ width: '300px' }}>
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search location..."
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className="search-button" onClick={handleSearch}>Go</button>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '24px' }}>
        <div 
          ref={mapContainerRef} 
          style={{ height: '550px', width: '100%', borderRadius: '16px', overflow: 'hidden' }} 
        />
        
        {/* Legend */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '20px', padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', background: '#10b981', borderRadius: '50%' }} />
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>Light Traffic</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', background: '#f59e0b', borderRadius: '50%' }} />
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>Moderate Traffic</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '50%' }} />
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>Heavy Traffic</span>
          </div>
        </div>

        {/* Selected Location Details */}
        {selectedLocation && (
          <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(99,102,241,0.2)', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ color: 'white', marginBottom: '8px' }}>{selectedLocation.name}</h4>
                <div style={{ display: 'flex', gap: '16px', fontSize: '14px' }}>
                  <span>🚗 Traffic: <strong style={{ color: selectedLocation.traffic > 70 ? '#ef4444' : selectedLocation.traffic > 40 ? '#f59e0b' : '#10b981' }}>{selectedLocation.traffic}%</strong></span>
                  <span>💨 AQI: <strong>{selectedLocation.aqi}</strong></span>
                </div>
              </div>
              <button onClick={() => setSelectedLocation(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '18px' }}>✕</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapView;