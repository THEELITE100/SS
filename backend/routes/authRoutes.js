const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  verifyEmail, 
  loginUser, 
  deleteAccount,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/verify-email', verifyEmail); 
router.post('/login', loginUser);
router.delete('/delete-account/:id', deleteAccount);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;