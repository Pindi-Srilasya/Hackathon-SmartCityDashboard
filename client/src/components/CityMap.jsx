import React, { useEffect, useRef, useState } from 'react';
import { FaMapMarkerAlt, FaExpand, FaCompress, FaLayerGroup, FaTemperatureHigh, FaTint, FaWind } from 'react-icons/fa';

const CityMap = ({ data }) => {
  const mapContainerRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapZoom, setMapZoom] = useState(12);

  // City locations with real coordinates
  const locations = [
    { 
      id: 1,
      name: 'Downtown', 
      lat: 40.7128, 
      lng: -74.0060, 
      type: 'business',
      traffic: data?.traffic?.congestionLevel || 45,
      aqi: data?.pollution?.aqi || 52,
      temp: data?.weather?.temperature || 22
    },
    { 
      id: 2,
      name: 'Central Park', 
      lat: 40.7829, 
      lng: -73.9654, 
      type: 'park',
      traffic: 25,
      aqi: 38,
      temp: 21
    },
    { 
      id: 3,
      name: 'Times Square', 
      lat: 40.7580, 
      lng: -73.9855, 
      type: 'tourist',
      traffic: 85,
      aqi: 68,
      temp: 23
    },
    { 
      id: 4,
      name: 'Brooklyn Bridge', 
      lat: 40.7061, 
      lng: -73.9969, 
      type: 'landmark',
      traffic: 72,
      aqi: 58,
      temp: 22
    },
    { 
      id: 5,
      name: 'Financial District', 
      lat: 40.7075, 
      lng: -74.0113, 
      type: 'business',
      traffic: 78,
      aqi: 62,
      temp: 22
    },
    { 
      id: 6,
      name: 'Williamsburg', 
      lat: 40.7081, 
      lng: -73.9570, 
      type: 'arts',
      traffic: 55,
      aqi: 48,
      temp: 22
    }
  ];

  useEffect(() => {
    // Load Leaflet dynamically
    const loadLeaflet = async () => {
      const L = await import('leaflet');
      
      // Fix marker icons
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      if (!mapContainerRef.current || mapLoaded) return;

      // Initialize map
      const map = L.map(mapContainerRef.current).setView([40.7128, -74.0060], mapZoom);
      
      // Add dark map tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors & CartoDB',
        subdomains: 'abcd',
        maxZoom: 19,
        minZoom: 10
      }).addTo(map);

      // Store map instance
      window.cityMap = map;

      // Add zoom control
      map.on('zoomend', () => {
        setMapZoom(map.getZoom());
      });

      // Add markers for each location
      locations.forEach(location => {
        // Create custom popup content
        const popupContent = document.createElement('div');
        popupContent.innerHTML = `
          <div style="padding: 12px; min-width: 200px;">
            <h4 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1a1a2e;">${location.name}</h4>
            <div style="font-size: 12px; color: #4a5568;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <span>🚗 Traffic:</span>
                <span style="font-weight: 600; color: ${getTrafficColor(location.traffic)}">${location.traffic}%</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <span>💨 Air Quality:</span>
                <span style="font-weight: 600; color: ${getAQIColor(location.aqi)}">${location.aqi} AQI</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>🌡️ Temperature:</span>
                <span style="font-weight: 600;">${location.temp}°C</span>
              </div>
            </div>
          </div>
        `;

        // Create custom marker with colored icon based on traffic
        const markerColor = getMarkerColor(location.traffic);
        const customIcon = L.divIcon({
          html: `<div style="
            width: 12px;
            height: 12px;
            background: ${markerColor};
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          "></div>`,
          iconSize: [12, 12],
          className: 'custom-marker'
        });

        const marker = L.marker([location.lat, location.lng], { icon: customIcon })
          .addTo(map)
          .bindPopup(popupContent);

        marker.on('click', () => {
          setSelectedLocation(location);
        });
      });

      // Add a heat layer overlay for traffic (simulated)
      const heatPoints = locations.map(loc => [loc.lat, loc.lng, loc.traffic / 100]);
      
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

  const getTrafficColor = (traffic) => {
    if (traffic < 30) return '#10b981';
    if (traffic < 60) return '#f59e0b';
    return '#ef4444';
  };

  const getAQIColor = (aqi) => {
    if (aqi <= 50) return '#10b981';
    if (aqi <= 100) return '#f59e0b';
    if (aqi <= 150) return '#f97316';
    return '#ef4444';
  };

  const getMarkerColor = (traffic) => {
    if (traffic < 30) return '#10b981';
    if (traffic < 60) return '#f59e0b';
    return '#ef4444';
  };

  const getLocationTypeIcon = (type) => {
    const icons = {
      business: '🏢',
      park: '🌳',
      tourist: '📸',
      landmark: '🏛️',
      arts: '🎨'
    };
    return icons[type] || '📍';
  };

  const zoomIn = () => {
    if (window.cityMap) {
      window.cityMap.zoomIn();
    }
  };

  const zoomOut = () => {
    if (window.cityMap) {
      window.cityMap.zoomOut();
    }
  };

  const centerMap = () => {
    if (window.cityMap) {
      window.cityMap.setView([40.7128, -74.0060], 12);
    }
  };

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaMapMarkerAlt style={{ color: '#ef4444' }} />
              Interactive City Map
            </h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px' }}>
              Real-time traffic and air quality data by location
            </p>
          </div>
          
          {/* Map Controls */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={zoomIn}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '8px',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px'
              }}
            >
              <FaExpand size={12} />
            </button>
            <button
              onClick={zoomOut}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '8px',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px'
              }}
            >
              <FaCompress size={12} />
            </button>
            <button
              onClick={centerMap}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '8px 12px',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <FaLayerGroup size={12} /> Center
            </button>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div 
        ref={mapContainerRef} 
        style={{ 
          height: '450px', 
          width: '100%', 
          borderRadius: '16px', 
          overflow: 'hidden',
          background: '#1a1a2e',
          marginBottom: '16px'
        }} 
      />

      {/* Map Legend */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        padding: '12px',
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>Traffic Level:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', background: '#10b981', borderRadius: '50%' }} />
            <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>Light</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', background: '#f59e0b', borderRadius: '50%' }} />
            <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>Moderate</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '50%' }} />
            <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>Heavy</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>📍 Click markers for details</span>
        </div>
      </div>

      {/* Selected Location Details */}
      {selectedLocation && (
        <div style={{
          marginTop: '16px',
          padding: '16px',
          background: 'rgba(99, 102, 241, 0.1)',
          borderRadius: '12px',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          animation: 'fadeInUp 0.3s ease-out'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>{getLocationTypeIcon(selectedLocation.type)}</span>
              <span style={{ fontWeight: '600', fontSize: '16px' }}>{selectedLocation.name}</span>
            </div>
            <button
              onClick={() => setSelectedLocation(null)}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.5)',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              ✕
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>Traffic</div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: getTrafficColor(selectedLocation.traffic) }}>
                {selectedLocation.traffic}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>Air Quality</div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: getAQIColor(selectedLocation.aqi) }}>
                {selectedLocation.aqi} AQI
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>Temperature</div>
              <div style={{ fontSize: '18px', fontWeight: '600' }}>{selectedLocation.temp}°C</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CityMap;