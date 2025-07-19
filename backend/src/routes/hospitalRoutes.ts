import { Router } from 'express';
import { HospitalController } from '../controllers/HospitalController';

const router = Router();
const hospitalController = new HospitalController();

/**
 * @swagger
 * /hospitals:
 *   get:
 *     summary: Get all hospitals
 *     tags: [Hospitals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all hospitals
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/Hospital'
 *                   - type: object
 *                     properties:
 *                       admin:
 *                         $ref: '#/components/schemas/User'
 *                       departments:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Department'
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Create a new hospital
 *     tags: [Hospitals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - location
 *               - created_by
 *             properties:
 *               name:
 *                 type: string
 *                 description: Hospital name (must be unique)
 *               location:
 *                 type: string
 *                 description: Hospital location
 *               created_by:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the hospital admin creating the hospital
 *     responses:
 *       201:
 *         description: Hospital created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Hospital'
 *       400:
 *         description: Bad request - hospital name already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 */
router.get('/', hospitalController.getAllHospitals);
router.post('/', hospitalController.createHospital);

/**
 * @swagger
 * /hospitals/{id}:
 *   get:
 *     summary: Get hospital by ID
 *     tags: [Hospitals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Hospital ID
 *     responses:
 *       200:
 *         description: Hospital details
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Hospital'
 *                 - type: object
 *                   properties:
 *                     admin:
 *                       $ref: '#/components/schemas/User'
 *                     departments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Department'
 *       404:
 *         description: Hospital not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *   put:
 *     summary: Update hospital
 *     tags: [Hospitals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Hospital ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       200:
 *         description: Hospital updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Hospital'
 *       404:
 *         description: Hospital not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete hospital (safe delete - checks for related records)
 *     tags: [Hospitals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Hospital ID
 *     responses:
 *       204:
 *         description: Hospital deleted successfully
 *       404:
 *         description: Hospital not found
 *       409:
 *         description: Cannot delete hospital with existing related records
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 details:
 *                   type: object
 *                   properties:
 *                     departments:
 *                       type: number
 *                     doctorAssociations:
 *                       type: number
 *                     appointments:
 *                       type: number
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 */
router.get('/:id', hospitalController.getHospitalById);
router.put('/:id', hospitalController.updateHospital);
router.delete('/:id', hospitalController.deleteHospital);

/**
 * @swagger
 * /hospitals/{id}/dashboard:
 *   get:
 *     summary: Get hospital dashboard statistics
 *     tags: [Hospitals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Hospital ID
 *     responses:
 *       200:
 *         description: Hospital dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalConsultations:
 *                   type: number
 *                   description: Total number of consultations
 *                 totalRevenue:
 *                   type: number
 *                   description: Total revenue (40% of consultation fees)
 *                 associatedDoctors:
 *                   type: number
 *                   description: Number of doctors associated with the hospital
 *                 departmentsCount:
 *                   type: number
 *                   description: Number of departments in the hospital
 *       404:
 *         description: Hospital not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id/dashboard', hospitalController.getHospitalDashboard);

/**
 * @swagger
 * /hospitals/{id}/doctors:
 *   get:
 *     summary: Get all doctors associated with a hospital
 *     tags: [Hospitals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Hospital ID
 *     responses:
 *       200:
 *         description: List of doctors with their consultation fees
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/User'
 *                   - type: object
 *                     properties:
 *                       consultation_fee:
 *                         type: number
 *                         description: Consultation fee for this hospital
 *       404:
 *         description: Hospital not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id/doctors', hospitalController.getHospitalDoctors);

/**
 * @swagger
 * /hospitals/{id}/revenue:
 *   get:
 *     summary: Get hospital revenue statistics
 *     tags: [Hospitals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Hospital ID
 *     responses:
 *       200:
 *         description: Hospital revenue data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalRevenue:
 *                   type: number
 *                   description: Total revenue (40% of consultation fees)
 *                 totalConsultations:
 *                   type: number
 *                   description: Total number of consultations
 *       404:
 *         description: Hospital not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id/revenue', hospitalController.getHospitalRevenue);

/**
 * @swagger
 * /hospitals/{id}/revenue/doctors:
 *   get:
 *     summary: Get revenue breakdown by doctors
 *     tags: [Hospitals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Hospital ID
 *     responses:
 *       200:
 *         description: Revenue breakdown by doctors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   doctor_id:
 *                     type: string
 *                     format: uuid
 *                   revenue:
 *                     type: number
 *                     description: Revenue generated by this doctor (40% of fees)
 *                   consultations:
 *                     type: number
 *                     description: Number of consultations by this doctor
 *       404:
 *         description: Hospital not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id/revenue/doctors', hospitalController.getRevenueByDoctors);

/**
 * @swagger
 * /hospitals/{id}/revenue/departments:
 *   get:
 *     summary: Get revenue breakdown by departments
 *     tags: [Hospitals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Hospital ID
 *     responses:
 *       200:
 *         description: Revenue breakdown by departments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   department_id:
 *                     type: string
 *                     format: uuid
 *                   department_name:
 *                     type: string
 *                   revenue:
 *                     type: number
 *                     description: Revenue generated by this department
 *                   consultations:
 *                     type: number
 *                     description: Number of consultations in this department
 *       404:
 *         description: Hospital not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id/revenue/departments', hospitalController.getRevenueByDepartments);

/**
 * @swagger
 * /hospitals/{id}/force-delete:
 *   delete:
 *     summary: Force delete hospital (cascade delete all related records)
 *     tags: [Hospitals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Hospital ID
 *     responses:
 *       204:
 *         description: Hospital and all related records deleted successfully
 *       404:
 *         description: Hospital not found
 *       500:
 *         description: Internal server error
 *     description: |
 *       ⚠️ **WARNING**: This endpoint will permanently delete the hospital and ALL related records including:
 *       - All departments in the hospital
 *       - All doctor-hospital associations
 *       - All appointments at the hospital
 *       
 *       This action cannot be undone. Use with extreme caution.
 */
router.delete('/:id/force-delete', hospitalController.forceDeleteHospital);

export default router; 