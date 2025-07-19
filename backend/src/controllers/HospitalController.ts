import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Hospital } from '../entities/Hospital';
import { DoctorHospital } from '../entities/DoctorHospital';
import { Appointment } from '../entities/Appointment';
import { Department } from '../entities/Department';
import { User, UserRole } from '../entities/User';

export class HospitalController {
  private hospitalRepository = AppDataSource.getRepository(Hospital);
  private doctorHospitalRepository = AppDataSource.getRepository(DoctorHospital);
  private appointmentRepository = AppDataSource.getRepository(Appointment);
  private departmentRepository = AppDataSource.getRepository(Department);
  private userRepository = AppDataSource.getRepository(User);

  getAllHospitals = async (req: Request, res: Response) => {
    try {
      const hospitals = await this.hospitalRepository.find({
        relations: ['admin', 'departments']
      });
      res.json(hospitals);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch hospitals' });
    }
  };

  getHospitalById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const hospital = await this.hospitalRepository.findOne({
        where: { id },
        relations: ['admin', 'departments']
      });
      
      if (!hospital) {
        return res.status(404).json({ error: 'Hospital not found' });
      }
      
      res.json(hospital);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch hospital' });
    }
  };

  getHospitalDashboard = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Get total consultations
      const totalConsultations = await this.appointmentRepository.count({
        where: { hospital_id: id }
      });

      // Get total revenue (40% of consultation fees)
      const appointments = await this.appointmentRepository.find({
        where: { hospital_id: id }
      });

      const totalRevenue = appointments.reduce((total, appointment) => {
        return total + (appointment.amount_paid * 0.4);
      }, 0);

      // Get associated doctors count
      const associatedDoctors = await this.doctorHospitalRepository.count({
        where: { hospital_id: id }
      });

      // Get departments count
      const departmentsCount = await this.departmentRepository.count({
        where: { hospital_id: id }
      });

      res.json({
        totalConsultations,
        totalRevenue,
        associatedDoctors,
        departmentsCount
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch hospital dashboard' });
    }
  };

  getHospitalDoctors = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const doctorHospitals = await this.doctorHospitalRepository.find({
        where: { hospital_id: id },
        relations: ['doctor', 'doctor.doctorProfile']
      });

      const doctors = doctorHospitals.map(dh => ({
        ...dh.doctor,
        consultation_fee: dh.consultation_fee
      }));

      res.json(doctors);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch hospital doctors' });
    }
  };

  getHospitalRevenue = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const appointments = await this.appointmentRepository.find({
        where: { hospital_id: id }
      });

      const totalRevenue = appointments.reduce((total, appointment) => {
        return total + (appointment.amount_paid * 0.4);
      }, 0);

      res.json({
        totalRevenue,
        totalConsultations: appointments.length
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch hospital revenue' });
    }
  };

  getRevenueByDoctors = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const revenueByDoctors = await this.appointmentRepository
        .createQueryBuilder('appointment')
        .select('appointment.doctor_id', 'doctor_id')
        .addSelect('SUM(appointment.amount_paid * 0.4)', 'revenue')
        .addSelect('COUNT(appointment.id)', 'consultations')
        .where('appointment.hospital_id = :hospitalId', { hospitalId: id })
        .groupBy('appointment.doctor_id')
        .getRawMany();

      res.json(revenueByDoctors);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch revenue by doctors' });
    }
  };

  getRevenueByDepartments = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // This would require a more complex query to join departments with doctors
      // For now, returning a placeholder structure
      const departments = await this.departmentRepository.find({
        where: { hospital_id: id }
      });

      const revenueByDepartments = departments.map(dept => ({
        department_id: dept.id,
        department_name: dept.name,
        revenue: 0, // Would need to calculate based on doctor specializations
        consultations: 0
      }));

      res.json(revenueByDepartments);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch revenue by departments' });
    }
  };

  createHospital = async (req: Request, res: Response) => {
    try {
      const { name, location, created_by } = req.body;
      
      // Check if hospital name already exists
      const existingHospital = await this.hospitalRepository.findOne({
        where: { name }
      });

      if (existingHospital) {
        return res.status(400).json({ error: 'Hospital with this name already exists' });
      }

      const hospital = this.hospitalRepository.create({
        name,
        location,
        created_by
      });
      const result = await this.hospitalRepository.save(hospital);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create hospital' });
    }
  };

  updateHospital = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const hospital = await this.hospitalRepository.findOne({ where: { id } });
      
      if (!hospital) {
        return res.status(404).json({ error: 'Hospital not found' });
      }
      
      this.hospitalRepository.merge(hospital, req.body);
      const result = await this.hospitalRepository.save(hospital);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update hospital' });
    }
  };

  deleteHospital = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const hospital = await this.hospitalRepository.findOne({ where: { id } });
      
      if (!hospital) {
        return res.status(404).json({ error: 'Hospital not found' });
      }
      
      await this.hospitalRepository.remove(hospital);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete hospital' });
    }
  };
} 