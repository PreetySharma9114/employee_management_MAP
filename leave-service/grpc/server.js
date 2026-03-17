const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const LeaveRequest = require('../models/LeaveRequest');

const PROTO_PATH = path.join(__dirname, 'proto', 'leave.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const leaveProto = grpc.loadPackageDefinition(packageDefinition).leave;

function getLeaveBalance(call, callback) {
  const { employeeId } = call.request;
  const balance = LeaveRequest.getBalance(employeeId);
  callback(null, balance);
}

function getEmployeeLeaves(call, callback) {
  const { employeeId } = call.request;
  const leaves = LeaveRequest.getByEmployeeId(employeeId).map((l) => ({
    id: l.id,
    employeeId: l.employeeId,
    type: l.type,
    startDate: l.startDate,
    endDate: l.endDate,
    status: l.status,
    reason: l.reason
  }));
  callback(null, { leaves });
}

function startGrpcServer(port) {
  const server = new grpc.Server();

  server.addService(leaveProto.LeaveService.service, {
    getLeaveBalance,
    getEmployeeLeaves
  });

  server.bindAsync(
    `0.0.0.0:${port}`,
    grpc.ServerCredentials.createInsecure(),
    (err, boundPort) => {
      if (err) {
        console.error('[Leave-gRPC] Failed to bind:', err);
        return;
      }
      console.log(`[Leave-gRPC] Server running on port ${boundPort}`);
    }
  );

  return server;
}

module.exports = { startGrpcServer };
