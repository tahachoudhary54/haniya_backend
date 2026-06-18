import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// GET all users (Admin)
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// PUT update user verification status
router.put('/:id/verify', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.isVerified = true;
      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user' });
  }
});

export default router;
