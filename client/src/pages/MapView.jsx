import React, { useEffect, useRef, useState } from 'react';
import { useCity } from '../context/CityContext';

const MapView = () => {
  const mapContainerRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const { selectedCity, trafficData, pollutionData } = useCity();

  // Get coordinates based on city (using OpenStreetMap Nominatim)
  const getCityCoordinates = async (cityName) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          displayName: data[0].display_name
        };
      }
      return { lat: 40.7128, lng: -74.0060 }; // Default to NYC
    } catch (error) {
      console.error('Geocoding error:', error);
      return { lat: 40.7128, lng: -74.0060 };
    }
  };

  // Generate points of interest around the city
  const generateLocations = (centerLat, centerLng, cityName) => {
    const offset = 0.05; // About 5km offset
    return [
      { id: 1, name: `${cityName} Downtown`, lat: centerLat, lng: centerLng, traffic: trafficData?.congestionLevel || 45, aqi: pollutionData?.aqi || 50, type: 'business' },
      { id: 2, name: `${cityName} Central Park`, lat: centerLat + 0.04, lng: centerLng - 0.03, traffic: 25, aqi: 38, type: 'park' },
      { id: 3, name: `${cityName} Plaza`, lat: centerLat - 0.02, lng: centerLng + 0.02, traffic: 65, aqi: 55, type: 'tourist' },
      { id: 4, name: `${cityName} University`, lat: centerLat + 0.01, lng: centerLng - 0.04, traffic: 48, aqi: 42, type: 'arts' },
      { id: 5, name: `${cityName} Business District`, lat: centerLat - 0.03, lng: centerLng - 0.01, traffic: 72, aqi: 58, type: 'business' },
    ];
  };

  useEffect(() => {
    const loadMap = async () => {
      const L = await import('leaflet');
      
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      if (!mapContainerRef.current) return;

      // Get coordinates for the selected city
      const coords = await getCityCoordinates(selectedCity);
      const locations = generateLocations(coords.lat, coords.lng, selectedCity);

      // Remove existing map if any
      if (window.cityMap) {
        window.cityMap.remove();
      }

      const map = L.map(mapContainerRef.current).setView([coords.lat, coords.lng], 12);
      
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

    loadMap();

    return () => {
      if (window.cityMap) {
        window.cityMap.remove();
        window.cityMap = null;
      }
    };
  }, [selectedCity, trafficData, pollutionData]);

  return (
    <div>
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '28px', marginBottom: '8px', color: 'white' }}>Interactive City Map</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>
            Real-time traffic and air quality data for {selectedCity}
          </p>
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