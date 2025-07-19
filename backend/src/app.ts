import express from 'express';
import cors from 'cors';
import 'reflect-metadata';
import swaggerUi from 'swagger-ui-express';
import { specs } from './config/swagger';
import { AppDataSource } from './config/data-source';
import routes from './routes';

const app = express();

app.use(cors());
app.use(express.json());

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Hospital Management System API Documentation'
}));

app.use('/api', routes); // All routes go under /api/

export default app; 