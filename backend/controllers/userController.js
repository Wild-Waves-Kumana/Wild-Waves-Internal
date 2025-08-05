import User from '../models/user.js';

export const getAllUsers = async (req, res) => {
  try {
    // Select companyId as well for filtering
    const users = await User.find({}, 'roomname roomid username companyId').populate('companyId', '_id');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUser =  async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};