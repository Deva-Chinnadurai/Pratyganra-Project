const Complaint = require('../models/Complaint');

// Citizen: Create a Complaint
exports.createComplaint = async (req, res) => {
  try {
    const { title, description, category, address, priority, imageUrl } = req.body;

    if (!title || !description || !category || !address) {
      return res.status(400).json({ message: 'Title, description, category and address are required.' });
    }

    // Limit base64 image size (~3MB base64 = ~2MB file)
    if (imageUrl && imageUrl.length > 3 * 1024 * 1024) {
      return res.status(400).json({ message: 'Image is too large. Please upload an image smaller than 2MB.' });
    }

    const complaint = await Complaint.create({
      user: req.user.id,
      title,
      description,
      category,
      address,
      priority: priority || 'Low',
      imageUrl: imageUrl || ''
    });

    res.status(201).json(complaint);
  } catch (error) {
    console.error('createComplaint error:', error.message);
    res.status(500).json({ message: error.message || 'Failed to create complaint' });
  }
};

// Citizen: Get My Complaints
exports.getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Citizen: Get Single Complaint
exports.getSingleComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Ensure it belongs to the user or an admin checks it
    if (req.user.role !== 'admin' && complaint.user.toString() !== req.user.id) {
       return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Citizen: Delete specific complaint (Only if Pending)
exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    if (complaint.user.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized to delete' });
    if (complaint.status !== 'Pending') return res.status(400).json({ message: 'Only Pending complaints can be deleted' });

    await complaint.deleteOne();
    res.json({ message: 'Complaint deleted' });
  } catch(error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// All: Get public feed of complaints
exports.getAllPublicComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
