# Hospital Management System - API Documentation

## 📚 Overview

This document provides comprehensive information about the Hospital Management System API, including authentication, endpoints, request/response formats, and usage examples.

## 🚀 Quick Start

### Base URL
```
http://localhost:5000/api
```

### API Documentation UI
Access the interactive Swagger documentation at:
```
http://localhost:5000/api-docs
```

### Health Check
```
GET /api/health
```

## 🔐 Authentication

The API uses JWT (JSON Web Token) authentication. Most endpoints require authentication except for registration and login.

### Getting a Token

1. **Register a user:**
```bash
POST /api/users/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "patient"
}
```

2. **Login to get token:**
```bash
POST /api/users/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "patient"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Using the Token

Include the token in the Authorization header:
```
Authorization: Bearer <your-token>
```

## 👥 User Management

### User Roles
- `hospital_admin` - Can manage hospitals and view analytics
- `doctor` - Can manage availability and view earnings
- `patient` - Can book appointments and view history

### Registration Examples

**Register a Hospital Admin:**
```json
{
  "name": "Admin User",
  "email": "admin@hospital.com",
  "password": "admin123",
  "role": "hospital_admin"
}
```

**Register a Doctor:**
```json
{
  "name": "Dr. Smith",
  "email": "smith@hospital.com",
  "password": "doctor123",
  "role": "doctor",
  "qualifications": "MBBS, MD",
  "specializations": ["Cardiology", "Internal Medicine"],
  "experience": 10
}
```

**Register a Patient:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "patient123",
  "role": "patient",
  "gender": "Female",
  "dob": "1990-01-01",
  "unique_id": "A123456789"
}
```

## 🏥 Hospital Management

### Create Hospital
```bash
POST /api/hospitals
{
  "name": "City General Hospital",
  "location": "123 Main Street, City",
  "created_by": "admin-user-id"
}
```

### Hospital Dashboard
```bash
GET /api/hospitals/{hospital-id}/dashboard
```

Response:
```json
{
  "totalConsultations": 150,
  "totalRevenue": 15000,
  "associatedDoctors": 25,
  "departmentsCount": 8
}
```

### Revenue Analytics
```bash
# Total revenue
GET /api/hospitals/{hospital-id}/revenue

# Revenue by doctors
GET /api/hospitals/{hospital-id}/revenue/doctors

# Revenue by departments
GET /api/hospitals/{hospital-id}/revenue/departments
```

## 👨‍⚕️ Doctor Management

### Associate Doctor with Hospital
```bash
POST /api/doctors/{doctor-id}/associate-hospital
{
  "hospital_id": "hospital-uuid",
  "consultation_fee": 500
}
```

### View Doctor Earnings
```bash
GET /api/doctors/{doctor-id}/earnings
```

Response:
```json
{
  "totalEarnings": 9000,
  "totalConsultations": 18,
  "earningsByHospital": [
    {
      "hospital_id": "uuid",
      "earnings": 6000,
      "consultations": 12
    }
  ]
}
```

## 📅 Availability Management

### Create Time Slot
```bash
POST /api/availability
{
  "doctor_id": "doctor-uuid",
  "hospital_id": "hospital-uuid",
  "start_time": "2024-01-15T10:00:00Z",
  "end_time": "2024-01-15T11:00:00Z"
}
```

### View Doctor Availability
```bash
GET /api/availability/doctor/{doctor-id}
```

## 📋 Appointment Management

### Book Appointment
```bash
POST /api/appointments
{
  "patient_id": "patient-uuid",
  "doctor_id": "doctor-uuid",
  "hospital_id": "hospital-uuid",
  "appointment_time": "2024-01-15T10:00:00Z",
  "amount_paid": 500
}
```

### View Patient History
```bash
GET /api/appointments/patient/{patient-id}
```

### View Doctor Schedule
```bash
GET /api/appointments/doctor/{doctor-id}
```

## 💰 Revenue Model

The system implements a 60/40 revenue split:
- **60%** goes to the doctor
- **40%** goes to the hospital

### Example Calculation
If a consultation costs $500:
- Doctor receives: $300 (60%)
- Hospital receives: $200 (40%)

## 🔍 Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "message": "Detailed error description"
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## 📊 Data Models

### User
```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "role": "hospital_admin|doctor|patient",
  "gender": "string",
  "dob": "date",
  "unique_id": "string",
  "created_at": "datetime"
}
```

### Hospital
```json
{
  "id": "uuid",
  "name": "string",
  "location": "string",
  "created_by": "uuid"
}
```

### Appointment
```json
{
  "id": "uuid",
  "patient_id": "uuid",
  "doctor_id": "uuid",
  "hospital_id": "uuid",
  "appointment_time": "datetime",
  "amount_paid": "number",
  "created_at": "datetime"
}
```

## 🛠️ Development

### Running the Server
```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

### Environment Variables
Create a `.env` file based on `env.example`:
```env
PORT=5000
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=yourpassword
POSTGRES_DB=hospital_management
JWT_SECRET=your-super-secret-jwt-key
```

## 📝 Testing the API

### Using Swagger UI
1. Start the server
2. Navigate to `http://localhost:5000/api-docs`
3. Click "Authorize" and enter your JWT token
4. Test endpoints directly from the UI

### Using cURL
```bash
# Health check
curl http://localhost:5000/api/health

# Register user
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","role":"patient"}'

# Login
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 🔗 API Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Health check | No |
| GET | `/docs` | API documentation | No |
| POST | `/users/register` | Register user | No |
| POST | `/users/login` | Login user | No |
| GET | `/users` | Get all users | Yes |
| GET | `/users/doctors` | Get all doctors | Yes |
| GET | `/users/patients` | Get all patients | Yes |
| GET | `/hospitals` | Get all hospitals | Yes |
| POST | `/hospitals` | Create hospital | Yes |
| GET | `/hospitals/{id}/dashboard` | Hospital dashboard | Yes |
| GET | `/hospitals/{id}/revenue` | Hospital revenue | Yes |
| GET | `/doctors/{id}/earnings` | Doctor earnings | Yes |
| POST | `/doctors/{id}/associate-hospital` | Associate doctor | Yes |
| POST | `/availability` | Create time slot | Yes |
| POST | `/appointments` | Book appointment | Yes |
| GET | `/appointments/patient/{id}` | Patient history | Yes |

## 📞 Support

For API support or questions, please refer to the Swagger documentation at `http://localhost:5000/api-docs` or contact the development team. 