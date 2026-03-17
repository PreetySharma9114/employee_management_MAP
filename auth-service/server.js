const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const authRoutes = require('./routes/authRoutes');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { startGrpcServer } = require('./grpc/server');

const app = express();
const HTTP_PORT = process.env.PORT || 3002;
const GRPC_PORT = process.env.GRPC_PORT || 50052;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Auth Service is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use('/api', authRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(HTTP_PORT, () => {
  console.log(`[Auth-Service] HTTP server running on port ${HTTP_PORT}`);
  console.log(`[Auth-Service] Health: http://localhost:${HTTP_PORT}/health`);
});

startGrpcServer(GRPC_PORT);

module.exports = app;
