import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { Hospital } from './Hospital';

@Entity('doctor_hospital')
export class DoctorHospital {
  @PrimaryColumn('uuid')
  doctor_id: string;

  @PrimaryColumn('uuid')
  hospital_id: string;

  @Column()
  consultation_fee: number;

  // Relations
  @ManyToOne(() => User, user => user.doctorAppointments)
  @JoinColumn({ name: 'doctor_id' })
  doctor: User;

  @ManyToOne(() => Hospital, hospital => hospital.doctorHospitals)
  @JoinColumn({ name: 'hospital_id' })
  hospital: Hospital;
} 