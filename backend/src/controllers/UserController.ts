import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { User, UserRole } from '../entities/User';
import { DoctorProfile } from '../entities/DoctorProfile';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

export class UserController {
  private userRepository = AppDataSource.getRepository(User);
  private doctorProfileRepository = AppDataSource.getRepository(DoctorProfile);

  registerUser = async (req: Request, res: Response) => {
    try {
      const { name, email, password, role, gender, dob, unique_id, qualifications, specializations, experience } = req.body;

      // Check if user already exists
      const existingUser = await this.userRepository.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const userData = {
        name,
        email,
        password: hashedPassword,
        role,
        gender,
        dob: dob ? new Date(dob) : undefined,
        unique_id
      };
      
      const user = this.userRepository.create(userData);
      const savedUser = await this.userRepository.save(user);

      // If registering as doctor, create doctor profile
      if (role === UserRole.DOCTOR && qualifications && specializations && experience) {
        const doctorProfile = this.doctorProfileRepository.create({
          user_id: savedUser.id,
          qualifications,
          specializations,
          experience
        });
        await this.doctorProfileRepository.save(doctorProfile);
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = savedUser;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: 'Failed to register user' });
    }
  };

  loginUser = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      res.status(500).json({ error: 'Failed to login' });
    }
  };

  getAllUsers = async (req: Request, res: Response) => {
    try {
      const users = await this.userRepository.find({
        select: ['id', 'name', 'email', 'role', 'gender', 'dob', 'unique_id', 'created_at']
      });
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  };

  getUserById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = await this.userRepository.findOne({ 
        where: { id },
        select: ['id', 'name', 'email', 'role', 'gender', 'dob', 'unique_id', 'created_at']
      });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  };

  updateUser = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = await this.userRepository.findOne({ where: { id } });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      this.userRepository.merge(user, req.body);
      const result = await this.userRepository.save(user);
      
      const { password: _, ...userWithoutPassword } = result;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update user' });
    }
  };

  deleteUser = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = await this.userRepository.findOne({ where: { id } });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      await this.userRepository.remove(user);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete user' });
    }
  };

  getAllDoctors = async (req: Request, res: Response) => {
    try {
      const doctors = await this.userRepository.find({
        where: { role: UserRole.DOCTOR },
        relations: ['doctorProfile'],
        select: ['id', 'name', 'email', 'role', 'gender', 'dob', 'created_at']
      });
      res.json(doctors);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch doctors' });
    }
  };

  getAllPatients = async (req: Request, res: Response) => {
    try {
      const patients = await this.userRepository.find({
        where: { role: UserRole.PATIENT },
        select: ['id', 'name', 'email', 'role', 'gender', 'dob', 'unique_id', 'created_at']
      });
      res.json(patients);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch patients' });
    }
  };

  getAllAdmins = async (req: Request, res: Response) => {
    try {
      const admins = await this.userRepository.find({
        where: { role: UserRole.HOSPITAL_ADMIN },
        select: ['id', 'name', 'email', 'role', 'created_at']
      });
      res.json(admins);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch admins' });
    }
  };
} 