import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaClock, FaTicketAlt } from 'react-icons/fa';
import { useCity } from '../context/CityContext';

const EventsPage = () => {
  const { selectedCity, eventsData, loading } = useCity();
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Events', icon: '🎪' },
    { id: 'Concert', name: 'Concerts', icon: '🎵' },
    { id: 'Sports', name: 'Sports', icon: '⚽' },
    { id: 'Festival', name: 'Festivals', icon: '🎉' },
    { id: 'Exhibition', name: 'Exhibitions', icon: '🎨' },
    { id: 'Conference', name: 'Conferences', icon: '💼' },
  ];

  useEffect(() => {
    filterEvents();
  }, [searchTerm, selectedCategory, eventsData]);

  const filterEvents = () => {
    let filtered = eventsData ? [...eventsData] : [];
    
    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => 
        event.category?.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }
    
    setFilteredEvents(filtered);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBD';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `${diffDays} days away`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getCategoryColor = (category) => {
    const cat = category?.toLowerCase() || '';
    if (cat.includes('concert')) return '#8b5cf6';
    if (cat.includes('sport')) return '#3b82f6';
    if (cat.includes('festival')) return '#ec4899';
    if (cat.includes('exhibition')) return '#f59e0b';
    if (cat.includes('conference')) return '#06b6d4';
    return '#10b981';
  };

  return (
    <div>
      {/* Header */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '28px', marginBottom: '8px', color: 'white' }}>City Events</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)' }}>Discover and explore events happening in {selectedCity}</p>
      </div>

      {/* Search Section */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <div className="search-box" style={{ flex: 1 }}>
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search events by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Category Filters */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '8px 20px',
                borderRadius: '40px',
                background: selectedCategory === cat.id ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                transition: 'all 0.3s ease'
              }}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
          Found {filteredEvents.length} events in {selectedCity}
        </p>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading events for {selectedCity}...</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px' }}>
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event, idx) => {
              const categoryColor = getCategoryColor(event.category);
              return (
                <div key={idx} className="glass-card" style={{ padding: '20px', transition: 'all 0.3s ease', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      background: `linear-gradient(135deg, ${categoryColor}40, ${categoryColor}20)`,
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '32px'
                    }}>
                      {event.category?.toLowerCase().includes('concert') ? '🎵' :
                       event.category?.toLowerCase().includes('sport') ? '⚽' :
                       event.category?.toLowerCase().includes('festival') ? '🎉' : '🎪'}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <h4 style={{ color: 'white', fontSize: '16px', fontWeight: '600' }}>{event.title}</h4>
                        <span style={{
                          background: `rgba(${parseInt(categoryColor.slice(1,3), 16)}, ${parseInt(categoryColor.slice(3,5), 16)}, ${parseInt(categoryColor.slice(5,7), 16)}, 0.2)`,
                          padding: '2px 10px',
                          borderRadius: '12px',
                          fontSize: '10px',
                          color: categoryColor
                        }}>
                          {event.category || 'Event'}
                        </span>
                      </div>
                      
                      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '12px', lineHeight: '1.4' }}>
                        {event.description?.substring(0, 100)}...
                      </p>
                      
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FaMapMarkerAlt size={10} />
                          <span>{event.venue || event.location?.name || 'City Venue'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FaClock size={10} />
                          <span>{formatDate(event.startTime || event.date)}</span>
                        </div>
                        {event.price && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FaTicketAlt size={10} />
                            <span style={{ color: '#10b981' }}>{event.price}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="glass-card" style={{ padding: '60px', textAlign: 'center', gridColumn: '1 / -1' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎭</div>
              <h3 style={{ color: 'white', marginBottom: '8px' }}>No events found</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)' }}>Try changing your search criteria</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EventsPage;