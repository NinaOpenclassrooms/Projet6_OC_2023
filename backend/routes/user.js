const express = require('express');
const router = express.Router();

// const signupLimiter = require('../middleware/rate-limit-config');

const userCtrl = require('../controllers/user');

router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router;