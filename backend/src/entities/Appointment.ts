import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User } from './User';
import { Hospital } from './Hospital';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string = uuidv4();

  @Column('uuid')
  patient_id: string;

  @Column('uuid')
  doctor_id: string;

  @Column('uuid')
  hospital_id: string;

  @Column('timestamp')
  appointment_time: Date;

  @Column()
  amount_paid: number;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => User, user => user.patientAppointments)
  @JoinColumn({ name: 'patient_id' })
  patient: User;

  @ManyToOne(() => User, user => user.doctorAppointments)
  @JoinColumn({ name: 'doctor_id' })
  doctor: User;

  @ManyToOne(() => Hospital, hospital => hospital.appointments)
  @JoinColumn({ name: 'hospital_id' })
  hospital: Hospital;
} 