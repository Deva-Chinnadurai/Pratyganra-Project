const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { submitFeedback, getFeedback, getAllFeedback } = require('../controllers/feedbackController');

// Specific routes MUST come before dynamic /:param routes
router.get('/admin/all', protect('admin'), getAllFeedback);
router.post('/', protect(['citizen', 'admin']), submitFeedback);
router.get('/:complaintId', protect(['citizen', 'admin']), getFeedback);

module.exports = router;
