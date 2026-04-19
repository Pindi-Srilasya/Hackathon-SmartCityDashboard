import React, { useState } from 'react';
import { FaCalendarAlt, FaMapMarkerAlt, FaClock, FaTicketAlt, FaChevronRight, FaStar, FaMusic, FaFutbol, FaPalette, FaLaptopCode } from 'react-icons/fa';

const EventsList = ({ events }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedEvent, setExpandedEvent] = useState(null);

  const getCategoryIcon = (category) => {
    const cat = category?.toLowerCase() || '';
    if (cat.includes('concert') || cat.includes('music')) return <FaMusic />;
    if (cat.includes('sport')) return <FaFutbol />;
    if (cat.includes('art') || cat.includes('exhibition')) return <FaPalette />;
    if (cat.includes('tech') || cat.includes('conference')) return <FaLaptopCode />;
    return <FaStar />;
  };

  const getCategoryColor = (category) => {
    const cat = category?.toLowerCase() || '';
    if (cat.includes('concert') || cat.includes('music')) return '#8b5cf6';
    if (cat.includes('sport')) return '#3b82f6';
    if (cat.includes('art') || cat.includes('exhibition')) return '#ec4899';
    if (cat.includes('tech') || cat.includes('conference')) return '#06b6d4';
    return '#f59e0b';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBD';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `${diffDays} days away`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const categories = [
    { id: 'all', name: 'All Events', count: events?.length || 0 },
    { id: 'Concert', name: 'Concerts', count: events?.filter(e => e.category?.toLowerCase().includes('concert')).length || 0 },
    { id: 'Sports', name: 'Sports', count: events?.filter(e => e.category?.toLowerCase().includes('sport')).length || 0 },
    { id: 'Arts', name: 'Arts & Culture', count: events?.filter(e => e.category?.toLowerCase().includes('art') || e.category?.toLowerCase().includes('exhibition')).length || 0 },
  ];

  const filteredEvents = selectedCategory === 'all' 
    ? events 
    : events?.filter(e => e.category?.toLowerCase().includes(selectedCategory.toLowerCase()));

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaCalendarAlt style={{ color: '#8b5cf6' }} />
          Upcoming City Events
        </h3>
        <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px' }}>
          Discover exciting events happening in your city
        </p>
      </div>

      {/* Category Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            style={{
              padding: '8px 20px',
              borderRadius: '20px',
              background: selectedCategory === cat.id ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255, 255, 255, 0.05)',
              border: selectedCategory === cat.id ? '1px solid rgba(139, 92, 246, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: selectedCategory === cat.id ? '600' : '400',
              transition: 'all 0.3s ease',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              if (selectedCategory !== cat.id) {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedCategory !== cat.id) {
                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
              }
            }}
          >
            {cat.name} ({cat.count})
          </button>
        ))}
      </div>

      {/* Events List */}
      <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
        {filteredEvents && filteredEvents.length > 0 ? (
          filteredEvents.slice(0, 8).map((event, idx) => {
            const categoryColor = getCategoryColor(event.category);
            const isExpanded = expandedEvent === idx;
            
            return (
              <div
                key={idx}
                style={{
                  padding: '16px',
                  marginBottom: '12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                }}
                onClick={() => setExpandedEvent(isExpanded ? null : idx)}
              >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  {/* Category Icon */}
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: `rgba(${parseInt(categoryColor.slice(1,3), 16)}, ${parseInt(categoryColor.slice(3,5), 16)}, ${parseInt(categoryColor.slice(5,7), 16)}, 0.15)`,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: categoryColor,
                    fontSize: '20px'
                  }}>
                    {getCategoryIcon(event.category)}
                  </div>
                  
                  {/* Event Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>
                        {event.title}
                      </h4>
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
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>
                        <FaMapMarkerAlt size={10} />
                        <span>{event.venue || event.location?.name || 'City Venue'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>
                        <FaClock size={10} />
                        <span>{formatDate(event.startTime || event.date)}</span>
                      </div>
                      {event.price && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#10b981' }}>
                          <FaTicketAlt size={10} />
                          <span>{event.price}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Expanded Description */}
                    {isExpanded && event.description && (
                      <div style={{
                        marginTop: '12px',
                        padding: '12px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: 'rgba(255, 255, 255, 0.6)',
                        lineHeight: '1.5'
                      }}>
                        {event.description}
                      </div>
                    )}
                  </div>
                  
                  <FaChevronRight style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.3)',
                    transition: 'transform 0.3s ease',
                    transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'
                  }} />
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255, 255, 255, 0.4)' }}>
            <FaCalendarAlt style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }} />
            <p>No events found</p>
            <p style={{ fontSize: '12px', marginTop: '8px' }}>Check back later for upcoming events!</p>
          </div>
        )}
      </div>

      {/* View More Button */}
      {filteredEvents && filteredEvents.length > 6 && (
        <button style={{
          width: '100%',
          marginTop: '20px',
          padding: '12px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          color: 'rgba(255, 255, 255, 0.7)',
          cursor: 'pointer',
          fontSize: '13px',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
        onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.05)'}>
          View More Events
        </button>
      )}
    </div>
  );
};

export default EventsList;