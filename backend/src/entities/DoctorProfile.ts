import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity('doctor_profiles')
export class DoctorProfile {
  @PrimaryColumn('uuid')
  user_id: string;

  @Column()
  qualifications: string;

  @Column('simple-array')
  specializations: string[];

  @Column()
  experience: number;

  // Relations
  @OneToOne(() => User, user => user.doctorProfile)
  @JoinColumn({ name: 'user_id' })
  user: User;
} 