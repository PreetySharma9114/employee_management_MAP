const express = require('express');
const router = express.Router();
const {
  register,
  login,
  verifyOtp,
  verifyToken,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} = require('../controllers/authController');
const { validateRegister, validateLogin, validateVerifyOtp } = require('../middleware/validation');

// Auth endpoints
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/verify-otp', validateVerifyOtp, verifyOtp);
router.get('/verify', verifyToken);

// User management (admin-level)
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

module.exports = router;
