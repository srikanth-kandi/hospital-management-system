import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User } from './User';
import { Department } from './Department';
import { DoctorHospital } from './DoctorHospital';
import { Appointment } from './Appointment';

@Entity('hospitals')
export class Hospital {
  @PrimaryGeneratedColumn('uuid')
  id: string = uuidv4();

  @Column({ unique: true })
  name: string;

  @Column()
  location: string;

  @Column('uuid')
  created_by: string;

  // Relations
  @ManyToOne(() => User, user => user.hospitals)
  @JoinColumn({ name: 'created_by' })
  admin: User;

  @OneToMany(() => Department, department => department.hospital)
  departments: Department[];

  @OneToMany(() => DoctorHospital, doctorHospital => doctorHospital.hospital)
  doctorHospitals: DoctorHospital[];

  @OneToMany(() => Appointment, appointment => appointment.hospital)
  appointments: Appointment[];
} 