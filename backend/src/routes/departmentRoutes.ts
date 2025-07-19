import { Router } from 'express';
import { DepartmentController } from '../controllers/DepartmentController';

const router = Router();
const departmentController = new DepartmentController();

/**
 * @swagger
 * /departments:
 *   get:
 *     summary: Get all departments
 *     tags: [Departments]
 *     responses:
 *       200:
 *         description: List of all departments with hospital information
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Department'
 *       500:
 *         description: Internal server error
 */
router.get('/', departmentController.getAllDepartments);

/**
 * @swagger
 * /departments/unique-names:
 *   get:
 *     summary: Get unique department names across all hospitals
 *     tags: [Departments]
 *     responses:
 *       200:
 *         description: List of unique department names with hospital information
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                   name:
 *                     type: string
 *                   hospitals:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         name:
 *                           type: string
 *       500:
 *         description: Internal server error
 */
router.get('/unique-names', departmentController.getUniqueDepartmentNames);

/**
 * @swagger
 * /departments/{id}:
 *   get:
 *     summary: Get department by ID
 *     tags: [Departments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Department ID
 *     responses:
 *       200:
 *         description: Department details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Department'
 *       404:
 *         description: Department not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 */
router.get('/:id', departmentController.getDepartmentById);

/**
 * @swagger
 * /departments/hospital/{hospitalId}:
 *   get:
 *     summary: Get departments by hospital ID
 *     tags: [Departments]
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
 *         description: List of departments for the specified hospital
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Department'
 *       500:
 *         description: Internal server error
 */
router.get('/hospital/:hospitalId', departmentController.getDepartmentsByHospital);

/**
 * @swagger
 * /departments:
 *   post:
 *     summary: Create a new department
 *     tags: [Departments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - hospital_id
 *             properties:
 *               name:
 *                 type: string
 *                 description: Department name (must be unique within the hospital)
 *                 example: "Cardiology"
 *               hospital_id:
 *                 type: string
 *                 format: uuid
 *                 description: Hospital ID where the department will be created
 *     responses:
 *       201:
 *         description: Department created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Department'
 *       400:
 *         description: Bad request - missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Conflict - department with this name already exists in the hospital
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 */
router.post('/', departmentController.createDepartment);

/**
 * @swagger
 * /departments/{id}:
 *   put:
 *     summary: Update department
 *     tags: [Departments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Department ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Department name (must be unique within the hospital)
 *               hospital_id:
 *                 type: string
 *                 format: uuid
 *                 description: Hospital ID
 *     responses:
 *       200:
 *         description: Department updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Department'
 *       404:
 *         description: Department not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Conflict - department with this name already exists in the hospital
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete department
 *     tags: [Departments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Department ID
 *     responses:
 *       204:
 *         description: Department deleted successfully
 *       404:
 *         description: Department not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 */
router.put('/:id', departmentController.updateDepartment);
router.delete('/:id', departmentController.deleteDepartment);

export default router; 