const Feedback = require('../models/Feedback');
const Complaint = require('../models/Complaint');

// Citizen submits feedback for a resolved complaint
exports.submitFeedback = async (req, res) => {
  try {
    const { complaintId, rating, comment } = req.body;

    console.log('[Feedback] submitFeedback called:', { complaintId, rating, userId: req.user?.id });

    if (!complaintId || !rating) {
      return res.status(400).json({ message: 'Complaint ID and rating are required.' });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      console.log('[Feedback] Complaint not found:', complaintId);
      return res.status(404).json({ message: 'Complaint not found' });
    }

    console.log('[Feedback] complaint.user:', complaint.user?.toString(), '| req.user.id:', req.user.id);

    // Allow if the user owns the complaint (compare as strings)
    if (complaint.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not your complaint — cannot submit feedback.' });
    }

    if (complaint.status !== 'Resolved') {
      return res.status(400).json({ message: 'Feedback can only be submitted for Resolved complaints.' });
    }

    // Upsert: allow re-rating
    const feedback = await Feedback.findOneAndUpdate(
      { complaint: complaintId },
      { user: req.user.id, rating: Number(rating), comment: comment || '' },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log('[Feedback] Saved:', feedback._id);
    res.status(201).json(feedback);
  } catch (error) {
    console.error('[Feedback] ERROR:', error.message);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Get feedback for a specific complaint
exports.getFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findOne({ complaint: req.params.complaintId });
    res.json(feedback || null);
  } catch (error) {
    console.error('[Feedback] getFeedback ERROR:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get all feedback for analytics
exports.getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('complaint', 'title category')
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
