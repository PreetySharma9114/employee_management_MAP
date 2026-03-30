# Employee Management System

A comprehensive Employee Management System built with microservices (Node/Express + React), Docker containers, gRPC, and ActiveMQ (STOMP).

Key notes:
- All services use in-memory storage (no database) for demo/testing.
- REST traffic goes through `nginx-gateway` (API gateway).
- gRPC runs on internal service ports and is also mapped to host ports for Postman.
- ActiveMQ is used for event-driven messaging: domain events use `/topic/...`, OTP uses `/queue/auth.otp`.

## 🏗️ Architecture Overview

```
┌───────────────────────┐      ┌───────────────────────┐
│ Frontend (React)       │◄────►│ NGINX API Gateway      │
│ Served via nginx       │      │ http://localhost:8080 │
└───────────────────────┘      └───────────────────────┘
                 │
                 │ REST (/api/*)
                 ▼
┌────────────────────────────────────────────────────────────┐
│ Microservices (HTTP)                                        │
│ backend, auth-service, department-service, leave-service,  │
│ attendance-service, notification-service                   │
└────────────────────────────────────────────────────────────┘
                 │
                 │ gRPC (internal Docker network)
                 ▼
┌────────────────────────────────────────────────────────────┐
│ Microservices (gRPC)                                      │
│ grpc-service (Payroll), auth-service, leave-service,       │
│ department-service                                          │
└────────────────────────────────────────────────────────────┘

ActiveMQ (STOMP):
- Topics (domain events): /topic/employee.events, /topic/leave.events, /topic/attendance.events, /topic/department.events
- Queue (OTP): /queue/auth.otp
```

## 📋 Features

### Backend (Node.js + Express)
- **REST APIs** for employee management:
  - `GET /api/employees` - Get all employees
  - `GET /api/employees/:id` - Get employee by ID
  - `POST /api/employees` - Create new employee
  - `PUT /api/employees/:id` - Update employee
  - `DELETE /api/employees/:id` - Delete employee
  - `GET /api/employees/:id/salary` - Calculate salary using gRPC
- **Health check**: `GET /health`
- **MVC Architecture**: Controllers, Models, Routes
- **Validation**: Input validation using Joi
- **Error Handling**: Centralized error middleware
- **No Database**: In-memory array storage for simulation

### gRPC Microservice
- **Payroll Service**: Salary calculation with tax deduction
- **Protocol Buffers**: Type-safe service definitions
- **10% Tax Simulation**: Automatic tax calculation
- **Standalone Container**: Independent microservice

### Other HTTP Microservices
- **auth-service**: register/login, plus OTP verification (`/api/auth/verify-otp`)
- **department-service**: department CRUD (in-memory)
- **leave-service**: leave request CRUD + balances (in-memory)
- **attendance-service**: attendance CRUD (in-memory)
- **notification-service**: STOMP consumer that listens to ActiveMQ destinations

### OTP (ActiveMQ Queue)
- OTP is published to `/queue/auth.otp` (dev-friendly so you can inspect it via logs)

### Frontend (React)
- **Employee Management UI**: Add, view, delete employees
- **Salary Calculator**: Integration with gRPC service
- **Responsive Design**: Mobile-friendly interface
- **Real-time Updates**: Immediate UI feedback
- **Axios Integration**: HTTP client for API calls

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Git (for cloning)

### Installation and Running

1. **Clone the repository** (if applicable):
```bash
git clone <repository-url>
cd employee-management-system
```

2. **Run with Docker Compose**:
```bash
docker compose up -d --build
```

3. **Access the application**:
- **Frontend + REST API Gateway**: http://localhost:8080
- **Direct Frontend** (optional): http://localhost:80
- **Gateway Health Check**: http://localhost:8080/health

## 📁 Project Structure

```
employee-management-system/
├── backend/
│   ├── controllers/
│   │   └── employeeController.js
│   ├── models/
│   │   └── Employee.js
│   ├── routes/
│   │   └── employeeRoutes.js
│   ├── middleware/
│   │   ├── validation.js
│   │   └── errorHandler.js
│   ├── grpc/
│   │   ├── proto/
│   │   │   └── payroll.proto
│   │   └── grpcClient.js
│   ├── package.json
│   ├── Dockerfile
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── EmployeeForm.js
│   │   │   └── EmployeeList.js
│   │   ├── api.js
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
├── grpc-service/
│   ├── package.json
│   ├── payroll.proto
│   ├── Dockerfile
│   └── server.js
└── docker-compose.yml
```

## 🔧 Container Communication

### Network Architecture
All containers communicate through a dedicated Docker network `employee-network`:

1. **Frontend → Backend**: HTTP requests proxied via nginx
2. **Backend → gRPC**: gRPC calls over internal network
3. **Service Discovery**: Containers communicate using service names

### Port Mapping
- **NGINX API Gateway**: Host `8080`
- **Direct Frontend** (optional): Host `80`
- **Backend REST** (direct): Host `3001` (also reachable via gateway at `/api/*`)

