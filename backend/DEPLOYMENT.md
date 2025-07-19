# Hospital Management System - Deployment Guide

## 🚀 Production Deployment on Ubuntu Server

This guide covers deploying the Hospital Management System on an Ubuntu server using nginx as a reverse proxy.

## 📋 Prerequisites

- Ubuntu 20.04+ server
- Node.js 18+ (22+ recommended) installed
- PostgreSQL 13+ installed
- Nginx installed
- PM2 for process management
- SSL certificate (Let's Encrypt recommended)

## 🏗️ Server Setup

### 1. Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Node.js
```bash
# For Node.js 22 (recommended)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Or for Node.js 18 (minimum required)
# curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
# sudo apt-get install -y nodejs
```

### 3. Install PostgreSQL
```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 4. Install Nginx
```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 5. Install PM2
```bash
sudo npm install -g pm2
```

## 🗄️ Database Setup

### 1. Create Database User
```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE hospital_management;
CREATE USER hms_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE hospital_management TO hms_user;
\q
```

### 2. Configure PostgreSQL
```bash
sudo nano /etc/postgresql/13/main/postgresql.conf
```

Add/modify:
```
listen_addresses = 'localhost'
port = 5432
```

```bash
sudo nano /etc/postgresql/13/main/pg_hba.conf
```

Add:
```
local   hospital_management   hms_user                     md5
```

Restart PostgreSQL:
```bash
sudo systemctl restart postgresql
```

## 📁 Application Deployment

### 1. Create Application Directory
```bash
sudo mkdir -p /var/www/hms
sudo chown $USER:$USER /var/www/hms
```

### 2. Clone Repository
```bash
cd /var/www/hms
git clone <your-repository-url> .
```

### 3. Install Dependencies
```bash
cd backend
npm install
npm run build
```

### 4. Environment Configuration
```bash
cp env.example .env
nano .env
```

Production `.env` configuration:
```env
PORT=5000

# Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=hms_user
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=hospital_management

# Database Options (Production)
DB_SYNCHRONIZE=false
DB_LOGGING=false

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-for-production

# Environment
NODE_ENV=production
```

### 5. PM2 Configuration
Create `ecosystem.config.js` in the backend directory:

```javascript
module.exports = {
  apps: [{
    name: 'hms-backend',
    script: 'build/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

### 6. Start Application
```bash
mkdir logs
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 🌐 Nginx Configuration

### 1. Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/hms
```

```nginx
# Frontend Configuration (hms.srikanthkandi.tech)
server {
    listen 80;
    server_name hms.srikanthkandi.tech;
    
    root /var/www/hms/frontend/build;
    index index.html;
    
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

# Backend API Configuration (hms.srikanthkandi.tech/api/)
server {
    listen 80;
    server_name hms.srikanthkandi.tech;
    
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS headers
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization";
    }
    
    # API Documentation
    location /api-docs {
        proxy_pass http://localhost:5000/api-docs;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Health check
    location /api/health {
        proxy_pass http://localhost:5000/api/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 2. Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/hms /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🔒 SSL Configuration (Let's Encrypt)

### 1. Install Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 2. Obtain SSL Certificate
```bash
sudo certbot --nginx -d hms.srikanthkandi.tech
```

### 3. Auto-renewal
```bash
sudo crontab -e
```

Add:
```
0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔧 Alternative Subdomain Suggestions

If you prefer different subdomains, here are some options:

### Option 1: Separate Frontend and Backend
- Frontend: `hms.srikanthkandi.tech`
- Backend: `api.hms.srikanthkandi.tech`

### Option 2: Generic Names
- Frontend: `app.srikanthkandi.tech`
- Backend: `api.srikanthkandi.tech`

### Option 3: Medical Theme
- Frontend: `hospital.srikanthkandi.tech`
- Backend: `hospital.srikanthkandi.tech/api`

## 📊 Monitoring and Logs

### 1. PM2 Monitoring
```bash
pm2 monit
pm2 logs hms-backend
```

### 2. Nginx Logs
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 3. Application Logs
```bash
tail -f /var/www/hms/backend/logs/combined.log
```

## 🔄 Database Migrations (Production)

### 1. Create Migration
```bash
cd /var/www/hms/backend
npx typeorm migration:create src/migrations/InitialMigration
```

### 2. Run Migrations
```bash
npx typeorm migration:run -d ormconfig.ts
```

## 🚨 Security Considerations

### 1. Firewall Configuration
```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 2. Database Security
- Use strong passwords
- Limit database access to localhost
- Regular backups
- Keep PostgreSQL updated

### 3. Application Security
- Use environment variables for secrets
- Regular dependency updates
- Implement rate limiting
- Monitor logs for suspicious activity

## 📈 Performance Optimization

### 1. Nginx Optimization
```nginx
# Add to nginx.conf
worker_processes auto;
worker_connections 1024;
keepalive_timeout 65;
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

### 2. Node.js Optimization
- Use PM2 cluster mode
- Implement caching (Redis recommended)
- Database connection pooling
- Static file serving via nginx

## 🔄 Deployment Script

Create `deploy.sh`:

```bash
#!/bin/bash
echo "🚀 Starting deployment..."

# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Build application
npm run build

# Restart PM2
pm2 restart hms-backend

echo "✅ Deployment completed!"
```

Make executable:
```bash
chmod +x deploy.sh
```

## 📞 Support

For deployment issues or questions:
- Email: hello@srikanthkandi.tech
- Check logs: `/var/www/hms/backend/logs/`
- PM2 status: `pm2 status`
- Nginx status: `sudo systemctl status nginx` 