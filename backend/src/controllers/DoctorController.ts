import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { User, UserRole } from '../entities/User';
import { DoctorProfile } from '../entities/DoctorProfile';
import { DoctorHospital } from '../entities/DoctorHospital';
import { Appointment } from '../entities/Appointment';

export class DoctorController {
  private userRepository = AppDataSource.getRepository(User);
  private doctorProfileRepository = AppDataSource.getRepository(DoctorProfile);
  private doctorHospitalRepository = AppDataSource.getRepository(DoctorHospital);
  private appointmentRepository = AppDataSource.getRepository(Appointment);

  getAllDoctors = async (req: Request, res: Response) => {
    try {
      const doctors = await this.userRepository.find({
        where: { role: UserRole.DOCTOR },
        relations: ['doctorProfile'],
        select: ['id', 'name', 'email', 'role', 'gender', 'dob', 'created_at']
      });
      res.json(doctors);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch doctors' });
    }
  };

  getDoctorById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const doctor = await this.userRepository.findOne({
        where: { id, role: UserRole.DOCTOR },
        relations: ['doctorProfile'],
        select: ['id', 'name', 'email', 'role', 'gender', 'dob', 'created_at']
      });
      
      if (!doctor) {
        return res.status(404).json({ error: 'Doctor not found' });
      }
      
      res.json(doctor);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch doctor' });
    }
  };

  getDoctorHospitals = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const doctorHospitals = await this.doctorHospitalRepository.find({
        where: { doctor_id: id },
        relations: ['hospital']
      });
      res.json(doctorHospitals);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch doctor hospitals' });
    }
  };

  getDoctorEarnings = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Get all appointments for the doctor
      const appointments = await this.appointmentRepository.find({
        where: { doctor_id: id }
      });

      // Calculate total earnings (60% of consultation fees)
      const totalEarnings = appointments.reduce((total, appointment) => {
        return total + (appointment.amount_paid * 0.6);
      }, 0);

      // Group earnings by hospital
      const earningsByHospital = await this.appointmentRepository
        .createQueryBuilder('appointment')
        .select('appointment.hospital_id', 'hospital_id')
        .addSelect('SUM(appointment.amount_paid * 0.6)', 'earnings')
        .addSelect('COUNT(appointment.id)', 'consultations')
        .where('appointment.doctor_id = :doctorId', { doctorId: id })
        .groupBy('appointment.hospital_id')
        .getRawMany();

      res.json({
        totalEarnings,
        totalConsultations: appointments.length,
        earningsByHospital
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch doctor earnings' });
    }
  };

  associateWithHospital = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { hospital_id, consultation_fee } = req.body;

      // Check if doctor exists
      const doctor = await this.userRepository.findOne({
        where: { id, role: UserRole.DOCTOR }
      });

      if (!doctor) {
        return res.status(404).json({ error: 'Doctor not found' });
      }

      // Check if association already exists
      const existingAssociation = await this.doctorHospitalRepository.findOne({
        where: { doctor_id: id, hospital_id }
      });

      if (existingAssociation) {
        return res.status(400).json({ error: 'Doctor already associated with this hospital' });
      }

      // Create association
      const doctorHospital = this.doctorHospitalRepository.create({
        doctor_id: id,
        hospital_id,
        consultation_fee
      });

      const result = await this.doctorHospitalRepository.save(doctorHospital);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to associate doctor with hospital' });
    }
  };

  updateConsultationFee = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { hospital_id, consultation_fee } = req.body;

      const doctorHospital = await this.doctorHospitalRepository.findOne({
        where: { doctor_id: id, hospital_id }
      });

      if (!doctorHospital) {
        return res.status(404).json({ error: 'Doctor-hospital association not found' });
      }

      doctorHospital.consultation_fee = consultation_fee;
      const result = await this.doctorHospitalRepository.save(doctorHospital);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update consultation fee' });
    }
  };
} 