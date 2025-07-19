require('dotenv').config();

import app from './src/app';
import { AppDataSource } from './src/config/data-source';
import { MockDataService } from './src/services/MockDataService';

const PORT = process.env.PORT || 5000;

AppDataSource.initialize()
  .then(async () => {
    console.log('✅ Connected to Database');
    
    // Seed mock data in development
    if (process.env.NODE_ENV === 'development') {
      const mockDataService = new MockDataService();
      await mockDataService.seedMockData();
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`🔍 Health Check: http://localhost:${PORT}/api/health`);
    });
  })
  .catch((error) => console.error('❌ DB connection error:', error)); 