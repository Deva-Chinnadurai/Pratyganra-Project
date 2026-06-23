const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  createComplaint, 
  getMyComplaints, 
  getSingleComplaint,
  deleteComplaint,
  getAllPublicComplaints
} = require('../controllers/complaintController');

router.post('/', protect(['citizen', 'admin']), createComplaint);
router.get('/my', protect(['citizen', 'admin']), getMyComplaints);
router.get('/all', protect(['citizen', 'admin']), getAllPublicComplaints);
router.get('/:id', protect(['citizen', 'admin']), getSingleComplaint);
router.delete('/:id', protect('citizen'), deleteComplaint);

module.exports = router;
