const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'strict',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function setTokenCookie(res, token) {
  res.cookie('token', token, COOKIE_OPTS);
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    const user = await User.create({ name, email, password });
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    setTokenCookie(res, token);
    res.status(201).json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    setTokenCookie(res, token);
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token', { path: '/' });
  res.json({ message: 'Logged out' });
});

router.get('/me', auth, async (req, res) => {
  res.json({ user: req.user });
});

router.put('/theme', auth, async (req, res) => {
  try {
    const { theme } = req.body;
    if (!['light', 'dark'].includes(theme)) {
      return res.status(400).json({ error: 'Theme must be light or dark' });
    }
    req.user.theme = theme;
    await req.user.save();
    res.json({ theme });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
