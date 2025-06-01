import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();


//log in
export const loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
    // 1. Check if user exists
        const user = await User.findOne({ username });
        if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    // 2. Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 3. Success
    res.json({ message: 'Login successful', user: { username: user.username, _id: user._id } });
    } 
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

//sign up
export const registerUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        const existingUser = await User.findOne({ username });
    if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
}

    const salt = await bcrypt.genSalt(10); // generate salt
    const hashedPassword = await bcrypt.hash(password, salt); // hash password

    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User created successfully' });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};