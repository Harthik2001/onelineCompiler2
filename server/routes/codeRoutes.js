// server/routes/codeRoutes.js
const express = require('express');
const passport = require('passport');
const codeController = require('../controllers/codeController');

const router = express.Router();

router.post('/execute', passport.authenticate('jwt', { session: false }), codeController.executeCode);
router.get('/history', passport.authenticate('jwt', { session: false }), codeController.getHistory);
router.post('/history/delete', passport.authenticate('jwt', { session: false }), codeController.deleteHistory);


module.exports = router;