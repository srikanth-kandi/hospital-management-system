# Hospital Management System - Backend

A Node.js/Express.js backend with TypeScript and TypeORM for the Hospital Management System.

## Features

- Express.js server with TypeScript
- TypeORM with PostgreSQL database
- RESTful API endpoints
- User and Hospital management
- Authentication middleware (placeholder)
- Error handling middleware
- Validation with class-validator

## Project Structure

```
/backend
│
├── /src
│   ├── /config           # Database and app configuration
│   ├── /controllers      # Route handlers
│   ├── /middlewares      # Custom middlewares (auth, errors)
│   ├── /routes           # Route definitions
│   ├── /entities         # TypeORM entities (DB schema)
│   ├── /services         # Business logic
│   ├── /utils            # Utility functions/helpers
│   ├── /dtos             # DTOs for validation
│   └── app.ts            # Express app setup
│
├── ormconfig.ts         # TypeORM config
├── server.ts            # Server bootstrap file
├── env.example          # Environment variables template
├── tsconfig.json        # TypeScript configuration
├── nodemon.json         # Nodemon configuration
└── package.json
```

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment setup:**
   ```bash
   cp env.example .env
   ```
   Edit `.env` with your database credentials.

3. **Database setup:**
   - Make sure PostgreSQL is running
   - Create a database named `hospital_management`
   - Update the database credentials in `.env`

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## API Endpoints

### Health Check
- `GET /api/health` - Server health status

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Hospitals
- `GET /api/hospitals` - Get all hospitals
- `GET /api/hospitals/:id` - Get hospital by ID
- `POST /api/hospitals` - Create new hospital
- `PUT /api/hospitals/:id` - Update hospital
- `DELETE /api/hospitals/:id` - Delete hospital

## Scripts

- `npm run dev` - Start development server with nodemon
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests (placeholder)

## Environment Variables

Copy `env.example` to `.env` and configure:

```env
PORT=5000
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=yourpassword
POSTGRES_DB=hospital_management
``` 