const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, 'payroll.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const payrollProto = grpc.loadPackageDefinition(packageDefinition).payroll;

function calculateSalary(call, callback) {
  const { baseSalary } = call.request;

  const TAX_RATE = 0.10;
  const taxDeduction = baseSalary * TAX_RATE;
  const finalSalary = baseSalary - taxDeduction;

  console.log(`Calculating salary: Base: ${baseSalary}, Tax: ${taxDeduction}, Final: ${finalSalary}`);

  callback(null, {
    finalSalary: finalSalary,
    taxDeduction: taxDeduction,
    taxRate: TAX_RATE
  });
}

function main() {
  const server = new grpc.Server();

  server.addService(payrollProto.PayrollService.service, {
    calculateSalary: calculateSalary
  });

  const PORT = process.env.GRPC_PORT || 50051;

  server.bindAsync(
    `0.0.0.0:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error('Failed to bind server:', err);
        return;
      }

      console.log(`gRPC Payroll Service running on port ${PORT}`);
      // ❌ server.start();  (remove this)
    }
  );
}

if (require.main === module) {
  main();
}

module.exports = { calculateSalary };