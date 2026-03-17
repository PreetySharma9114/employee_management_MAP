const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, 'proto', 'payroll.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const payrollProto = grpc.loadPackageDefinition(packageDefinition).payroll;

const GRPC_HOST = process.env.GRPC_HOST || 'grpc-service';
const GRPC_PORT = process.env.GRPC_PORT || '50051';

const client = new payrollProto.PayrollService(
  `${GRPC_HOST}:${GRPC_PORT}`,
  grpc.credentials.createInsecure()
);

const calculateSalary = (baseSalary) => {
  return new Promise((resolve, reject) => {
    const request = { baseSalary };
    
    client.calculateSalary(request, (error, response) => {
      if (error) {
        console.error('gRPC Error:', error);
        reject(error);
        return;
      }
      
      resolve(response);
    });
  });
};

module.exports = {
  calculateSalary
};