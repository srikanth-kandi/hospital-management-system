import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Department } from '../entities/Department';

export class DepartmentController {
  private departmentRepository = AppDataSource.getRepository(Department);

  getAllDepartments = async (req: Request, res: Response) => {
    try {
      const departments = await this.departmentRepository.find({
        relations: ['hospital']
      });
      res.json(departments);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch departments' });
    }
  };

  getUniqueDepartmentNames = async (req: Request, res: Response) => {
    try {
      // Get all unique department names with their hospital information
      const departments = await this.departmentRepository.find({
        relations: ['hospital'],
        select: ['id', 'name', 'hospital_id']
      });
      
      // Group by name to show which hospitals have each department
      const uniqueDepartments = departments.reduce((acc, dept) => {
        const existing = acc.find(d => d.name === dept.name);
        if (existing) {
          existing.hospitals.push({
            id: dept.hospital_id,
            name: dept.hospital?.name || 'Unknown Hospital'
          });
        } else {
          acc.push({
            id: dept.id,
            name: dept.name,
            hospitals: [{
              id: dept.hospital_id,
              name: dept.hospital?.name || 'Unknown Hospital'
            }]
          });
        }
        return acc;
      }, [] as any[]);

      res.json(uniqueDepartments);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch unique department names' });
    }
  };

  getDepartmentById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const department = await this.departmentRepository.findOne({
        where: { id },
        relations: ['hospital']
      });
      
      if (!department) {
        return res.status(404).json({ error: 'Department not found' });
      }
      
      res.json(department);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch department' });
    }
  };

  getDepartmentsByHospital = async (req: Request, res: Response) => {
    try {
      const { hospitalId } = req.params;
      const departments = await this.departmentRepository.find({
        where: { hospital_id: hospitalId },
        relations: ['hospital']
      });
      res.json(departments);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch departments' });
    }
  };

  createDepartment = async (req: Request, res: Response) => {
    try {
      const { name, hospital_id } = req.body;

      // Validate required fields
      if (!name || !hospital_id) {
        return res.status(400).json({ 
          error: 'Department name and hospital_id are required' 
        });
      }

      // Check if department with same name already exists in this hospital
      const existingDepartment = await this.departmentRepository.findOne({
        where: { 
          name: name.trim(),
          hospital_id: hospital_id 
        }
      });

      if (existingDepartment) {
        return res.status(409).json({ 
          error: `Department '${name}' already exists in this hospital` 
        });
      }

      // Create new department
      const department = this.departmentRepository.create({
        name: name.trim(),
        hospital_id
      });

      const result = await this.departmentRepository.save(department);
      
      // Fetch the created department with hospital relation
      const createdDepartment = await this.departmentRepository.findOne({
        where: { id: result.id },
        relations: ['hospital']
      });

      res.status(201).json(createdDepartment);
    } catch (error: any) {
      console.error('Error creating department:', error);
      
      // Handle database constraint violations
      if (error.code === '23505') { // PostgreSQL unique constraint violation
        return res.status(409).json({ 
          error: 'Department with this name already exists in this hospital' 
        });
      }
      
      res.status(500).json({ error: 'Failed to create department' });
    }
  };

  updateDepartment = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, hospital_id } = req.body;
      
      const department = await this.departmentRepository.findOne({ where: { id } });
      
      if (!department) {
        return res.status(404).json({ error: 'Department not found' });
      }

      // If name is being updated, check for uniqueness
      if (name && name !== department.name) {
        const existingDepartment = await this.departmentRepository.findOne({
          where: { 
            name: name.trim(),
            hospital_id: hospital_id || department.hospital_id 
          }
        });

        if (existingDepartment && existingDepartment.id !== id) {
          return res.status(409).json({ 
            error: `Department '${name}' already exists in this hospital` 
          });
        }
      }
      
      // Update department
      this.departmentRepository.merge(department, {
        ...req.body,
        name: name ? name.trim() : department.name
      });
      
      const result = await this.departmentRepository.save(department);
      
      // Fetch updated department with hospital relation
      const updatedDepartment = await this.departmentRepository.findOne({
        where: { id: result.id },
        relations: ['hospital']
      });
      
      res.json(updatedDepartment);
    } catch (error: any) {
      console.error('Error updating department:', error);
      
      // Handle database constraint violations
      if (error.code === '23505') { // PostgreSQL unique constraint violation
        return res.status(409).json({ 
          error: 'Department with this name already exists in this hospital' 
        });
      }
      
      res.status(500).json({ error: 'Failed to update department' });
    }
  };

  deleteDepartment = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const department = await this.departmentRepository.findOne({ where: { id } });
      
      if (!department) {
        return res.status(404).json({ error: 'Department not found' });
      }
      
      await this.departmentRepository.remove(department);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete department' });
    }
  };
} 