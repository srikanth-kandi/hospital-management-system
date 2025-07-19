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
        specializations: dh.doctor?.doctorProfile?.specializations || [],
        qualifications: dh.doctor?.doctorProfile?.qualifications || '',
        experience: dh.doctor?.doctorProfile?.experience || 0,
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

      // Check for related records before deletion
      const departmentsCount = await this.departmentRepository.count({
        where: { hospital_id: id }
      });

      const doctorHospitalsCount = await this.doctorHospitalRepository.count({
        where: { hospital_id: id }
      });

      const appointmentsCount = await this.appointmentRepository.count({
        where: { hospital_id: id }
      });

      // If there are related records, provide detailed error
      if (departmentsCount > 0 || doctorHospitalsCount > 0 || appointmentsCount > 0) {
        return res.status(409).json({
          error: 'Cannot delete hospital with existing related records',
          details: {
            departments: departmentsCount,
            doctorAssociations: doctorHospitalsCount,
            appointments: appointmentsCount
          },
          message: 'Please delete all related departments, doctor associations, and appointments before deleting the hospital.'
        });
      }
      
      // If no related records, proceed with deletion
      await this.hospitalRepository.remove(hospital);
      res.status(204).send();
    } catch (error: any) {
      console.error('Error deleting hospital:', error);
      
      // Handle specific database constraint errors
      if (error.code === '23503') { // Foreign key constraint violation
        return res.status(409).json({
          error: 'Cannot delete hospital due to existing related records',
          message: 'Please remove all associated departments, doctors, and appointments first.'
        });
      }
      
      res.status(500).json({ error: 'Failed to delete hospital' });
    }
  };

  forceDeleteHospital = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const hospital = await this.hospitalRepository.findOne({ where: { id } });
      
      if (!hospital) {
        return res.status(404).json({ error: 'Hospital not found' });
      }

      // Use a transaction to ensure all deletions are atomic
      await AppDataSource.transaction(async (manager) => {
        // Delete appointments first
        await manager.delete(Appointment, { hospital_id: id });
        
        // Delete doctor-hospital associations
        await manager.delete(DoctorHospital, { hospital_id: id });
        
        // Delete departments
        await manager.delete(Department, { hospital_id: id });
        
        // Finally delete the hospital
        await manager.remove(hospital);
      });

      res.status(204).send();
    } catch (error: any) {
      console.error('Error force deleting hospital:', error);
      res.status(500).json({ error: 'Failed to force delete hospital' });
    }
  };
} 