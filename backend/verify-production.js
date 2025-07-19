#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Hospital Management System - Production Verification\n');

// Colors for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkNodeVersion() {
  try {
    const version = process.version;
    const majorVersion = parseInt(version.slice(1).split('.')[0]);
    
    log('📋 Checking Node.js version...', 'blue');
    log(`   Current version: ${version}`, majorVersion >= 18 ? 'green' : 'red');
    
    if (majorVersion >= 22) {
      log('   ✅ Node.js 22+ detected - Excellent for production!', 'green');
    } else if (majorVersion >= 18) {
      log('   ✅ Node.js 18+ detected - Compatible with production', 'green');
    } else {
      log('   ❌ Node.js version too old. Please upgrade to 18+', 'red');
      return false;
    }
    return true;
  } catch (error) {
    log('   ❌ Could not determine Node.js version', 'red');
    return false;
  }
}

function checkNpmVersion() {
  try {
    const version = execSync('npm --version', { encoding: 'utf8' }).trim();
    const majorVersion = parseInt(version.split('.')[0]);
    
    log('📦 Checking npm version...', 'blue');
    log(`   Current version: ${version}`, majorVersion >= 8 ? 'green' : 'red');
    
    if (majorVersion >= 8) {
      log('   ✅ npm version compatible', 'green');
      return true;
    } else {
      log('   ❌ npm version too old. Please upgrade to 8+', 'red');
      return false;
    }
  } catch (error) {
    log('   ❌ Could not determine npm version', 'red');
    return false;
  }
}

function checkDependencies() {
  try {
    log('📚 Checking dependencies...', 'blue');
    
    if (!fs.existsSync('package.json')) {
      log('   ❌ package.json not found', 'red');
      return false;
    }
    
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const dependencies = packageJson.dependencies || {};
    const devDependencies = packageJson.devDependencies || {};
    
    log(`   Found ${Object.keys(dependencies).length} production dependencies`, 'green');
    log(`   Found ${Object.keys(devDependencies).length} development dependencies`, 'green');
    
    // Check for critical dependencies
    const criticalDeps = ['express', 'typeorm', 'pg', 'bcryptjs', 'jsonwebtoken'];
    const missingDeps = criticalDeps.filter(dep => !dependencies[dep]);
    
    if (missingDeps.length > 0) {
      log(`   ❌ Missing critical dependencies: ${missingDeps.join(', ')}`, 'red');
      return false;
    } else {
      log('   ✅ All critical dependencies present', 'green');
      return true;
    }
  } catch (error) {
    log('   ❌ Error checking dependencies', 'red');
    return false;
  }
}

function checkBuildFiles() {
  try {
    log('🔨 Checking build files...', 'blue');
    
    if (!fs.existsSync('build')) {
      log('   ⚠️  Build directory not found. Run "npm run build" first', 'yellow');
      return false;
    }
    
    if (!fs.existsSync('build/server.js')) {
      log('   ❌ build/server.js not found', 'red');
      return false;
    }
    
    log('   ✅ Build files present', 'green');
    return true;
  } catch (error) {
    log('   ❌ Error checking build files', 'red');
    return false;
  }
}

function checkEnvironmentFile() {
  try {
    log('⚙️  Checking environment configuration...', 'blue');
    
    if (!fs.existsSync('.env')) {
      log('   ⚠️  .env file not found. Please create one from env.example', 'yellow');
      return false;
    }
    
    const envContent = fs.readFileSync('.env', 'utf8');
    const requiredVars = [
      'POSTGRES_HOST',
      'POSTGRES_USER',
      'POSTGRES_PASSWORD',
      'POSTGRES_DB',
      'JWT_SECRET'
    ];
    
    const missingVars = requiredVars.filter(varName => !envContent.includes(varName));
    
    if (missingVars.length > 0) {
      log(`   ❌ Missing environment variables: ${missingVars.join(', ')}`, 'red');
      return false;
    } else {
      log('   ✅ Environment file configured', 'green');
      return true;
    }
  } catch (error) {
    log('   ❌ Error checking environment file', 'red');
    return false;
  }
}

function checkPM2() {
  try {
    log('🚀 Checking PM2...', 'blue');
    
    const pm2Version = execSync('pm2 --version', { encoding: 'utf8' }).trim();
    log(`   PM2 version: ${pm2Version}`, 'green');
    log('   ✅ PM2 is installed', 'green');
    return true;
  } catch (error) {
    log('   ❌ PM2 not found. Install with: npm install -g pm2', 'red');
    return false;
  }
}

function checkNginx() {
  try {
    log('🌐 Checking Nginx...', 'blue');
    
    const nginxVersion = execSync('nginx -v 2>&1', { encoding: 'utf8' }).trim();
    log(`   Nginx version: ${nginxVersion}`, 'green');
    log('   ✅ Nginx is installed', 'green');
    return true;
  } catch (error) {
    log('   ⚠️  Nginx not found or not accessible', 'yellow');
    return false;
  }
}

function checkPostgreSQL() {
  try {
    log('🗄️  Checking PostgreSQL...', 'blue');
    
    const psqlVersion = execSync('psql --version', { encoding: 'utf8' }).trim();
    log(`   PostgreSQL version: ${psqlVersion}`, 'green');
    log('   ✅ PostgreSQL is installed', 'green');
    return true;
  } catch (error) {
    log('   ⚠️  PostgreSQL not found or not accessible', 'yellow');
    return false;
  }
}

// Run all checks
const checks = [
  checkNodeVersion,
  checkNpmVersion,
  checkDependencies,
  checkBuildFiles,
  checkEnvironmentFile,
  checkPM2,
  checkNginx,
  checkPostgreSQL
];

let passedChecks = 0;
let totalChecks = checks.length;

checks.forEach(check => {
  if (check()) {
    passedChecks++;
  }
  console.log('');
});

// Summary
log('\n📊 Verification Summary:', 'blue');
log(`   Passed: ${passedChecks}/${totalChecks} checks`, passedChecks === totalChecks ? 'green' : 'yellow');

if (passedChecks === totalChecks) {
  log('\n🎉 All checks passed! Your system is ready for production deployment.', 'green');
  log('\n📋 Next steps:', 'blue');
  log('   1. Ensure your .env file is properly configured for production');
  log('   2. Run: npm run pm2:start:prod');
  log('   3. Configure nginx with the provided configuration');
  log('   4. Set up SSL certificate with Let\'s Encrypt');
} else {
  log('\n⚠️  Some checks failed. Please address the issues above before deploying.', 'yellow');
}

console.log(''); 