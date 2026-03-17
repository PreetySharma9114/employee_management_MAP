const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const Department = require('../models/Department');

const PROTO_PATH = path.join(__dirname, 'proto', 'department.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const deptProto = grpc.loadPackageDefinition(packageDefinition).department;

function getDepartment(call, callback) {
  const { id } = call.request;
  const dept = Department.getById(id);

  if (!dept) {
    return callback(null, { found: false });
  }

  callback(null, {
    found: true,
    id: dept.id,
    name: dept.name,
    description: dept.description,
    managerId: dept.managerId || '',
    budget: dept.budget
  });
}

function getAllDepartments(call, callback) {
  const departments = Department.getAll().map((d) => ({
    id: d.id,
    name: d.name,
    description: d.description,
    managerId: d.managerId || '',
    budget: d.budget
  }));
  callback(null, { departments });
}

function departmentExists(call, callback) {
  const { name } = call.request;
  const dept = Department.getByName(name);
  callback(null, { exists: !!dept, id: dept ? dept.id : '' });
}

function startGrpcServer(port) {
  const server = new grpc.Server();

  server.addService(deptProto.DepartmentService.service, {
    getDepartment,
    getAllDepartments,
    departmentExists
  });

  server.bindAsync(
    `0.0.0.0:${port}`,
    grpc.ServerCredentials.createInsecure(),
    (err, boundPort) => {
      if (err) {
        console.error('[Department-gRPC] Failed to bind:', err);
        return;
      }
      console.log(`[Department-gRPC] Server running on port ${boundPort}`);
    }
  );

  return server;
}

module.exports = { startGrpcServer };
