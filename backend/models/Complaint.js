const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: [
      'Road Damage', 'Street Light Issue', 'Water Leakage', 
      'Garbage Collection', 'Drainage Problem', 'Electricity Problem', 
      'Public Park Issue', 'Other'
    ],
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Low',
  },
  imageUrl: {
    type: String, // URL from cloudinary or local storage
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
    default: 'Pending',
  },
  adminRemarks: {
    type: String,
  },
  resolvedAt: {
    type: Date,
  }
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
