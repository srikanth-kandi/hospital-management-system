import { Router } from 'express';
import { AvailabilityController } from '../controllers/AvailabilityController';

const router = Router();
const availabilityController = new AvailabilityController();

// GET /api/availability
router.get('/', availabilityController.getAllAvailability);

// GET /api/availability/:id
router.get('/:id', availabilityController.getAvailabilityById);

// GET /api/availability/doctor/:doctorId
router.get('/doctor/:doctorId', availabilityController.getDoctorAvailability);

// GET /api/availability/hospital/:hospitalId
router.get('/hospital/:hospitalId', availabilityController.getHospitalAvailability);

// GET /api/availability/doctor/:doctorId/hospital/:hospitalId
router.get('/doctor/:doctorId/hospital/:hospitalId', availabilityController.getDoctorHospitalAvailability);

// POST /api/availability
router.post('/', availabilityController.createAvailability);

// PUT /api/availability/:id
router.put('/:id', availabilityController.updateAvailability);

// DELETE /api/availability/:id
router.delete('/:id', availabilityController.deleteAvailability);

export default router; 