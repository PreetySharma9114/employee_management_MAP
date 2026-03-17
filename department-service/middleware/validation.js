const Joi = require('joi');

const departmentSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().min(5).max(500).required(),
  managerId: Joi.string().optional().allow('', null),
  budget: Joi.number().min(0).required()
});

const departmentUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  description: Joi.string().min(5).max(500),
  managerId: Joi.string().optional().allow('', null),
  budget: Joi.number().min(0)
}).min(1);

const validateDepartment = (req, res, next) => {
  const { error } = departmentSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: error.details[0].message
    });
  }
  next();
};

const validateDepartmentUpdate = (req, res, next) => {
  const { error } = departmentUpdateSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: error.details[0].message
    });
  }
  next();
};

module.exports = { validateDepartment, validateDepartmentUpdate };
