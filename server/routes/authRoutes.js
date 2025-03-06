// server/routes/authRoutes.js
const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware'); // Import authMiddleware

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  authController.googleCallback
);

// Add a failure redirect route for debugging
router.get('/login', (req, res) => {
  console.log('Google callback failure route');
  res.send('Google callback failure');
});

// const testMiddleware = (req, res, next) => {
//   console.log('test middleware running');
//   next();
// };

// router.get('/test2', testMiddleware, (req, res) => {
//   res.send('test 2 route works');
// });

console.log("this:",authMiddleware);
// Add /api/auth/user route
router.get('/user', authMiddleware, authController.getUser);
console.log("authController:", authController);
console.log("authController.getUser:", authController.getUser);

module.exports = router;