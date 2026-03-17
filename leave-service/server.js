const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const leaveRoutes = require('./routes/leaveRoutes');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { startGrpcServer } = require('./grpc/server');
const { startConsumer } = require('./messaging/consumer');

const app = express();
const HTTP_PORT = process.env.PORT || 3003;
const GRPC_PORT = process.env.GRPC_PORT || 50053;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Leave Service is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use('/api', leaveRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(HTTP_PORT, () => {
  console.log(`[Leave-Service] HTTP server running on port ${HTTP_PORT}`);
  console.log(`[Leave-Service] Health: http://localhost:${HTTP_PORT}/health`);
});

startGrpcServer(GRPC_PORT);

// Delay consumer start to allow ActiveMQ to be ready
setTimeout(() => {
  startConsumer();
}, 5000);

module.exports = app;