gRPC ports are mapped to avoid Docker Desktop Mac conflicts:
- Payroll gRPC: host `15051` -> container `50051`
- Auth gRPC: host `15052` -> container `50052`
- Leave gRPC: host `15053` -> container `50053`
- Department gRPC: host `15054` -> container `50054`

### ActiveMQ Destinations (STOMP)
- Domain events (topics; broadcast):
  - `/topic/employee.events`
  - `/topic/leave.events`
  - `/topic/attendance.events`
  - `/topic/department.events`
- OTP delivery (queue; point-to-point):
  - `/queue/auth.otp`

### Environment Variables
- `GRPC_HOST` / `GRPC_PORT`: internal gRPC host/port that `backend` uses
- `PORT`: each HTTP service port (varies per service)
- `ACTIVEMQ_HOST` / `ACTIVEMQ_PORT` / `ACTIVEMQ_USER` / `ACTIVEMQ_PASS`: broker connection config
- `JWT_SECRET` / `JWT_EXPIRES_IN`: used by `auth-service`
- OTP demo settings:
  - `OTP_TTL_MS` (default 5 minutes)
  - `OTP_MAX_ATTEMPTS` (default 5)
  - `OTP_RETURN_TO_CLIENT` (default true in this repo)

## 📊 API Endpoints

### Employee Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees` | Get all employees |
| GET | `/api/employees/:id` | Get employee by ID |
| POST | `/api/employees` | Create new employee |
| PUT | `/api/employees/:id` | Update employee |
| DELETE | `/api/employees/:id` | Delete employee |
| GET | `/api/employees/:id/salary` | Calculate salary |

### Employee Data Model
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "department": "Engineering",
  "role": "Developer",
  "salary": 75000,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### gRPC Service Definition
```protobuf
service PayrollService {
  rpc CalculateSalary(SalaryRequest) returns (SalaryResponse);
}

message SalaryRequest {
  double baseSalary = 1;
}

message SalaryResponse {
  double finalSalary = 2;
  double taxDeduction = 3;
  double taxRate = 4;
}
```

## 🛠️ Development

### Running Individual Services

**Backend**:
```bash
cd backend
npm install
npm run dev
```

**Frontend**:
```bash
cd frontend
npm install
npm start
```

**gRPC Service**:
```bash
cd grpc-service
npm install
npm start
```

### Testing

1. **Test NGINX API Gateway**:
```bash
curl http://localhost:8080/health
```

2. **Test Frontend**:
Visit http://localhost:8080 in your browser

3. **Test gRPC Service (Postman/grpcurl)**:
gRPC services are mapped to host ports `15051-15054`.

## 🧪 Postman Testing (recommended)
- `EMS-Postman-Collection.json` (REST + gRPC requests)
- `EMS-Environment.json` (select environment `EMS Local`)

OTP login order (REST):
1. `POST /api/auth/login` -> gets OTP + saves `otp_code` automatically
2. `POST /api/auth/verify-otp` -> send `{ email, otp }` -> gets JWT token (`{{token}}`)

Employee flow order (optional):
1. Create Department -> Create Employee
2. Submit Leave -> Approve Leave
3. Check In/Out Attendance
4. Calculate Salary
5. Delete Employee (verifies ActiveMQ cascade cleanup)

## 🔍 Key Concepts Demonstrated

1. **Microservices Architecture**: Separate services for different responsibilities
2. **Containerization**: Docker containers for each service
3. **Service Communication**: HTTP and gRPC protocols
4. **API Design**: RESTful API patterns
5. **Frontend-Backend Integration**: React with Express API
6. **Protocol Buffers**: Type-safe service definitions
7. **Container Orchestration**: Docker Compose for multi-container apps
8. **Health Checks**: Service health monitoring
9. **Environment Configuration**: Configurable service settings

## 🔧 Troubleshooting

### Common Issues

1. **Port Conflicts**: Ensure ports `80`, `8080`, `3001`, and `15051-15054` are available
2. **Network Issues**: Docker network should be created automatically
3. **Build Failures**: Check if all dependencies are correctly installed
4. **Service Not Starting**: Check Docker logs with `docker compose logs`

### Useful Commands
```bash
# View all running containers
docker compose ps

# View logs for specific service
docker compose logs backend
docker compose logs frontend
docker compose logs grpc-service

# Stop all services
docker compose down

# Rebuild and start
docker compose up --build --force-recreate
```

## 📝 Learning Outcomes

This project demonstrates:
- Modern full-stack development practices
- Microservice architecture patterns
- Container-based deployment
- API design and integration
- gRPC service implementation
- React frontend development
- Docker Compose orchestration
- Service-to-service communication

## 🚀 Next Steps

Potential enhancements:
1. Add authentication/authorization
2. Implement database persistence
3. Add unit/integration tests
4. Implement logging and monitoring
5. Add CI/CD pipeline
6. Implement API versioning
7. Add caching layer
8. Implement rate limiting

---

**Happy Learning! 🎓**