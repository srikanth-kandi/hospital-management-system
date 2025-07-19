import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Hospital } from '../entities/Hospital';
import { Department } from '../entities/Department';
import { DoctorProfile } from '../entities/DoctorProfile';
import { DoctorHospital } from '../entities/DoctorHospital';
import { Availability } from '../entities/Availability';
import { Appointment } from '../entities/Appointment';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  logging: process.env.DB_LOGGING === 'true',
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