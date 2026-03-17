const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const employeeRoutes = require('./routes/employeeRoutes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Employee Management API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use('/api', employeeRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API endpoints: http://localhost:${PORT}/api`);
});

module.exports = app;