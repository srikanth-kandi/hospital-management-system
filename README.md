# 🏥 Hospital Management System

A comprehensive Hospital & Appointment Management System built with Node.js, TypeScript, React, and PostgreSQL. This system supports multiple user roles including Hospital Administrators, Doctors, and Patients with full appointment booking and management capabilities.

## 🌟 Features

### 👥 Multi-Role User System
- **Hospital Administrators**: Register hospitals, manage departments, view revenue statistics
- **Doctors**: Register profiles, associate with hospitals, manage availability, set consultation fees
- **Patients**: Register accounts, search doctors, book appointments, view consultation history

### 🏢 Hospital Management
- Hospital registration and profile management
- Department creation and management
- Doctor-hospital associations based on specializations
- Revenue tracking and consultation statistics

### 👨‍⚕️ Doctor Management
- Doctor profile registration with specializations
- Hospital association system
- Availability slot management (conflict-free)
- Consultation fee setting per hospital
- Earnings and consultation tracking

### 📅 Appointment System
- Advanced doctor search with filters (specialization, hospital, availability)
- Step-by-step appointment booking workflow
- Real-time availability checking
- Appointment history and status tracking
- Conflict-free scheduling

### 📊 Analytics & Reporting
- Revenue statistics for hospital admins
- Earnings reports for doctors
- Consultation history for patients
- Department-wise analytics

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 20.x
- **Framework**: Express.js 5.x
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL 14+
- **ORM**: TypeORM 0.3.x
- **Authentication**: JWT
- **Validation**: Class-validator
- **Documentation**: Swagger/OpenAPI
- **Process Manager**: PM2

### Frontend
- **Framework**: React 18.x
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 3.x
- **Routing**: React Router 6.x
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Notifications**: React Hot Toast
- **Icons**: Heroicons

### Infrastructure
- **Web Server**: Nginx
- **SSL**: Let's Encrypt
- **Deployment**: Ubuntu Server
- **Monitoring**: PM2 + Nginx logs

## 📁 Project Structure

```
hospital-management-system/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── entities/        # TypeORM entities
│   │   ├── services/        # Business logic
│   │   ├── routes/          # API routes
│   │   ├── middlewares/     # Custom middlewares
│   │   ├── config/          # Configuration files
│   │   ├── dtos/           # Data Transfer Objects
│   │   └── utils/          # Utility functions
│   ├── ecosystem.config.js  # PM2 configuration
│   ├── package.json
│   └── server.ts
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   └── package.json
├── deploy.sh              # Deployment script
├── setup-database.sh      # Database setup script
├── DEPLOYMENT_GUIDE.md    # Deployment documentation
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20.x or higher
- PostgreSQL 14+ or higher
- npm or yarn package manager

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/hospital-management-system.git
   cd hospital-management-system
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   
   # Create .env file
   cp env.example .env
   # Edit .env with your database credentials
   
   # Start development server
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   
   # Start development server
   npm start
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - API Documentation: http://localhost:3001/api-docs

## 🗄️ Database Setup

### Using the provided script:
```bash
./setup-database.sh
```

### Manual setup:
1. Install PostgreSQL
2. Create database and user
3. Update backend `.env` file with credentials
4. Run migrations: `npm run build && npm run start`

## 🌐 Production Deployment

### Quick Deployment
```bash
# Make scripts executable
chmod +x deploy.sh setup-database.sh

# Setup database
./setup-database.sh

# Deploy application
./deploy.sh
```

### Manual Deployment
See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed step-by-step instructions.

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### User Management
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Hospital Management
- `GET /api/hospitals` - Get all hospitals
- `POST /api/hospitals` - Create hospital
- `GET /api/hospitals/:id` - Get hospital by ID
- `PUT /api/hospitals/:id` - Update hospital
- `DELETE /api/hospitals/:id` - Delete hospital

### Doctor Management
- `GET /api/doctors` - Get all doctors
- `POST /api/doctors` - Create doctor profile
- `GET /api/doctors/:id` - Get doctor by ID
- `PUT /api/doctors/:id` - Update doctor
- `POST /api/doctors/:id/hospitals` - Associate with hospital

### Appointment Management
- `GET /api/appointments` - Get all appointments
- `POST /api/appointments` - Create appointment
- `GET /api/appointments/:id` - Get appointment by ID
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment

### Availability Management
- `GET /api/availability` - Get availability slots
- `POST /api/availability` - Create availability slot
- `PUT /api/availability/:id` - Update availability
- `DELETE /api/availability/:id` - Delete availability

### Department Management
- `GET /api/departments` - Get all departments
- `POST /api/departments` - Create department
- `GET /api/departments/:id` - Get department by ID
- `PUT /api/departments/:id` - Update department
- `DELETE /api/departments/:id` - Delete department

## 👥 User Roles & Permissions

### Hospital Administrator
- Register and manage hospitals
- Create and manage departments
- View revenue statistics
- Associate doctors with hospitals
- View consultation reports

### Doctor
- Register doctor profile
- Associate with hospitals based on specialization
- Manage availability slots
- Set consultation fees per hospital
- View earnings and consultation history
- Accept/reject appointment requests

### Patient
- Register patient account
- Search doctors by specialization, hospital, availability
- Book appointments with available time slots
- View appointment history
- Cancel appointments
- View consultation details

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=3001
HOST=localhost

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=hms_db

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:3000
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:3001
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📊 Monitoring & Logs

### PM2 Monitoring
```bash
# View processes
pm2 list

# Monitor resources
pm2 monit

# View logs
pm2 logs hms-backend
```

### Nginx Logs
```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

### Database Logs
```bash
sudo tail -f /var/log/postgresql/postgresql-*.log
```

## 🔄 Updates & Maintenance

### Application Updates
```bash
# Pull latest changes
git pull origin main

# Update backend
cd backend
npm install
npm run build
pm2 restart hms-backend

# Update frontend
cd frontend
npm install
npm run build
sudo cp -r build/* /var/www/html/
```

### Database Backups
```bash
# Manual backup
./backup-database.sh

# Restore from backup
./restore-database.sh backup_file.sql.gz
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check PostgreSQL service status
   - Verify database credentials in `.env`
   - Ensure database exists and user has permissions

2. **PM2 Process Not Starting**
   - Check PM2 logs: `pm2 logs hms-backend`
   - Verify environment variables
   - Check Node.js version compatibility

3. **Nginx Configuration Errors**
   - Test configuration: `sudo nginx -t`
   - Check syntax errors in site configurations
   - Verify SSL certificate validity

4. **Frontend Build Issues**
   - Clear node_modules and reinstall
   - Check TypeScript compilation errors
   - Verify all dependencies are installed

### Health Check
```bash
# Run comprehensive health check
./health-check.sh
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Srikanth Kandi**
- Email: admin@srikanthkandi.tech
- Website: https://srikanthkandi.tech

## 🙏 Acknowledgments

- Express.js team for the excellent framework
- React team for the amazing frontend library
- TypeORM team for the database ORM
- Tailwind CSS team for the utility-first CSS framework
- All contributors and users of this project

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Email: admin@srikanthkandi.tech
- Documentation: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

**🏥 Built with ❤️ for better healthcare management** 