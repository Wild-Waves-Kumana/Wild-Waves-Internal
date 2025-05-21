import User from '../models/user.js';

export const loginUser = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  res.json({ message: 'Login successful' });
};

export const registerUser = async (req, res) => {
  const { username, password } = req.body;
  const exists = await User.findOne({ username });

  if (exists) {
    return res.status(400).json({ message: 'Username already exists' });
  }

  const user = new User({ username, password });
  await user.save();

  res.json({ message: 'User registered' });
};
