// server/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const crypto = require('crypto');
require('dotenv').config();

// Signup function
exports.signup = async (req, res) => {
  try {
    const { fullname, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      fullname,
      email,
      password: hashedPassword,
    });

    await user.save();

    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = crypto.randomBytes(64).toString('hex');

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({ accessToken, userId: user._id, fullname: user.fullname, email: user.email });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login function
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = crypto.randomBytes(64).toString('hex');

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken, userId: user._id, fullname: user.fullname, email: user.email });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Refresh token function
exports.refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token required' });
  }

  try {
    // Simulating refresh token storage (in real case, use DB)
    const newAccessToken = jwt.sign({ userId: req.userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const newRefreshToken = crypto.randomBytes(64).toString('hex');

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Logout function
exports.logout = (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out' });
};

// Google authentication callback
const googleCallback = async (req, res) => {
  try {
    let user = await User.findOne({ googleId: req.user.googleId });

    if (!user) {
      user = new User({
        googleId: req.user.googleId,
        fullname: req.user.displayName,
        email: req.user.emails[0].value,
      });
      await user.save();
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.redirect(`${process.env.GOOGLE_REDIRECT_URL}/auth/success?token=${token}`); //GOOGLE_REDIRECT changed
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect(`${process.env.GOOGLE_REDIRECT_URL}/login?error=${encodeURIComponent(error.message)}`);
  }
};



// Export the googleCallback function
module.exports = {
  signup: exports.signup,
  login: exports.login,
  refreshToken: exports.refreshToken,
  logout: exports.logout,
  googleCallback,
  getUser: (req, res) => {
    res.json({ message: "User data retrieved successfully" });
}
};

exports.getUser = (req, res) => {
  console.log('getUser called');
  console.log('Request Headers:', req.headers);
  console.log('req.user:', req.user); // Check if req.user is populated
  try {
    res.json(req.user); // Send the user data from req.user
  } catch (error) {
    console.error('Error sending response:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
