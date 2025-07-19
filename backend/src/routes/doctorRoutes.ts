import { Router } from 'express';
import { DoctorController } from '../controllers/DoctorController';

const router = Router();
const doctorController = new DoctorController();

// GET /api/doctors
router.get('/', doctorController.getAllDoctors);

// GET /api/doctors/:id
router.get('/:id', doctorController.getDoctorById);

// GET /api/doctors/:id/hospitals
router.get('/:id/hospitals', doctorController.getDoctorHospitals);

// GET /api/doctors/:id/earnings
router.get('/:id/earnings', doctorController.getDoctorEarnings);

// POST /api/doctors/:id/associate-hospital
router.post('/:id/associate-hospital', doctorController.associateWithHospital);

// PUT /api/doctors/:id/consultation-fee
router.put('/:id/consultation-fee', doctorController.updateConsultationFee);

export default router; 