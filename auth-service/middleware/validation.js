const Joi = require('joi');

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required(),
  role: Joi.string().valid('admin', 'manager', 'employee').default('employee'),
  employeeId: Joi.string().optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const validateRegister = (req, res, next) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: error.details[0].message
    });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: error.details[0].message
    });
  }
  next();
};

const verifyOtpSchema = Joi.object({
  otpRequestId: Joi.string().optional(),
  email: Joi.string().email().optional(),
  otp: Joi.string().pattern(/^\d{6}$/).required()
}).custom((value, helpers) => {
  // Allow either otpRequestId OR email-based verification (no otpRequestId needed for Postman).
  if (!value.otpRequestId && !value.email) {
    return helpers.error('any.custom', { message: 'Either otpRequestId or email is required' });
  }
  return value;
});

const validateVerifyOtp = (req, res, next) => {
  const { error } = verifyOtpSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: error.details[0].message
    });
  }
  next();
};

module.exports = { validateRegister, validateLogin, validateVerifyOtp };
