const express = require('express');
const Election = require('../models/Election');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all elections
router.get('/', async (req, res) => {
  try {
    const elections = await Election.find()
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });
    res.json(elections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single election
router.get('/:id', async (req, res) => {
  try {
    const election = await Election.findById(req.params.id)
      .populate('createdBy', 'username');
    
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }
    
    res.json(election);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create election (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const election = new Election({
      ...req.body,
      createdBy: req.userId
    });
    
    await election.save();
    res.status(201).json(election);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update election
router.put('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const election = await Election.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }
    
    res.json(election);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;