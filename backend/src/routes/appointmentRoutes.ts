import { Router } from 'express';
import { AppointmentController } from '../controllers/AppointmentController';

const router = Router();
const appointmentController = new AppointmentController();

/**
 * @swagger
 * /appointments:
 *   get:
 *     summary: Get all appointments
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all appointments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/Appointment'
 *                   - type: object
 *                     properties:
 *                       patient:
 *                         $ref: '#/components/schemas/User'
 *                       doctor:
 *                         $ref: '#/components/schemas/User'
 *                       hospital:
 *                         $ref: '#/components/schemas/Hospital'
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Book a new appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patient_id
 *               - doctor_id
 *               - hospital_id
 *               - appointment_time
 *               - amount_paid
 *             properties:
 *               patient_id:
 *                 type: string
 *                 format: uuid
 *                 description: Patient's user ID
 *               doctor_id:
 *                 type: string
 *                 format: uuid
 *                 description: Doctor's user ID
 *               hospital_id:
 *                 type: string
 *                 format: uuid
 *                 description: Hospital ID
 *               appointment_time:
 *                 type: string
 *                 format: date-time
 *                 description: Appointment date and time
 *               amount_paid:
 *                 type: number
 *                 description: Consultation fee amount
 *     responses:
 *       201:
 *         description: Appointment booked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: Bad request - time slot not available or invalid amount
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 */
router.get('/', appointmentController.getAllAppointments);
router.post('/', appointmentController.createAppointment);

/**
 * @swagger
 * /appointments/{id}:
 *   get:
 *     summary: Get appointment by ID
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment details
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Appointment'
 *                 - type: object
 *                   properties:
 *                     patient:
 *                       $ref: '#/components/schemas/User'
 *                     doctor:
 *                       $ref: '#/components/schemas/User'
 *                     hospital:
 *                       $ref: '#/components/schemas/Hospital'
 *       404:
 *         description: Appointment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *   put:
 *     summary: Update appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Appointment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               appointment_time:
 *                 type: string
 *                 format: date-time
 *               amount_paid:
 *                 type: number
 *     responses:
 *       200:
 *         description: Appointment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Cancel appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Appointment ID
 *     responses:
 *       204:
 *         description: Appointment cancelled successfully
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', appointmentController.getAppointmentById);
router.put('/:id', appointmentController.updateAppointment);
router.delete('/:id', appointmentController.deleteAppointment);

/**
 * @swagger
 * /appointments/patient/{patientId}:
 *   get:
 *     summary: Get all appointments for a specific patient
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Patient's user ID
 *     responses:
 *       200:
 *         description: Patient's appointment history
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/Appointment'
 *                   - type: object
 *                     properties:
 *                       doctor:
 *                         $ref: '#/components/schemas/User'
 *                       hospital:
 *                         $ref: '#/components/schemas/Hospital'
 *       500:
 *         description: Internal server error
 */
router.get('/patient/:patientId', appointmentController.getPatientAppointments);

/**
 * @swagger
 * /appointments/doctor/{doctorId}:
 *   get:
 *     summary: Get all appointments for a specific doctor
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Doctor's user ID
 *     responses:
 *       200:
 *         description: Doctor's appointment schedule
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/Appointment'
 *                   - type: object
 *                     properties:
 *                       patient:
 *                         $ref: '#/components/schemas/User'
 *                       hospital:
 *                         $ref: '#/components/schemas/Hospital'
 *       500:
 *         description: Internal server error
 */
router.get('/doctor/:doctorId', appointmentController.getDoctorAppointments);

/**
 * @swagger
 * /appointments/hospital/{hospitalId}:
 *   get:
 *     summary: Get all appointments for a specific hospital
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: hospitalId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Hospital ID
 *     responses:
 *       200:
 *         description: Hospital's appointment schedule
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/Appointment'
 *                   - type: object
 *                     properties:
 *                       patient:
 *                         $ref: '#/components/schemas/User'
 *                       doctor:
 *                         $ref: '#/components/schemas/User'
 *       500:
 *         description: Internal server error
 */
router.get('/hospital/:hospitalId', appointmentController.getHospitalAppointments);

export default router; 