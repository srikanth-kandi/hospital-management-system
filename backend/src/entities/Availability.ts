import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User } from './User';
import { Hospital } from './Hospital';

@Entity('availability')
export class Availability {
  @PrimaryGeneratedColumn('uuid')
  id: string = uuidv4();

  @Column('uuid')
  doctor_id: string;

  @Column('uuid')
  hospital_id: string;

  @Column('timestamp')
  start_time: Date;

  @Column('timestamp')
  end_time: Date;

  // Relations
  @ManyToOne(() => User, user => user.doctorAppointments)
  @JoinColumn({ name: 'doctor_id' })
  doctor: User;

  @ManyToOne(() => Hospital, hospital => hospital.appointments)
  @JoinColumn({ name: 'hospital_id' })
  hospital: Hospital;
} 