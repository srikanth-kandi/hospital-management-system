import { AppDataSource } from '../config/data-source';
import { User, UserRole } from '../entities/User';
import { Hospital } from '../entities/Hospital';
import { Department } from '../entities/Department';
import { DoctorProfile } from '../entities/DoctorProfile';
import { DoctorHospital } from '../entities/DoctorHospital';
import { Availability } from '../entities/Availability';
import { Appointment } from '../entities/Appointment';
import * as bcrypt from 'bcryptjs';

export class MockDataService {
  private userRepository = AppDataSource.getRepository(User);
  private hospitalRepository = AppDataSource.getRepository(Hospital);
  private departmentRepository = AppDataSource.getRepository(Department);
  private doctorProfileRepository = AppDataSource.getRepository(DoctorProfile);
  private doctorHospitalRepository = AppDataSource.getRepository(DoctorHospital);
  private availabilityRepository = AppDataSource.getRepository(Availability);
  private appointmentRepository = AppDataSource.getRepository(Appointment);

  async seedMockData() {
    try {
      console.log('🌱 Starting mock data seeding...');

      // Check if data already exists
      const existingUsers = await this.userRepository.count();
      if (existingUsers > 0) {
        console.log('📊 Database already contains data, skipping seeding...');
        return;
      }

      // Create Hospital Admin
      const adminPassword = await bcrypt.hash('admin123', 10);
      const admin = this.userRepository.create({
        name: 'Hospital Admin',
        email: 'admin@hms.com',
        password: adminPassword,
        role: UserRole.HOSPITAL_ADMIN
      });
      const savedAdmin = await this.userRepository.save(admin);
      console.log('✅ Created Hospital Admin');

      // Create Hospitals
      const hospitals = [
        {
          name: 'City General Hospital',
          location: '123 Main Street, Downtown, City',
          created_by: savedAdmin.id
        },
        {
          name: 'Metropolitan Medical Center',
          location: '456 Oak Avenue, Uptown, City',
          created_by: savedAdmin.id
        },
        {
          name: 'Community Health Clinic',
          location: '789 Pine Road, Suburb, City',
          created_by: savedAdmin.id
        }
      ];

      const savedHospitals = [];
      for (const hospitalData of hospitals) {
        const hospital = this.hospitalRepository.create(hospitalData);
        const savedHospital = await this.hospitalRepository.save(hospital);
        savedHospitals.push(savedHospital);
        console.log(`✅ Created Hospital: ${hospitalData.name}`);
      }

      // Create Departments for each hospital
      const departmentNames = ['Cardiology', 'Orthopedics', 'Pediatrics', 'Neurology', 'Oncology', 'Emergency Medicine'];
      
      for (const hospital of savedHospitals) {
        for (let i = 0; i < 4; i++) {
          const department = this.departmentRepository.create({
            name: departmentNames[i],
            hospital_id: hospital.id
          });
          await this.departmentRepository.save(department);
        }
        console.log(`✅ Created departments for ${hospital.name}`);
      }

      // Create Doctors
      const doctors = [
        {
          name: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@hms.com',
          password: await bcrypt.hash('doctor123', 10),
          role: UserRole.DOCTOR,
          gender: 'Female',
          dob: new Date('1980-05-15'),
          qualifications: 'MBBS, MD (Cardiology)',
          specializations: ['Cardiology', 'Internal Medicine'],
          experience: 12
        },
        {
          name: 'Dr. Michael Chen',
          email: 'michael.chen@hms.com',
          password: await bcrypt.hash('doctor123', 10),
          role: UserRole.DOCTOR,
          gender: 'Male',
          dob: new Date('1975-08-22'),
          qualifications: 'MBBS, MS (Orthopedics)',
          specializations: ['Orthopedics', 'Sports Medicine'],
          experience: 15
        },
        {
          name: 'Dr. Emily Rodriguez',
          email: 'emily.rodriguez@hms.com',
          password: await bcrypt.hash('doctor123', 10),
          role: UserRole.DOCTOR,
          gender: 'Female',
          dob: new Date('1985-03-10'),
          qualifications: 'MBBS, MD (Pediatrics)',
          specializations: ['Pediatrics', 'Child Health'],
          experience: 8
        },
        {
          name: 'Dr. David Kim',
          email: 'david.kim@hms.com',
          password: await bcrypt.hash('doctor123', 10),
          role: UserRole.DOCTOR,
          gender: 'Male',
          dob: new Date('1978-11-30'),
          qualifications: 'MBBS, MD (Neurology)',
          specializations: ['Neurology', 'Neurosurgery'],
          experience: 14
        }
      ];

      const savedDoctors = [];
      for (const doctorData of doctors) {
        const { qualifications, specializations, experience, ...userData } = doctorData;
        
        const doctor = this.userRepository.create(userData);
        const savedDoctor = await this.userRepository.save(doctor);
        
        const doctorProfile = this.doctorProfileRepository.create({
          user_id: savedDoctor.id,
          qualifications,
          specializations,
          experience
        });
        await this.doctorProfileRepository.save(doctorProfile);
        
        savedDoctors.push(savedDoctor);
        console.log(`✅ Created Doctor: ${doctorData.name}`);
      }

      // Associate doctors with hospitals
      const doctorHospitalData = [
        { doctor: savedDoctors[0], hospital: savedHospitals[0], fee: 800 },
        { doctor: savedDoctors[0], hospital: savedHospitals[1], fee: 750 },
        { doctor: savedDoctors[1], hospital: savedHospitals[0], fee: 600 },
        { doctor: savedDoctors[1], hospital: savedHospitals[2], fee: 550 },
        { doctor: savedDoctors[2], hospital: savedHospitals[1], fee: 500 },
        { doctor: savedDoctors[2], hospital: savedHospitals[2], fee: 450 },
        { doctor: savedDoctors[3], hospital: savedHospitals[0], fee: 900 },
        { doctor: savedDoctors[3], hospital: savedHospitals[1], fee: 850 }
      ];

      for (const data of doctorHospitalData) {
        const doctorHospital = this.doctorHospitalRepository.create({
          doctor_id: data.doctor.id,
          hospital_id: data.hospital.id,
          consultation_fee: data.fee
        });
        await this.doctorHospitalRepository.save(doctorHospital);
        console.log(`✅ Associated ${data.doctor.name} with ${data.hospital.name} (Fee: $${data.fee})`);
      }

      // Create Patients
      const patients = [
        {
          name: 'John Smith',
          email: 'john.smith@example.com',
          password: await bcrypt.hash('patient123', 10),
          role: UserRole.PATIENT,
          gender: 'Male',
          dob: new Date('1990-07-12'),
          unique_id: 'A123456789'
        },
        {
          name: 'Maria Garcia',
          email: 'maria.garcia@example.com',
          password: await bcrypt.hash('patient123', 10),
          role: UserRole.PATIENT,
          gender: 'Female',
          dob: new Date('1985-12-03'),
          unique_id: 'B987654321'
        },
        {
          name: 'Robert Wilson',
          email: 'robert.wilson@example.com',
          password: await bcrypt.hash('patient123', 10),
          role: UserRole.PATIENT,
          gender: 'Male',
          dob: new Date('1978-04-25'),
          unique_id: 'C456789123'
        },
        {
          name: 'Lisa Thompson',
          email: 'lisa.thompson@example.com',
          password: await bcrypt.hash('patient123', 10),
          role: UserRole.PATIENT,
          gender: 'Female',
          dob: new Date('1992-09-18'),
          unique_id: 'D789123456'
        }
      ];

      const savedPatients = [];
      for (const patientData of patients) {
        const patient = this.userRepository.create(patientData);
        const savedPatient = await this.userRepository.save(patient);
        savedPatients.push(savedPatient);
        console.log(`✅ Created Patient: ${patientData.name}`);
      }

      // Create Availability slots
      const availabilitySlots = [
        {
          doctor_id: savedDoctors[0].id,
          hospital_id: savedHospitals[0].id,
          start_time: new Date('2024-01-15T09:00:00Z'),
          end_time: new Date('2024-01-15T10:00:00Z')
        },
        {
          doctor_id: savedDoctors[0].id,
          hospital_id: savedHospitals[0].id,
          start_time: new Date('2024-01-15T10:00:00Z'),
          end_time: new Date('2024-01-15T11:00:00Z')
        },
        {
          doctor_id: savedDoctors[1].id,
          hospital_id: savedHospitals[0].id,
          start_time: new Date('2024-01-15T14:00:00Z'),
          end_time: new Date('2024-01-15T15:00:00Z')
        },
        {
          doctor_id: savedDoctors[2].id,
          hospital_id: savedHospitals[1].id,
          start_time: new Date('2024-01-15T11:00:00Z'),
          end_time: new Date('2024-01-15T12:00:00Z')
        }
      ];

      for (const slot of availabilitySlots) {
        const availability = this.availabilityRepository.create(slot);
        await this.availabilityRepository.save(availability);
        console.log(`✅ Created availability slot`);
      }

      // Create some appointments
      const appointments = [
        {
          patient_id: savedPatients[0].id,
          doctor_id: savedDoctors[0].id,
          hospital_id: savedHospitals[0].id,
          appointment_time: new Date('2024-01-10T09:00:00Z'),
          amount_paid: 800
        },
        {
          patient_id: savedPatients[1].id,
          doctor_id: savedDoctors[1].id,
          hospital_id: savedHospitals[0].id,
          appointment_time: new Date('2024-01-12T14:00:00Z'),
          amount_paid: 600
        },
        {
          patient_id: savedPatients[2].id,
          doctor_id: savedDoctors[2].id,
          hospital_id: savedHospitals[1].id,
          appointment_time: new Date('2024-01-08T11:00:00Z'),
          amount_paid: 500
        }
      ];

      for (const appointment of appointments) {
        const newAppointment = this.appointmentRepository.create(appointment);
        await this.appointmentRepository.save(newAppointment);
        console.log(`✅ Created appointment`);
      }

      console.log('🎉 Mock data seeding completed successfully!');
      console.log('\n📋 Sample Login Credentials:');
      console.log('🏥 Admin: admin@hms.com / admin123');
      console.log('👨‍⚕️ Doctor: sarah.johnson@hms.com / doctor123');
      console.log('👤 Patient: john.smith@example.com / patient123');

    } catch (error) {
      console.error('❌ Error seeding mock data:', error);
      throw error;
    }
  }
} 