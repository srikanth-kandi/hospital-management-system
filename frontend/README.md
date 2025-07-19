# Hospital Management System - Frontend

A modern, responsive React.js frontend for the Hospital Management System with comprehensive appointment booking and management capabilities.

## Features

### 🏥 **Multi-Role Dashboard**
- **Hospital Admin Dashboard**: Manage hospitals, departments, view revenue statistics
- **Doctor Dashboard**: Track earnings, manage availability, view appointments
- **Patient Dashboard**: Book appointments, view medical history, track spending

### 👥 **User Management**
- Role-based registration (Hospital Admin, Doctor, Patient)
- Secure authentication with JWT tokens
- Profile management and role-specific features

### 🏨 **Hospital Management**
- Hospital registration and management
- Department creation and management
- Doctor-hospital associations with consultation fees
- Revenue tracking and analytics

### 👨‍⚕️ **Doctor Management**
- Doctor registration with specializations
- Availability slot management
- Hospital associations with varying consultation fees
- Earnings tracking across multiple hospitals

### 📅 **Appointment System**
- Advanced appointment booking with step-by-step process
- Real-time availability checking
- Appointment history and status tracking
- Revenue sharing (60% doctor, 40% hospital)

### 🎨 **Modern UI/UX**
- Responsive design with Tailwind CSS
- Mobile-first approach
- Intuitive navigation and user experience
- Real-time notifications with toast messages

## Technology Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API communication
- **React Hot Toast** for notifications
- **Heroicons** for icons

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running on `http://localhost:3001`

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hospital-management-system/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Environment Variables

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:3001
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Layout.tsx      # Main layout with navigation
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── pages/              # Page components
│   ├── Login.tsx       # Login page
│   ├── Register.tsx    # Registration page
│   ├── HospitalDashboard.tsx
│   ├── DoctorDashboard.tsx
│   ├── PatientDashboard.tsx
│   ├── Hospitals.tsx   # Hospital listing
│   ├── Doctors.tsx     # Doctor listing
│   ├── Appointments.tsx # Appointment management
│   └── BookAppointment.tsx # Appointment booking
├── services/           # API services
│   └── api.ts         # API client and endpoints
├── types/              # TypeScript type definitions
│   └── index.ts       # All type interfaces
├── App.tsx            # Main app component
└── index.tsx          # Entry point
```

## API Integration

The frontend integrates with the backend API through the following services:

### Authentication
- `POST /users/login` - User login
- `POST /users/register` - User registration

### Hospitals
- `GET /hospitals` - Get all hospitals
- `POST /hospitals` - Create hospital
- `GET /hospitals/:id/dashboard` - Hospital dashboard stats
- `GET /hospitals/:id/doctors` - Hospital's associated doctors

### Doctors
- `GET /doctors` - Get all doctors
- `POST /doctors/associate` - Associate doctor with hospital
- `GET /doctors/:id/dashboard` - Doctor dashboard stats

### Appointments
- `GET /appointments` - Get all appointments
- `POST /appointments` - Book appointment
- `GET /appointments/patient/:id` - Patient's appointments
- `GET /appointments/doctor/:id` - Doctor's appointments

### Availability
- `GET /availability` - Get all availability slots
- `POST /availability` - Create availability slot
- `GET /availability/available/:doctorId/:hospitalId/:date` - Available slots

## User Roles & Permissions

### Hospital Admin
- Create and manage hospitals
- Create departments
- View hospital dashboard with revenue analytics
- Manage associated doctors

### Doctor
- Register with specializations and experience
- Associate with multiple hospitals
- Set consultation fees per hospital
- Manage availability slots
- View earnings dashboard

### Patient
- Register with personal information
- Browse hospitals and doctors
- Book appointments
- View appointment history
- Track medical spending

## Key Features

### 🔐 **Authentication & Authorization**
- JWT-based authentication
- Role-based access control
- Protected routes
- Automatic token refresh

### 📱 **Responsive Design**
- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly interface
- Progressive Web App ready

### 🔍 **Search & Filtering**
- Real-time search functionality
- Advanced filtering options
- Sort and pagination
- Dynamic results

### 📊 **Analytics & Reporting**
- Revenue tracking
- Appointment statistics
- Performance metrics
- Visual data representation

### 🔔 **Real-time Updates**
- Toast notifications
- Loading states
- Error handling
- Success feedback

## Development

### Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

### Code Style

- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Component-based architecture

### State Management

- React Context for global state
- Local state with useState/useEffect
- API state management with Axios
- Form state management

## Deployment

### Build for Production

```bash
npm run build
```

### Environment Configuration

Set the following environment variables for production:

```env
REACT_APP_API_URL=https://your-api-domain.com
```

### Deployment Options

- **Netlify**: Drag and drop the `build` folder
- **Vercel**: Connect your GitHub repository
- **AWS S3**: Upload build files to S3 bucket
- **Docker**: Use the provided Dockerfile

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ using React, TypeScript, and Tailwind CSS** 