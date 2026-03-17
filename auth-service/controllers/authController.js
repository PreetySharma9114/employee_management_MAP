const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { publish } = require('../messaging/producer');

const JWT_SECRET = process.env.JWT_SECRET || 'auth-service-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const SALT_ROUNDS = 10;

const register = async (req, res) => {
  try {
    const { email, password, role, employeeId } = req.body;

    if (User.getByEmail(email)) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = User.create({ email, passwordHash, role, employeeId });

    await publish('employee.events', 'user.created', { id: user.id, email: user.email, role: user.role }).catch(
      (err) => console.warn('[Auth] Could not publish user.created event:', err.message)
    );

    res.status(201).json({
      success: true,
      data: user,
      message: 'User registered successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = User.getByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const payload = { id: user.id, email: user.email, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.json({
      success: true,
      data: {
        token,
        expiresIn: JWT_EXPIRES_IN,
        user: User.getById(user.id)
      },
      message: 'Login successful'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Login failed' });
  }
};

const verifyToken = (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Token not provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = User.getById(decoded.id);

    res.json({
      success: true,
      data: { valid: true, user },
      message: 'Token is valid'
    });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Token is invalid or expired' });
  }
};

const getAllUsers = (req, res) => {
  try {
    const users = User.getAll();
    res.json({ success: true, data: users, count: users.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

const getUserById = (req, res) => {
  try {
    const user = User.getById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user' });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = User.update(req.params.id, req.body);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user, message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update user' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = User.delete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await publish('employee.events', 'user.deleted', { id: user.id, email: user.email }).catch(
      (err) => console.warn('[Auth] Could not publish user.deleted event:', err.message)
    );

    res.json({ success: true, data: user, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
};

module.exports = { register, login, verifyToken, getAllUsers, getUserById, updateUser, deleteUser };
