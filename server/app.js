

/// server/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('./config/passport'); // Ensure this is required
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');



const authRoutes = require('./routes/authRoutes');
const codeRoutes = require('./routes/codeRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// CORS configuration
app.use(
  cors({
    origin: process.env.process.env.FRONTEND_URL, 
    credentials: true,
  })
);




// Middleware
app.use(express.json());
app.use(cookieParser()); // Ensure cookie-parser is used




// Configure express-session
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret', // Use a strong secret
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Secure cookies in production
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: 'strict',
  },
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/code', codeRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
