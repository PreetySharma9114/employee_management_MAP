const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const PROTO_PATH = path.join(__dirname, 'proto', 'auth.proto');
const JWT_SECRET = process.env.JWT_SECRET || 'auth-service-secret-key';

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const authProto = grpc.loadPackageDefinition(packageDefinition).auth;

function validateToken(call, callback) {
  const { token } = call.request;

  if (!token) {
    return callback(null, { valid: false, error: 'Token is required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    callback(null, {
      valid: true,
      userId: String(decoded.id),
      email: decoded.email,
      role: decoded.role,
      error: ''
    });
  } catch (err) {
    callback(null, {
      valid: false,
      userId: '',
      email: '',
      role: '',
      error: err.message
    });
  }
}

function getUser(call, callback) {
  const { userId } = call.request;
  const user = User.getById(userId);

  if (!user) {
    return callback(null, { found: false });
  }

  callback(null, {
    found: true,
    id: user.id,
    email: user.email,
    role: user.role,
    employeeId: user.employeeId || ''
  });
}

function startGrpcServer(port) {
  const server = new grpc.Server();

  server.addService(authProto.AuthService.service, {
    validateToken,
    getUser
  });

  server.bindAsync(
    `0.0.0.0:${port}`,
    grpc.ServerCredentials.createInsecure(),
    (err, boundPort) => {
      if (err) {
        console.error('[Auth-gRPC] Failed to bind:', err);
        return;
      }
      console.log(`[Auth-gRPC] Server running on port ${boundPort}`);
    }
  );

  return server;
}

module.exports = { startGrpcServer };
