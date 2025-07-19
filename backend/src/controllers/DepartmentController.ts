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
      const department = this.departmentRepository.create({
        name,
        hospital_id
      });
      const result = await this.departmentRepository.save(department);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create department' });
    }
  };

  updateDepartment = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const department = await this.departmentRepository.findOne({ where: { id } });
      
      if (!department) {
        return res.status(404).json({ error: 'Department not found' });
      }
      
      this.departmentRepository.merge(department, req.body);
      const result = await this.departmentRepository.save(department);
      res.json(result);
    } catch (error) {
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