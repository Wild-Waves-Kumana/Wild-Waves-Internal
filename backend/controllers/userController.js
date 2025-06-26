import User from '../models/user.js';

export const getAllUsers = async (req, res) => {
  try {
    // Only select needed fields
    const users = await User.find({}, 'roomname roomid username');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};