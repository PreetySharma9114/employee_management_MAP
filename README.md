# Employee Management System

A comprehensive Employee Management System built with MERN stack (without MongoDB), Docker containers, and gRPC microservice architecture. This project demonstrates modern web development practices including containerization, microservices, and API integration.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │  gRPC Service   │
│   (React)       │◄──►│   (Express)     │◄──►│ (Payroll)       │
│   Port: 80      │    │   Port: 3001    │    │   Port: 50051   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
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
docker-compose up --build
```

3. **Access the application**:
- **Frontend**: http://localhost:80
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

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
- **Frontend**: Port 80 (nginx)
- **Backend**: Port 3001 (Express API)
- **gRPC Service**: Port 50051 (gRPC)

### Environment Variables
- `GRPC_HOST`: gRPC service hostname
- `GRPC_PORT`: gRPC service port
- `PORT`: Backend service port

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

1. **Test Backend API**:
```bash
curl http://localhost:3001/health
```

2. **Test Frontend**:
Visit http://localhost:80 in your browser

3. **Test gRPC Service**:
The gRPC service will be available on port 50051

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

1. **Port Conflicts**: Ensure ports 80, 3001, and 50051 are available
2. **Network Issues**: Docker network should be created automatically
3. **Build Failures**: Check if all dependencies are correctly installed
4. **Service Not Starting**: Check Docker logs with `docker-compose logs`

### Useful Commands
```bash
# View all running containers
docker-compose ps

# View logs for specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs grpc-service

# Stop all services
docker-compose down

# Rebuild and start
docker-compose up --build --force-recreate
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