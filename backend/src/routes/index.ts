import { Router } from 'express';
import userRoutes from './userRoutes';
import hospitalRoutes from './hospitalRoutes';
import departmentRoutes from './departmentRoutes';
import doctorRoutes from './doctorRoutes';
import appointmentRoutes from './appointmentRoutes';
import availabilityRoutes from './availabilityRoutes';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Server is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 message:
 *                   type: string
 *                   example: "Hospital Management System API is running"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Hospital Management System API is running',
    timestamp: new Date().toISOString()
  });
});

/**
 * @swagger
 * /docs:
 *   get:
 *     summary: API Documentation
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Redirect to Swagger UI documentation
 */
router.get('/docs', (req, res) => {
  res.redirect('/api-docs');
});

// API routes
router.use('/users', userRoutes);
router.use('/hospitals', hospitalRoutes);
router.use('/departments', departmentRoutes);
router.use('/doctors', doctorRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/availability', availabilityRoutes);

export default router; 