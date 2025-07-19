import { Router } from 'express';
import { DoctorController } from '../controllers/DoctorController';

const router = Router();
const doctorController = new DoctorController();

/**
 * @swagger
 * /doctors:
 *   get:
 *     summary: Get all doctors
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all doctors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/User'
 *                   - type: object
 *                     properties:
 *                       doctorProfile:
 *                         $ref: '#/components/schemas/DoctorProfile'
 *       500:
 *         description: Internal server error
 */
// GET /api/doctors
router.get('/', doctorController.getAllDoctors);

// GET /api/doctors/:id
router.get('/:id', doctorController.getDoctorById);

// GET /api/doctors/:id/hospitals
router.get('/:id/hospitals', doctorController.getDoctorHospitals);

// GET /api/doctors/:id/earnings
router.get('/:id/earnings', doctorController.getDoctorEarnings);

/**
 * @swagger
 * /doctors/{id}/dashboard:
 *   get:
 *     summary: Get doctor dashboard with statistics and recent data
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Doctor ID
 *     responses:
 *       200:
 *         description: Doctor dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 doctor:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     specializations:
 *                       type: array
 *                       items:
 *                         type: string
 *                     qualifications:
 *                       type: string
 *                     experience:
 *                       type: number
 *                 statistics:
 *                   type: object
 *                   properties:
 *                     totalConsultations:
 *                       type: number
 *                       description: Total number of consultations
 *                     totalEarnings:
 *                       type: number
 *                       description: Total earnings (60% of consultation fees)
 *                     associatedHospitals:
 *                       type: number
 *                       description: Number of hospitals the doctor is associated with
 *                 recentAppointments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       appointment_time:
 *                         type: string
 *                         format: date-time
 *                       amount_paid:
 *                         type: number
 *                       hospital_name:
 *                         type: string
 *                       patient_name:
 *                         type: string
 *                 monthlyEarnings:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: string
 *                         format: date
 *                       earnings:
 *                         type: number
 *                       consultations:
 *                         type: number
 *       404:
 *         description: Doctor not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 */
// GET /api/doctors/:id/dashboard
router.get('/:id/dashboard', doctorController.getDoctorDashboard);

// POST /api/doctors/:id/associate-hospital
router.post('/:id/associate-hospital', doctorController.associateWithHospital);

// PUT /api/doctors/:id/consultation-fee
router.put('/:id/consultation-fee', doctorController.updateConsultationFee);

export default router; 