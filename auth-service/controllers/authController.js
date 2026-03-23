const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { publish, publishQueue } = require('../messaging/producer');

const JWT_SECRET = process.env.JWT_SECRET || 'auth-service-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const SALT_ROUNDS = 10;

// ---------------------------------------------------------------------------
// OTP (in-memory) for demo/testing
// ---------------------------------------------------------------------------
// In a real system you would store OTPs in Redis/db and send via email/SMS.
const OTP_TTL_MS = parseInt(process.env.OTP_TTL_MS || `${5 * 60 * 1000}`, 10); // 5 minutes default
const OTP_MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS || '5', 10);
const OTP_RETURN_TO_CLIENT = String(process.env.OTP_RETURN_TO_CLIENT ?? 'true').toLowerCase() === 'true';
const otpRequests = new Map(); // otpRequestId -> { userId, email, role, otp, expiresAt, attempts }
const otpRequestsByEmail = new Map(); // email -> otpRequestId

function generateOtp() {
  // 6-digit OTP, zero padded
  return String(Math.floor(100000 + Math.random() * 900000));
}

function generateOtpRequestId() {
  return `otp_${Date.now()}_${Math.floor(Math.random() * 1e9)}`;
}

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

    const otpRequestId = generateOtpRequestId();
    const otp = generateOtp();
    const expiresAt = Date.now() + OTP_TTL_MS;

    otpRequests.set(otpRequestId, {
      userId: user.id,
      email: user.email,
      role: user.role,
      otp,
      expiresAt,
      attempts: 0
    });
    otpRequestsByEmail.set(email, otpRequestId);

    // Publish OTP to a queue so a single consumer can read it (practical for Postman testing).
    await publishQueue('auth.otp', 'otp.generated', {
      otpRequestId,
      userId: user.id,
      email: user.email,
      role: user.role,
      otp,
      expiresAt
    }).catch((err) => console.warn('[Auth] Could not publish otp.generated event:', err.message));

    res.json({
      success: true,
      data: {
        otpRequestId,
        ...(OTP_RETURN_TO_CLIENT ? { otp } : {}),
        expiresIn: '5m',
        user: User.getById(user.id)
      },
      message: 'OTP sent. Verify OTP to complete login.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Login failed' });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { otpRequestId, email, otp } = req.body;

    let request = otpRequestId ? otpRequests.get(otpRequestId) : null;
    if (!request && email) {
      const rid = otpRequestsByEmail.get(email);
      if (rid) request = otpRequests.get(rid);
    }
    if (!request) {
      return res.status(400).json({ success: false, message: 'Invalid otpRequestId/email' });
    }

    if (Date.now() > request.expiresAt) {
      otpRequests.delete(otpRequestId);
      return res.status(401).json({ success: false, message: 'OTP expired' });
    }

    request.attempts += 1;
    if (request.attempts > OTP_MAX_ATTEMPTS) {
      otpRequests.delete(otpRequestId);
      return res.status(429).json({ success: false, message: 'Too many OTP attempts' });
    }

    if (String(otp) !== String(request.otp)) {
      return res.status(401).json({ success: false, message: 'Invalid OTP' });
    }

    // OTP verified => issue JWT
    // If verifying by email, otpRequestId may be missing in the request body.
    if (otpRequestId) otpRequests.delete(otpRequestId);
    if (request.email) {
      const rid = otpRequestsByEmail.get(request.email);
      if (rid) otpRequests.delete(rid);
      otpRequestsByEmail.delete(request.email);
    }

    const payload = { id: request.userId, email: request.email, role: request.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    await publish('auth.otp', 'otp.verified', {
      otpRequestId,
      userId: request.userId,
      email: request.email
    }).catch((err) => console.warn('[Auth] Could not publish otp.verified event:', err.message));

    res.json({
      success: true,
      data: {
        token,
        expiresIn: JWT_EXPIRES_IN,
        user: User.getById(request.userId)
      },
      message: 'OTP verified. Login successful.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'OTP verification failed' });
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

module.exports = { register, login, verifyOtp, verifyToken, getAllUsers, getUserById, updateUser, deleteUser };
