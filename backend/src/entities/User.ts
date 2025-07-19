import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, OneToOne } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Hospital } from './Hospital';
import { DoctorProfile } from './DoctorProfile';
import { Appointment } from './Appointment';

export enum UserRole {
  HOSPITAL_ADMIN = 'hospital_admin',
  DOCTOR = 'doctor',
  PATIENT = 'patient'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string = uuidv4();

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.PATIENT
  })
  role: UserRole;

  @Column({ nullable: true })
  gender: string;

  @Column({ type: 'date', nullable: true })
  dob: Date;

  @Column({ nullable: true })
  unique_id: string; // Aadhar/Passport (for patient only)

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @OneToMany(() => Hospital, hospital => hospital.created_by)
  hospitals: Hospital[];

  @OneToOne(() => DoctorProfile, doctorProfile => doctorProfile.user)
  doctorProfile: DoctorProfile;

  @OneToMany(() => Appointment, appointment => appointment.patient)
  patientAppointments: Appointment[];

  @OneToMany(() => Appointment, appointment => appointment.doctor)
  doctorAppointments: Appointment[];
} 