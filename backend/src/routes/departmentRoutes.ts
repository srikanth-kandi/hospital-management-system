import { Router } from 'express';
import { DepartmentController } from '../controllers/DepartmentController';

const router = Router();
const departmentController = new DepartmentController();

// GET /api/departments
router.get('/', departmentController.getAllDepartments);

// GET /api/departments/:id
router.get('/:id', departmentController.getDepartmentById);

// GET /api/departments/hospital/:hospitalId
router.get('/hospital/:hospitalId', departmentController.getDepartmentsByHospital);

// POST /api/departments
router.post('/', departmentController.createDepartment);

// PUT /api/departments/:id
router.put('/:id', departmentController.updateDepartment);

// DELETE /api/departments/:id
router.delete('/:id', departmentController.deleteDepartment);

export default router; 