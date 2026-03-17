const Joi = require('joi');

const leaveRequestSchema = Joi.object({
  employeeId: Joi.string().required(),
  type: Joi.string().valid('annual', 'sick', 'casual', 'unpaid').required(),
  startDate: Joi.string().isoDate().required(),
  endDate: Joi.string().isoDate().required(),
  reason: Joi.string().min(5).max(500).required()
});

const leaveUpdateSchema = Joi.object({
  status: Joi.string().valid('pending', 'approved', 'rejected').required(),
  reviewNote: Joi.string().max(500).optional()
});

const validateLeaveRequest = (req, res, next) => {
  const { error } = leaveRequestSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: error.details[0].message
    });
  }
  next();
};

const validateLeaveUpdate = (req, res, next) => {
  const { error } = leaveUpdateSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: error.details[0].message
    });
  }
  next();
};

module.exports = { validateLeaveRequest, validateLeaveUpdate };
