const Joi = require('joi');

const checkInSchema = Joi.object({
  employeeId: Joi.string().required(),
  date: Joi.string().isoDate().required(),
  checkIn: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .required()
    .messages({ 'string.pattern.base': '"checkIn" must be in HH:MM format' }),
  notes: Joi.string().max(300).optional()
});

const checkOutSchema = Joi.object({
  checkOut: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .required()
    .messages({ 'string.pattern.base': '"checkOut" must be in HH:MM format' }),
  notes: Joi.string().max(300).optional()
});

const validateCheckIn = (req, res, next) => {
  const { error } = checkInSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: error.details[0].message
    });
  }
  next();
};

const validateCheckOut = (req, res, next) => {
  const { error } = checkOutSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: error.details[0].message
    });
  }
  next();
};

module.exports = { validateCheckIn, validateCheckOut };
