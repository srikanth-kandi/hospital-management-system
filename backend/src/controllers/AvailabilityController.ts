import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Availability } from '../entities/Availability';
import { DoctorHospital } from '../entities/DoctorHospital';

export class AvailabilityController {
  private availabilityRepository = AppDataSource.getRepository(Availability);
  private doctorHospitalRepository = AppDataSource.getRepository(DoctorHospital);

  getAllAvailability = async (req: Request, res: Response) => {
    try {
      const availability = await this.availabilityRepository.find({
        relations: ['doctor', 'hospital']
      });
      res.json(availability);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch availability' });
    }
  };

  getAvailabilityById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const availability = await this.availabilityRepository.findOne({
        where: { id },
        relations: ['doctor', 'hospital']
      });
      
      if (!availability) {
        return res.status(404).json({ error: 'Availability not found' });
      }
      
      res.json(availability);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch availability' });
    }
  };

  getDoctorAvailability = async (req: Request, res: Response) => {
    try {
      const { doctorId } = req.params;
      const availability = await this.availabilityRepository.find({
        where: { doctor_id: doctorId },
        relations: ['hospital'],
        order: { start_time: 'ASC' }
      });
      res.json(availability);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch doctor availability' });
    }
  };

  getHospitalAvailability = async (req: Request, res: Response) => {
    try {
      const { hospitalId } = req.params;
      const availability = await this.availabilityRepository.find({
        where: { hospital_id: hospitalId },
        relations: ['doctor'],
        order: { start_time: 'ASC' }
      });
      res.json(availability);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch hospital availability' });
    }
  };

  getDoctorHospitalAvailability = async (req: Request, res: Response) => {
    try {
      const { doctorId, hospitalId } = req.params;
      const availability = await this.availabilityRepository.find({
        where: { doctor_id: doctorId, hospital_id: hospitalId },
        order: { start_time: 'ASC' }
      });
      res.json(availability);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch doctor-hospital availability' });
    }
  };

  createAvailability = async (req: Request, res: Response) => {
    try {
      const { doctor_id, hospital_id, start_time, end_time } = req.body;

      // Check if doctor is associated with the hospital
      const doctorHospital = await this.doctorHospitalRepository.findOne({
        where: { doctor_id, hospital_id }
      });

      if (!doctorHospital) {
        return res.status(400).json({ error: 'Doctor not associated with this hospital' });
      }

      // Check for conflicting time slots across all hospitals for this doctor
      const conflictingSlots = await this.availabilityRepository
        .createQueryBuilder('availability')
        .where('availability.doctor_id = :doctorId', { doctorId: doctor_id })
        .andWhere(
          '(availability.start_time < :endTime AND availability.end_time > :startTime)',
          { startTime: new Date(start_time), endTime: new Date(end_time) }
        )
        .getMany();

      if (conflictingSlots.length > 0) {
        return res.status(400).json({ 
          error: 'Time slot conflicts with existing availability',
          conflicts: conflictingSlots
        });
      }

      // Create availability
      const availability = this.availabilityRepository.create({
        doctor_id,
        hospital_id,
        start_time: new Date(start_time),
        end_time: new Date(end_time)
      });

      const result = await this.availabilityRepository.save(availability);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create availability' });
    }
  };

  updateAvailability = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const availability = await this.availabilityRepository.findOne({ where: { id } });
      
      if (!availability) {
        return res.status(404).json({ error: 'Availability not found' });
      }
      
      // Check for conflicts if updating time
      if (req.body.start_time || req.body.end_time) {
        const startTime = req.body.start_time ? new Date(req.body.start_time) : availability.start_time;
        const endTime = req.body.end_time ? new Date(req.body.end_time) : availability.end_time;
        
        const conflictingSlots = await this.availabilityRepository
          .createQueryBuilder('availability')
          .where('availability.doctor_id = :doctorId', { doctorId: availability.doctor_id })
          .andWhere('availability.id != :id', { id })
          .andWhere(
            '(availability.start_time < :endTime AND availability.end_time > :startTime)',
            { startTime, endTime }
          )
          .getMany();

        if (conflictingSlots.length > 0) {
          return res.status(400).json({ 
            error: 'Time slot conflicts with existing availability',
            conflicts: conflictingSlots
          });
        }
      }
      
      this.availabilityRepository.merge(availability, req.body);
      const result = await this.availabilityRepository.save(availability);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update availability' });
    }
  };

  deleteAvailability = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const availability = await this.availabilityRepository.findOne({ where: { id } });
      
      if (!availability) {
        return res.status(404).json({ error: 'Availability not found' });
      }
      
      await this.availabilityRepository.remove(availability);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete availability' });
    }
  };
} 