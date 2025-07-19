import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Appointment } from '../entities/Appointment';
import { Availability } from '../entities/Availability';
import { DoctorHospital } from '../entities/DoctorHospital';

export class AppointmentController {
  private appointmentRepository = AppDataSource.getRepository(Appointment);
  private availabilityRepository = AppDataSource.getRepository(Availability);
  private doctorHospitalRepository = AppDataSource.getRepository(DoctorHospital);

  getAllAppointments = async (req: Request, res: Response) => {
    try {
      const appointments = await this.appointmentRepository.find({
        relations: ['patient', 'doctor', 'hospital']
      });
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch appointments' });
    }
  };

  getAppointmentById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const appointment = await this.appointmentRepository.findOne({
        where: { id },
        relations: ['patient', 'doctor', 'hospital']
      });
      
      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }
      
      res.json(appointment);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch appointment' });
    }
  };

  getPatientAppointments = async (req: Request, res: Response) => {
    try {
      const { patientId } = req.params;
      const appointments = await this.appointmentRepository.find({
        where: { patient_id: patientId },
        relations: ['doctor', 'hospital'],
        order: { appointment_time: 'DESC' }
      });
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch patient appointments' });
    }
  };

  getDoctorAppointments = async (req: Request, res: Response) => {
    try {
      const { doctorId } = req.params;
      const appointments = await this.appointmentRepository.find({
        where: { doctor_id: doctorId },
        relations: ['patient', 'hospital'],
        order: { appointment_time: 'DESC' }
      });
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch doctor appointments' });
    }
  };

  getHospitalAppointments = async (req: Request, res: Response) => {
    try {
      const { hospitalId } = req.params;
      const appointments = await this.appointmentRepository.find({
        where: { hospital_id: hospitalId },
        relations: ['patient', 'doctor'],
        order: { appointment_time: 'DESC' }
      });
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch hospital appointments' });
    }
  };

  createAppointment = async (req: Request, res: Response) => {
    try {
      const { patient_id, doctor_id, hospital_id, appointment_time, amount_paid } = req.body;

      // Check if the time slot is available
      const availability = await this.availabilityRepository.findOne({
        where: {
          doctor_id,
          hospital_id,
          start_time: new Date(appointment_time),
          end_time: new Date(new Date(appointment_time).getTime() + 60 * 60 * 1000) // 1 hour slot
        }
      });

      if (!availability) {
        return res.status(400).json({ error: 'Time slot not available' });
      }

      // Check if appointment already exists for this time slot
      const existingAppointment = await this.appointmentRepository.findOne({
        where: {
          doctor_id,
          hospital_id,
          appointment_time: new Date(appointment_time)
        }
      });

      if (existingAppointment) {
        return res.status(400).json({ error: 'Appointment already exists for this time slot' });
      }

      // Verify consultation fee
      const doctorHospital = await this.doctorHospitalRepository.findOne({
        where: { doctor_id, hospital_id }
      });

      if (!doctorHospital) {
        return res.status(400).json({ error: 'Doctor not associated with this hospital' });
      }

      if (amount_paid !== doctorHospital.consultation_fee) {
        return res.status(400).json({ 
          error: 'Invalid amount', 
          expected: doctorHospital.consultation_fee 
        });
      }

      // Create appointment
      const appointment = this.appointmentRepository.create({
        patient_id,
        doctor_id,
        hospital_id,
        appointment_time: new Date(appointment_time),
        amount_paid
      });

      const result = await this.appointmentRepository.save(appointment);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create appointment' });
    }
  };

  updateAppointment = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const appointment = await this.appointmentRepository.findOne({ where: { id } });
      
      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }
      
      this.appointmentRepository.merge(appointment, req.body);
      const result = await this.appointmentRepository.save(appointment);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update appointment' });
    }
  };

  deleteAppointment = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const appointment = await this.appointmentRepository.findOne({ where: { id } });
      
      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }
      
      await this.appointmentRepository.remove(appointment);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete appointment' });
    }
  };
} 