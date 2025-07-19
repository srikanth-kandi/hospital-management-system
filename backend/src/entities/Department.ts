import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Hospital } from './Hospital';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn('uuid')
  id: string = uuidv4();

  @Column()
  name: string;

  @Column('uuid')
  hospital_id: string;

  // Relations
  @ManyToOne(() => Hospital, hospital => hospital.departments)
  @JoinColumn({ name: 'hospital_id' })
  hospital: Hospital;
} 