import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hospital Management System API',
      version: '1.0.0',
      description: 'A comprehensive API for managing hospitals, doctors, patients, and appointments with revenue tracking.',
      contact: {
        name: 'API Support',
        email: 'hello@srikanthkandi.tech'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { 
              type: 'string', 
              enum: ['hospital_admin', 'doctor', 'patient'] 
            },
            gender: { type: 'string' },
            dob: { type: 'string', format: 'date' },
            unique_id: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        Hospital: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            location: { type: 'string' },
            created_by: { type: 'string', format: 'uuid' }
          }
        },
        Department: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', description: 'Department name (unique within hospital)' },
            hospital_id: { type: 'string', format: 'uuid' },
            hospital: { 
              $ref: '#/components/schemas/Hospital',
              description: 'Hospital information (included in responses)'
            }
          },
          required: ['name', 'hospital_id']
        },
        DoctorProfile: {
          type: 'object',
          properties: {
            user_id: { type: 'string', format: 'uuid' },
            qualifications: { type: 'string' },
            specializations: { 
              type: 'array', 
              items: { type: 'string' } 
            },
            experience: { type: 'number' }
          }
        },
        DoctorHospital: {
          type: 'object',
          properties: {
            doctor_id: { type: 'string', format: 'uuid' },
            hospital_id: { type: 'string', format: 'uuid' },
            consultation_fee: { type: 'number' }
          }
        },
        Availability: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            doctor_id: { type: 'string', format: 'uuid' },
            hospital_id: { type: 'string', format: 'uuid' },
            start_time: { type: 'string', format: 'date-time' },
            end_time: { type: 'string', format: 'date-time' }
          }
        },
        Appointment: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            patient_id: { type: 'string', format: 'uuid' },
            doctor_id: { type: 'string', format: 'uuid' },
            hospital_id: { type: 'string', format: 'uuid' },
            appointment_time: { type: 'string', format: 'date-time' },
            amount_paid: { type: 'number' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    },
    tags: [
      {
        name: 'System',
        description: 'System health and documentation endpoints'
      },
      {
        name: 'Authentication',
        description: 'User registration and authentication endpoints'
      },
      {
        name: 'Users',
        description: 'User management operations'
      },
      {
        name: 'Hospitals',
        description: 'Hospital management and dashboard operations'
      },
      {
        name: 'Departments',
        description: 'Department management operations'
      },
      {
        name: 'Doctors',
        description: 'Doctor profile and hospital association operations'
      },
      {
        name: 'Availability',
        description: 'Doctor availability and time slot management'
      },
      {
        name: 'Appointments',
        description: 'Appointment booking and management'
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts']
};

export const specs = swaggerJsdoc(options); 