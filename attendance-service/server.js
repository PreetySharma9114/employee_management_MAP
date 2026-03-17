const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const attendanceRoutes = require('./routes/attendanceRoutes');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { startConsumer } = require('./messaging/consumer');

const app = express();
const HTTP_PORT = process.env.PORT || 3004;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Attendance Service is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use('/api', attendanceRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(HTTP_PORT, () => {
  console.log(`[Attendance-Service] HTTP server running on port ${HTTP_PORT}`);
  console.log(`[Attendance-Service] Health: http://localhost:${HTTP_PORT}/health`);
});

setTimeout(() => {
  startConsumer();
}, 5000);

module.exports = app;
