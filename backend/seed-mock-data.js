#!/usr/bin/env node

require('dotenv').config();
require('ts-node/register');

const { AppDataSource } = require('./src/config/data-source');
const { MockDataService } = require('./src/services/MockDataService');

async function seedMockData() {
  try {
    console.log('🚀 Starting mock data seeding...\n');
    
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('✅ Database connection established\n');
    
    // Create and run mock data service
    const mockDataService = new MockDataService();
    await mockDataService.seedMockData();
    
    console.log('\n🎉 Mock data seeding completed successfully!');
    console.log('\n📋 Sample Login Credentials:');
    console.log('🏥 Hospital Admin: admin@hms.com / admin123');
    console.log('👨‍⚕️ Doctor: sarah.johnson@hms.com / doctor123');
    console.log('👤 Patient: john.smith@example.com / patient123');
    
    console.log('\n🌐 Access Points:');
    console.log('📚 API Documentation: http://localhost:5000/api-docs');
    console.log('🔍 Health Check: http://localhost:5000/api/health');
    
    // Close database connection
    await AppDataSource.destroy();
    console.log('\n✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Error seeding mock data:', error);
    process.exit(1);
  }
}

// Run the seeding
seedMockData(); 