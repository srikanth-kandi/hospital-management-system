import { DataSource } from 'typeorm';
import { User } from './src/entities/User';
import { Hospital } from './src/entities/Hospital';
import { Department } from './src/entities/Department';
import { DoctorProfile } from './src/entities/DoctorProfile';
import { DoctorHospital } from './src/entities/DoctorHospital';
import { Availability } from './src/entities/Availability';
import { Appointment } from './src/entities/Appointment';

export default new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  synchronize: false, // Use migrations in production
  logging: true,
  entities: [
    User,
    Hospital,
    Department,
    DoctorProfile,
    DoctorHospital,
    Availability,
    Appointment
  ],
  migrations: ['src/migrations/*.ts'],
  subscribers: ['src/subscribers/*.ts'],
}); 