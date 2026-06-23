const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  getAllComplaints, 
  updateComplaint, 
  getAnalytics,
  getAllUsers,
  deleteUser
} = require('../controllers/adminController');

// All routes require admin privilege
router.use(protect('admin'));

router.get('/complaints', getAllComplaints);
router.put('/complaints/:id', updateComplaint);
router.get('/analytics', getAnalytics);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);

module.exports = router;
