const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: {
    type: String,
    enum: ['Concert', 'Sports', 'Festival', 'Exhibition', 'Conference', 'Emergency', 'Traffic']
  },
  location: {
    name: String,
    lat: Number,
    lng: Number,
    address: String
  },
  startTime: Date,
  endTime: Date,
  source: String,
  importance: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  imageUrl: String,
  attendees: Number,
  price: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

eventSchema.index({ startTime: 1 });
eventSchema.index({ category: 1 });

module.exports = mongoose.model('Event', eventSchema);