const Joi = require('joi');

const employeeSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  department: Joi.string().min(2).max(50).required(),
  role: Joi.string().min(2).max(50).required(),
  salary: Joi.number().min(0).required()
});

const validateEmployee = (req, res, next) => {
  const { error } = employeeSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: error.details[0].message
    });
  }
  next();
};

const validateEmployeeUpdate = (req, res, next) => {
  const updateSchema = Joi.object({
    name: Joi.string().min(2).max(50),
    email: Joi.string().email(),
    department: Joi.string().min(2).max(50),
    role: Joi.string().min(2).max(50),
    salary: Joi.number().min(0)
  }).min(1);

  const { error } = updateSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: error.details[0].message
    });
  }
  next();
};

module.exports = {
  validateEmployee,
  validateEmployeeUpdate
};