import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';

const CityContext = createContext();

export const useCity = () => {
  const context = useContext(CityContext);
  if (!context) {
    throw new Error('useCity must be used within CityProvider');
  }
  return context;
};

export const CityProvider = ({ children }) => {
  const [selectedCity, setSelectedCity] = useState('New York');
  const [searchInput, setSearchInput] = useState('New York');
  const [weatherData, setWeatherData] = useState(null);
  const [trafficData, setTrafficData] = useState(null);
  const [pollutionData, setPollutionData] = useState(null);
  const [eventsData, setEventsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Fetch all data for a city
  const fetchAllData = async (city) => {
    setLoading(true);
    try {
      const [weather, traffic, pollution, events] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/weather?city=${city}`),
        axios.get(`${API_BASE_URL}/api/traffic`),
        axios.get(`${API_BASE_URL}/api/pollution`),
        axios.get(`${API_BASE_URL}/api/events?city=${city}`)
      ]);
      
      setWeatherData(weather.data.data);
      setTrafficData(traffic.data.data);
      setPollutionData(pollution.data.data);
      setEventsData(events.data.data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update city and fetch new data
  const updateCity = async (newCity) => {
    if (!newCity || newCity.trim() === '') return;
    setSelectedCity(newCity);
    await fetchAllData(newCity);
  };

  const searchCity = () => {
    if (searchInput.trim()) {
      updateCity(searchInput);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchAllData('New York');
  }, []);

  const value = {
    selectedCity,
    searchInput,
    setSearchInput,
    weatherData,
    trafficData,
    pollutionData,
    eventsData,
    loading,
    lastUpdate,
    updateCity,
    searchCity
  };

  return (
    <CityContext.Provider value={value}>
      {children}
    </CityContext.Provider>
  );
};