#!/bin/bash

# Hospital Management System Deployment Script
# For Ubuntu Server with Node.js 20, PM2, and Nginx

set -e

echo "🚀 Starting Hospital Management System Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="hms.srikanthkandi.tech"
API_DOMAIN="api.hms.srikanthkandi.tech"
BACKEND_PORT=5000
FRONTEND_PORT=3000

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
print_status "Installing Node.js 20..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    NODE_VERSION=$(node --version)
    print_status "Node.js is already installed: $NODE_VERSION"
fi

# Install PM2 globally
print_status "Installing PM2..."
sudo npm install -g pm2

# Install Nginx
print_status "Installing Nginx..."
sudo apt install -y nginx

# Install Certbot for SSL
print_status "Installing Certbot for SSL certificates..."
sudo apt install -y certbot python3-certbot-nginx

# Create application directory
APP_DIR="/var/www/hms"
print_status "Creating application directory: $APP_DIR"
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

# Deploy Backend
print_status "Deploying Backend..."
cd backend

# Install dependencies
print_status "Installing backend dependencies..."
npm install

# Build the application
print_status "Building backend application..."
npm run build

# Create logs directory
mkdir -p logs

# Start with PM2
print_status "Starting backend with PM2..."
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save
pm2 startup

# Deploy Frontend
print_status "Deploying Frontend..."
cd ../frontend

# Install dependencies
print_status "Installing frontend dependencies..."
npm install

# Build for production
print_status "Building frontend for production..."
npm run build

# Copy build to nginx directory
print_status "Copying frontend build to nginx directory..."
sudo cp -r build/* /var/www/html/

# Configure Nginx
print_status "Configuring Nginx..."

# Create Nginx configuration for frontend
sudo tee /etc/nginx/sites-available/hms-frontend > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN;
    root /var/www/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;

    location / {
        try_files \$uri \$uri/ /index.html;
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
EOF

# Create Nginx configuration for backend API
sudo tee /etc/nginx/sites-available/hms-backend > /dev/null <<EOF
server {
    listen 80;
    server_name $API_DOMAIN;

    location / {
        proxy_pass http://localhost:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
EOF

# Enable sites
sudo ln -sf /etc/nginx/sites-available/hms-frontend /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/hms-backend /etc/nginx/sites-enabled/

# Remove default nginx site
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
print_status "Testing Nginx configuration..."
sudo nginx -t

# Restart Nginx
print_status "Restarting Nginx..."
sudo systemctl restart nginx
sudo systemctl enable nginx

# Configure firewall
print_status "Configuring firewall..."
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
sudo ufw --force enable

# SSL Certificates
print_status "Setting up SSL certificates..."
sudo certbot --nginx -d $DOMAIN -d $API_DOMAIN --non-interactive --agree-tos --email admin@srikanthkandi.tech

# Create environment file for backend
print_status "Creating backend environment file..."
sudo tee /var/www/hms/.env > /dev/null <<EOF
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
CORS_ORIGIN=https://$DOMAIN

# Logging
LOG_LEVEL=info
EOF

# Set proper permissions
sudo chown -R $USER:$USER /var/www/hms
sudo chmod 600 /var/www/hms/.env

# Create systemd service for PM2
print_status "Creating systemd service for PM2..."
sudo tee /etc/systemd/system/pm2-$USER.service > /dev/null <<EOF
[Unit]
Description=PM2 process manager
Documentation=https://pm2.keymetrics.io/
After=network.target

[Service]
Type=forking
User=$USER
WorkingDirectory=/home/$USER
Environment=PATH=/home/$USER/.npm-global/bin:/usr/local/bin:/usr/bin:/bin
Environment=PM2_HOME=/home/$USER/.pm2
PIDFile=/home/$USER/.pm2/pm2.pid
Restart=on-failure

ExecStart=/usr/bin/pm2 resurrect
ExecReload=/usr/bin/pm2 reload all
ExecStop=/usr/bin/pm2 kill

[Install]
WantedBy=multi-user.target
EOF

# Enable and start PM2 service
sudo systemctl enable pm2-$USER
sudo systemctl start pm2-$USER

# Create deployment script
print_status "Creating deployment update script..."
tee update-deploy.sh > /dev/null <<EOF
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
EOF

chmod +x update-deploy.sh

# Create health check script
print_status "Creating health check script..."
tee health-check.sh > /dev/null <<EOF
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
curl -f https://$API_DOMAIN/api/health || echo "❌ Backend API is down"

# Check frontend
echo "🎨 Frontend Status:"
curl -f https://$DOMAIN || echo "❌ Frontend is down"

echo "✅ Health check completed!"
EOF

chmod +x health-check.sh

# Final status
print_status "Deployment completed successfully!"
echo ""
echo "🌐 Frontend: https://$DOMAIN"
echo "🔗 Backend API: https://$API_DOMAIN"
echo "📚 API Documentation: https://$API_DOMAIN/api-docs"
echo "🔍 Health Check: https://$API_DOMAIN/api/health"
echo ""
echo "📋 Useful commands:"
echo "  PM2 Status: pm2 list"
echo "  PM2 Logs: pm2 logs hms-backend"
echo "  PM2 Monitor: pm2 monit"
echo "  Update System: ./update-deploy.sh"
echo "  Health Check: ./health-check.sh"
echo "  Nginx Status: sudo systemctl status nginx"
echo ""
echo "🔒 SSL certificates will auto-renew with Certbot"
echo "📝 Don't forget to update the database configuration in /var/www/hms/.env" 