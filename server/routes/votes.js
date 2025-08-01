const express = require('express');
const Vote = require('../models/Vote');
const Election = require('../models/Election');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Cast vote
router.post('/', auth, async (req, res) => {
  try {
    const { electionId, candidateId } = req.body;
    
    // Check if election exists and is active
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }
    
    const now = new Date();
    if (now < election.startDate || now > election.endDate) {
      return res.status(400).json({ message: 'Election is not active' });
    }
    
    // Check if user already voted
    const existingVote = await Vote.findOne({
      voter: req.userId,
      election: electionId
    });
    
    if (existingVote) {
      return res.status(400).json({ message: 'You have already voted' });
    }
    
    // Create vote
    const vote = new Vote({
      voter: req.userId,
      election: electionId,
      candidate: candidateId
    });
    
    await vote.save();
    
    // Update candidate vote count
    await Election.findOneAndUpdate(
      { "_id": electionId, "candidates._id": candidateId },
      { 
        $inc: { 
          "candidates.$.voteCount": 1,
          "totalVotes": 1
        }
      }
    );
    
    // Update user's voted elections
    await User.findByIdAndUpdate(req.userId, {
      $push: { hasVoted: { electionId } }
    });
    
    res.status(201).json({ message: 'Vote cast successfully' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already voted' });
    }
    res.status(500).json({ message: error.message });
  }
});

// Get user's voting history
router.get('/history', auth, async (req, res) => {
  try {
    const votes = await Vote.find({ voter: req.userId })
      .populate('election', 'title')
      .sort({ timestamp: -1 });
    res.json(votes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;