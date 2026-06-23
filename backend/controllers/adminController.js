const Complaint = require('../models/Complaint');
const User = require('../models/User');

// Get all complaints with basic filters
exports.getAllComplaints = async (req, res) => {
  try {
    const { status, category, search } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { _id: search.length === 24 ? search : null } // exact id match
      ].filter(cond => cond._id !== null || cond.title);
    }

    const complaints = await Complaint.find(query)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update Complaint Status & Remarks
exports.updateComplaint = async (req, res) => {
  try {
    const { status, adminRemarks } = req.body;
    let updateFields = { status, adminRemarks };

    if (status === 'Resolved') {
      updateFields.resolvedAt = new Date();
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    ).populate('user', 'name email');

    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Dashboard Analytics Data
exports.getAnalytics = async (req, res) => {
  try {
    const totalComplaints = await Complaint.countDocuments();
    const pendingCount = await Complaint.countDocuments({ status: 'Pending' });
    const inProgressCount = await Complaint.countDocuments({ status: 'In Progress' });
    const resolvedCount = await Complaint.countDocuments({ status: 'Resolved' });

    const categoriesAgg = await Complaint.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    const usersCount = await User.countDocuments({ role: 'citizen' });

    res.json({
      totalComplaints,
      statusCounts: {
        pending: pendingCount,
        inProgress: inProgressCount,
        resolved: resolvedCount,
      },
      categoryStats: categoriesAgg,
      totalCitizens: usersCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Admin: Get All Users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'citizen' }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Admin: Delete User (and implicitly cascade delete complaints, or keep them? We'll delete them to clean up)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    await Complaint.deleteMany({ user: user._id });
    await user.deleteOne();
    
    res.json({ message: 'User and their complaints removed.' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
