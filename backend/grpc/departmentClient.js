const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, 'proto', 'department.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const deptProto = grpc.loadPackageDefinition(packageDefinition).department;

const DEPT_HOST = process.env.DEPT_GRPC_HOST || 'department-service';
const DEPT_PORT = process.env.DEPT_GRPC_PORT || '50054';

const client = new deptProto.DepartmentService(
  `${DEPT_HOST}:${DEPT_PORT}`,
  grpc.credentials.createInsecure()
);

const getDepartment = (id) => {
  return new Promise((resolve, reject) => {
    client.getDepartment({ id }, (error, response) => {
      if (error) {
        console.error('[DeptClient] gRPC error:', error);
        return reject(error);
      }
      resolve(response);
    });
  });
};

const getAllDepartments = () => {
  return new Promise((resolve, reject) => {
    client.getAllDepartments({}, (error, response) => {
      if (error) {
        console.error('[DeptClient] gRPC error:', error);
        return reject(error);
      }
      resolve(response);
    });
  });
};

const departmentExists = (name) => {
  return new Promise((resolve, reject) => {
    client.departmentExists({ name }, (error, response) => {
      if (error) {
        console.error('[DeptClient] gRPC error:', error);
        return reject(error);
      }
      resolve(response);
    });
  });
};

module.exports = { getDepartment, getAllDepartments, departmentExists };
