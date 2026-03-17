const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, 'proto', 'auth.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const authProto = grpc.loadPackageDefinition(packageDefinition).auth;

const AUTH_HOST = process.env.AUTH_GRPC_HOST || 'auth-service';
const AUTH_PORT = process.env.AUTH_GRPC_PORT || '50052';

const client = new authProto.AuthService(
  `${AUTH_HOST}:${AUTH_PORT}`,
  grpc.credentials.createInsecure()
);

const validateToken = (token) => {
  return new Promise((resolve, reject) => {
    client.validateToken({ token }, (error, response) => {
      if (error) {
        console.error('[AuthClient] gRPC error:', error);
        return reject(error);
      }
      resolve(response);
    });
  });
};

const getUser = (userId) => {
  return new Promise((resolve, reject) => {
    client.getUser({ userId }, (error, response) => {
      if (error) {
        console.error('[AuthClient] gRPC error:', error);
        return reject(error);
      }
      resolve(response);
    });
  });
};

module.exports = { validateToken, getUser };
