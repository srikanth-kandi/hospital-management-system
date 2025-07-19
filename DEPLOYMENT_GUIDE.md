# Hospital Management System - Deployment Guide

Complete deployment guide for Ubuntu server with Node.js 20, PM2, Nginx, and PostgreSQL.

## 🎯 **Deployment Overview**

### **Architecture**
- **Frontend**: React.js served by Nginx (https://hms.srikanthkandi.tech)
- **Backend**: Node.js API with PM2 (https://api.hms.srikanthkandi.tech)
- **Database**: PostgreSQL with automated backups
- **SSL**: Let's Encrypt certificates with auto-renewal

### **System Requirements**
- Ubuntu 20.04 LTS or higher
- 2GB RAM minimum (4GB recommended)
- 20GB disk space
- Node.js 20.x
- PostgreSQL 14+

## 🚀 **Quick Deployment**

### **1. Server Preparation**

```bash
# Connect to your Ubuntu server
ssh user@your-server-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git build-essential
```

### **2. Clone Repository**

```bash
# Clone the repository
git clone https://github.com/your-username/hospital-management-system.git
cd hospital-management-system

# Make scripts executable
chmod +x deploy.sh setup-database.sh
```

### **3. Database Setup**

```bash
# Run database setup script
./setup-database.sh
```

### **4. Application Deployment**

```bash
# Run deployment script
./deploy.sh
```

## 📋 **Manual Deployment Steps**

### **Step 1: Install Node.js 20**

```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

### **Step 2: Install PM2**

```bash
# Install PM2 globally
sudo npm install -g pm2

# Verify installation
pm2 --version
```

### **Step 3: Install PostgreSQL**

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### **Step 4: Install Nginx**

```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### **Step 5: Install Certbot**

```bash
# Install Certbot for SSL certificates
sudo apt install -y certbot python3-certbot-nginx
```

## 🗄️ **Database Configuration**

### **Create Database and User**

```bash
# Connect to PostgreSQL as postgres user
sudo -u postgres psql

# Create database user
CREATE USER hms_user WITH PASSWORD 'your_secure_password';

# Create database
CREATE DATABASE hms_db OWNER hms_user;

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE hms_db TO hms_user;
\c hms_db
GRANT ALL ON SCHEMA public TO hms_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO hms_user;

# Exit PostgreSQL
\q
```

### **Environment Configuration**

Create `/var/www/hms/.env`:

```env
NODE_ENV=production
PORT=5000
HOST=0.0.0.0

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=hms_user
DB_PASSWORD=your_secure_password
DB_DATABASE=hms_db

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=https://hms.srikanthkandi.tech

# Logging
LOG_LEVEL=info
```

## 🔧 **Backend Deployment**

### **Build and Deploy Backend**

```bash
cd backend

# Install dependencies
npm install

# Build the application
npm run build

# Create logs directory
mkdir -p logs

# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save
pm2 startup
```

### **PM2 Configuration**

The `ecosystem.config.js` is already configured for production:

```javascript
module.exports = {
  apps: [{
    name: 'hms-backend',
    script: 'build/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000,
      HOST: '0.0.0.0'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    restart_delay: 4000
  }]
};
```

## 🎨 **Frontend Deployment**

### **Build and Deploy Frontend**

```bash
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# Copy build to nginx directory
sudo cp -r build/* /var/www/html/
```

## 🌐 **Nginx Configuration**

### **Frontend Configuration**

Create `/etc/nginx/sites-available/hms-frontend`:

```nginx
server {
    listen 80;
    server_name hms.srikanthkandi.tech;
    root /var/www/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

### **Backend API Configuration**

Create `/etc/nginx/sites-available/hms-backend`:

```nginx
server {
    listen 80;
    server_name api.hms.srikanthkandi.tech;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
```

### **Enable Sites**

```bash
# Enable sites
sudo ln -sf /etc/nginx/sites-available/hms-frontend /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/hms-backend /etc/nginx/sites-enabled/

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## 🔒 **SSL Configuration**

### **Obtain SSL Certificates**

```bash
# Get SSL certificates for both domains
sudo certbot --nginx -d hms.srikanthkandi.tech -d api.hms.srikanthkandi.tech --non-interactive --agree-tos --email admin@srikanthkandi.tech
```

### **Auto-renewal Setup**

```bash
# Test auto-renewal
sudo certbot renew --dry-run

# Certbot creates a cron job automatically
sudo crontab -l | grep certbot
```

## 🔥 **Firewall Configuration**

```bash
# Configure UFW firewall
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
sudo ufw --force enable

# Check status
sudo ufw status
```

## 📊 **Monitoring and Maintenance**

### **PM2 Commands**

```bash
# Check PM2 status
pm2 list

# View logs
pm2 logs hms-backend

# Monitor processes
pm2 monit

# Restart application
pm2 restart hms-backend

# Stop application
pm2 stop hms-backend

# Delete application
pm2 delete hms-backend
```

### **Nginx Commands**

```bash
# Check Nginx status
sudo systemctl status nginx

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### **Database Commands**

```bash
# Connect to database
PGPASSWORD=your_password psql -h localhost -U hms_user -d hms_db

# Backup database
./backup-database.sh

# Restore database
./restore-database.sh backup_file.sql.gz
```

## 🔄 **Update Deployment**

### **Automatic Update Script**

The deployment creates an `update-deploy.sh` script:

```bash
#!/bin/bash

echo "🔄 Updating Hospital Management System..."

# Update backend
cd backend
git pull origin main
npm install
npm run build
pm2 restart hms-backend

# Update frontend
cd ../frontend
git pull origin main
npm install
npm run build
sudo cp -r build/* /var/www/html/

echo "✅ Update completed successfully!"
```

### **Manual Update Process**

```bash
# 1. Pull latest changes
git pull origin main

# 2. Update backend
cd backend
npm install
npm run build
pm2 restart hms-backend

# 3. Update frontend
cd ../frontend
npm install
npm run build
sudo cp -r build/* /var/www/html/

# 4. Check status
pm2 list
sudo systemctl status nginx
```

## 🏥 **Health Check**

### **Health Check Script**

The deployment creates a `health-check.sh` script:

```bash
#!/bin/bash

echo "🏥 Hospital Management System Health Check"

# Check PM2 processes
echo "📊 PM2 Processes:"
pm2 list

# Check Nginx status
echo "🌐 Nginx Status:"
sudo systemctl status nginx --no-pager -l

# Check backend API
echo "🔗 Backend API Health:"
curl -f https://api.hms.srikanthkandi.tech/api/health || echo "❌ Backend API is down"

# Check frontend
echo "🎨 Frontend Status:"
curl -f https://hms.srikanthkandi.tech || echo "❌ Frontend is down"

echo "✅ Health check completed!"
```

### **Manual Health Checks**

```bash
# Check backend API
curl https://api.hms.srikanthkandi.tech/api/health

# Check frontend
curl -I https://hms.srikanthkandi.tech

# Check database connection
PGPASSWORD=your_password psql -h localhost -U hms_user -d hms_db -c "SELECT 1;"
```

## 🚨 **Troubleshooting**

### **Common Issues**

1. **PM2 Process Not Starting**
   ```bash
   # Check logs
   pm2 logs hms-backend
   
   # Check environment
   pm2 env hms-backend
   
   # Restart with fresh environment
   pm2 delete hms-backend
   pm2 start ecosystem.config.js --env production
   ```

2. **Nginx Configuration Errors**
   ```bash
   # Test configuration
   sudo nginx -t
   
   # Check syntax
   sudo nginx -T | grep -A 10 -B 10 "server_name"
   ```

3. **Database Connection Issues**
   ```bash
   # Check PostgreSQL status
   sudo systemctl status postgresql
   
   # Check connection
   PGPASSWORD=your_password psql -h localhost -U hms_user -d hms_db
   
   # Check logs
   sudo tail -f /var/log/postgresql/postgresql-*.log
   ```

4. **SSL Certificate Issues**
   ```bash
   # Check certificate status
   sudo certbot certificates
   
   # Renew certificates
   sudo certbot renew
   
   # Check auto-renewal
   sudo crontab -l | grep certbot
   ```

### **Log Locations**

- **PM2 Logs**: `backend/logs/`
- **Nginx Logs**: `/var/log/nginx/`
- **PostgreSQL Logs**: `/var/log/postgresql/`
- **System Logs**: `/var/log/syslog`

## 📈 **Performance Optimization**

### **Nginx Optimization**

```nginx
# Add to nginx.conf
worker_processes auto;
worker_connections 1024;
keepalive_timeout 65;
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

### **PM2 Optimization**

```javascript
// Update ecosystem.config.js
max_memory_restart: '2G',
node_args: '--max-old-space-size=2048'
```

### **Database Optimization**

```sql
-- PostgreSQL optimizations
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
SELECT pg_reload_conf();
```

## 🔐 **Security Checklist**

- [ ] Firewall configured (UFW)
- [ ] SSL certificates installed
- [ ] Database password is secure
- [ ] JWT secret is strong
- [ ] Environment variables are protected
- [ ] Regular backups are scheduled
- [ ] System updates are automated
- [ ] Log monitoring is in place

## 📞 **Support**

For deployment issues:
1. Check the logs in the locations mentioned above
2. Run the health check script
3. Verify all services are running
4. Check firewall and DNS settings

---

**🎉 Your Hospital Management System is now deployed and ready to use!**

**Frontend**: https://hms.srikanthkandi.tech  
**Backend API**: https://api.hms.srikanthkandi.tech  
**API Documentation**: https://api.hms.srikanthkandi.tech/api-docs 