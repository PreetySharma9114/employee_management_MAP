const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { startConsumer } = require('./messaging/consumer');

const app = express();
const HTTP_PORT = process.env.PORT || 3006;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Notification Service is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.listen(HTTP_PORT, () => {
  console.log(`[Notification-Service] HTTP server running on port ${HTTP_PORT}`);
  console.log(`[Notification-Service] Health: http://localhost:${HTTP_PORT}/health`);
});

setTimeout(() => {
  startConsumer();
}, 5000);

module.exports = app;
